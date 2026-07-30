import { Hono } from "hono";
import { db } from "@/db";
import { eq, sql } from "drizzle-orm";
import { label, worklog, worklog_label } from "@/schema";

export type Label = typeof label.$inferSelect;

export interface WorklogResponse extends Omit<Worklog, "time"> {
  time: string;
  labels: Label[];
}

type WorklogLabel = typeof worklog_label.$inferSelect;
type Worklog = typeof worklog.$inferSelect;
type WorklogInsert = typeof worklog.$inferInsert;

type DB = ReturnType<typeof db>;

export const api = new Hono<{
  Bindings: CloudflareBindings;
  Variables: { db: DB };
}>();

api.use("*", async (c, next) => {
  c.set("db", db(c.env));
  await next();
});

api.onError((err, c) => {
  console.error("Database query failed:", err);
  return c.text("Failed to connect to database", 500);
});

api.get("/label", async (c) => {
  const result = await c.var.db.select().from(label);
  return c.json(result);
});

api.get("/worklog", async (c) => {
  const from = c.req.query("from");
  const to = c.req.query("to");
  const time = {
    gte: from ? new Date(from) : undefined,
    lte: to ? new Date(to) : undefined,
  };

  const result = await c.var.db.query.worklog.findMany({
    where: from || to ? { time } : undefined,
    with: { labels: { columns: { name: true, id: true } } },
  });
  return c.json(result);
});

api.delete("/worklog", async (c) => {
  const { id } = await c.req.json();
  await c.var.db.delete(worklog_label).where(eq(worklog_label.worklogId, id));
  const deletedWorklog = await c.var.db
    .delete(worklog)
    .where(eq(worklog.id, id))
    .returning();
  return c.json(deletedWorklog);
});

api.post("/worklog", async (c) => {
  const newWorklog = await c.req.json();
  const labelIds = await ensureLabelsExist(c.var.db, newWorklog.labels);
  const action = newWorklog.id ? "update" : "insert";
  const values = {
    time: new Date(newWorklog.time),
    duration: newWorklog.duration,
    name: newWorklog.name,
    notes: newWorklog.notes,
  };
  const upserted = newWorklog.id
    ? await updateWorklog(c.var.db, newWorklog.id, values)
    : await insertWorklog(c.var.db, values);
  const worklogId = upserted.id;
  await c.var.db
    .delete(worklog_label)
    .where(eq(worklog_label.worklogId, worklogId));
  if (labelIds.length > 0) {
    const labelsConnections: WorklogLabel[] = labelIds.map((labelId) => ({
      worklogId,
      labelId,
    }));
    await c.var.db.insert(worklog_label).values(labelsConnections);
  }

  return c.json({ success: true, action, worklog: upserted });
});

async function insertWorklog(db: DB, values: WorklogInsert): Promise<Worklog> {
  const [inserted] = await db.insert(worklog).values(values).returning();
  return inserted;
}

async function updateWorklog(
  db: DB,
  id: number,
  values: WorklogInsert,
): Promise<Worklog> {
  const [updated] = await db
    .update(worklog)
    .set(values)
    .where(eq(worklog.id, id))
    .returning();
  return updated;
}

async function ensureLabelsExist(db: DB, labels: Label[]): Promise<number[]> {
  const { existing: existingLabels = [], new: newLabels = [] } = Object.groupBy(
    labels,
    (l) => (l.id ? "existing" : "new"),
  );

  const createdLabels =
    newLabels.length > 0
      ? await db.insert(label).values(newLabels).returning({ id: label.id })
      : [];

  return [...existingLabels, ...createdLabels].map((label) => label.id!);
}

export type AppType = typeof api;
