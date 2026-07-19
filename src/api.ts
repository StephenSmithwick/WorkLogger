import { Hono } from "hono";
import { db } from "@/db";
import { eq, sql } from "drizzle-orm";
import { label, worklog, worklog_label } from "@/schema";
import { relations } from "../drizzle/relations";

type DB = ReturnType<typeof db>;
type Label = typeof label.$inferInsert;
type WorklogLabel = typeof worklog_label.$inferInsert;

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
  const result = await c.var.db.query.worklog.findMany({
    with: { labels: { columns: { name: true, id: true } } },
  });
  return c.json(result);
});

api.delete("/worklog", async (c) => {
  const {id} = await c.req.json();
  const deletedWorklogLabel = await c.var.db.delete(worklog_label)
    .where(eq(worklog_label.worklogId, id));
  const deletedWorklog = await c.var.db.delete(worklog)
    .where(eq(worklog.id, id))
    .returning();
  return c.json(deletedWorklog);
});

api.post("/worklog", async (c) => {
  const newWorklog = await c.req.json();
  const labelIds = await ensureLabelsExist(c.var.db, newWorklog.labels);

  const [inserted] = await c.var.db
    .insert(worklog)
    .values({
      time: new Date(newWorklog.time),
      duration: newWorklog.duration,
      name: newWorklog.name,
      notes: newWorklog.notes,
    })
    .returning();

  if (labelIds.length > 0) {
    const worklogId = inserted.id;
    const labelsConnections: WorklogLabel[] = labelIds.map((labelId) => ({
      worklogId,
      labelId,
    }));
    await c.var.db.insert(worklog_label).values(labelsConnections);
  }

  return c.json({ success: true, worklog: inserted });
});

async function ensureLabelsExist(db: DB, labels: Label[]): Promise<number[]> {
  const { existing: existingLabels = [], new: newLabels = [] } = Object.groupBy(
    labels,
    (l) => (l.id ? "existing" : "new"),
  );

  const createdLabels =
    newLabels.length > 0
      ? await db
          .insert(label)
          .values(newLabels)
          .returning({ id: label.id })
      : [];

  return [...existingLabels, ...createdLabels].map((label) => label.id!);
}

export type AppType = typeof api;
