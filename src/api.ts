import { Hono, MiddlewareHandler } from "hono";
import { db, type DB } from "@/db";
import { eq, and } from "drizzle-orm";
import { label, worklog, worklog_label } from "@/schema";
import { requireAuthCookie, authUser, type User } from "@/security";
import { NeonDbError } from "@neondatabase/serverless";
import { HTTPException } from "hono/http-exception";

export interface LabelData extends Omit<Label, "user"> {}

export interface WorklogData extends Omit<Worklog, "time" | "user"> {
  time: string;
  labels: LabelData[];
}

type Label = typeof label.$inferSelect;
type WorklogLabel = typeof worklog_label.$inferSelect;
type Worklog = typeof worklog.$inferSelect;
type WorklogInsert = typeof worklog.$inferInsert;

const dbInContext: MiddlewareHandler = async (c, next) => {
  c.set("db", db(c.env));
  await next();
};

export const api = new Hono<{
  Bindings: CloudflareBindings;
  Variables: { db: DB };
}>()
  .use(requireAuthCookie)
  .use(dbInContext)
  .onError((err, c) => {
    if (err instanceof HTTPException) {
      return err.getResponse();
    } else if (err instanceof NeonDbError) {
      console.error("Database query failed:", err);
      return c.json({ message: "Failed to connect to database" }, 500);
    }
    console.error(err);
    return c.text("Internal Server Error", 500);
  })
  .get("/label", async (c) => {
    const result = await c.var.db
      .select()
      .from(label)
      .where(eq(label.user, authUser(c).name));
    return c.json(result);
  })
  .get("/worklog", async (c) => {
    const from = c.req.query("from");
    const to = c.req.query("to");
    const time = {
      gte: from ? new Date(from) : undefined,
      lte: to ? new Date(to) : undefined,
    };

    const result = await c.var.db.query.worklog.findMany({
      where: { ...(from && to && { time }), user: { eq: authUser(c).name } },
      with: { labels: { columns: { name: true, id: true } } },
    });
    return c.json(result);
  })
  .delete("/worklog", async (c) => {
    const { id } = await c.req.json();
    await c.var.db.delete(worklog_label).where(eq(worklog_label.worklogId, id));
    const deletedWorklog = await c.var.db
      .delete(worklog)
      .where(and(eq(worklog.id, id), eq(worklog.user, authUser(c).name)))
      .returning();
    return c.json(deletedWorklog);
  })
  .post("/worklog", async (c) => {
    const user = authUser(c);
    const newWorklog = await c.req.json();
    const { labelIds, createdLabels } = await ensureLabelsExist(
      c.var.db,
      newWorklog.labels,
      user,
    );
    const action = newWorklog.id ? "update" : "insert";
    const values = {
      user: user.name,
      time: new Date(newWorklog.time),
      duration: newWorklog.duration,
      name: newWorklog.name,
      notes: newWorklog.notes,
    };
    const upserted = newWorklog.id
      ? await updateWorklog(c.var.db, newWorklog.id, user, values)
      : await insertWorklog(c.var.db, values);
    if (!upserted) return c.json({ error: "Worklog not found" }, 404);
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

    return c.json({ success: true, action, worklog: upserted, createdLabels });
  });

async function insertWorklog(db: DB, values: WorklogInsert): Promise<Worklog> {
  const [inserted] = await db.insert(worklog).values(values).returning();
  console.log("inserted", inserted);
  return inserted;
}

async function updateWorklog(
  db: DB,
  id: number,
  authUser: User,
  values: WorklogInsert,
): Promise<Worklog> {
  const [updated] = await db
    .update(worklog)
    .set(values)
    .where(and(eq(worklog.id, id), eq(worklog.user, authUser.name)))
    .returning();
  return updated;
}

async function ensureLabelsExist(
  db: DB,
  labels: Label[],
  authUser: User,
): Promise<{ labelIds: number[]; createdLabels: Label[] }> {
  const { existing: existingLabels = [], new: newLabels = [] } = Object.groupBy(
    labels,
    (l) => (l.id ? "existing" : "new"),
  );

  const createdLabels: Label[] =
    newLabels.length > 0
      ? await db
          .insert(label)
          .values(newLabels.map((label) => ({ ...label, user: authUser.name })))
          .returning()
      : [];

  return {
    labelIds: [...existingLabels, ...createdLabels].map((label) => label.id!),
    createdLabels,
  };
}

export type AppType = typeof api;
