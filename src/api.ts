import { Hono } from "hono";
import { db } from "@/db";
import { eq, sql } from "drizzle-orm";
import { label, worklog, worklog_label } from "@/schema";

type Bindings = {
  DATABASE_URL: string;
};
export const api = new Hono<{ Bindings: Bindings }>();

api.get("/label", async (c) => {
  try {
    const result = await db(c.env).select().from(label);
    return c.json(result);
  } catch (error) {
    console.error("Database query failed:", error);
    return c.text("Failed to connect to database", 500);
  }
});

api.get("/worklog", async (c) => {
  try {
    const result = await db(c.env)
      .select({
        id: worklog.id,
        name: worklog.name,
        notes: worklog.notes,
        time: worklog.time,
        duration: worklog.duration,
        labels: sql<
          Label[]
        >`JSON_AGG(JSON_BUILD_OBJECT('name', ${label.name}))`,
      })
      .from(worklog)
      .leftJoin(worklog_label, eq(worklog.id, worklog_label.worklogId))
      .leftJoin(label, eq(worklog_label.labelId, label.id))
      .groupBy(worklog.id);
    return c.json(result);
  } catch (error) {
    console.error("Database query failed:", error);
    return c.text("Failed to connect to database", 500);
  }
});

async function ensureLabelsExist(c, labels: Label[]): Promise<number[]> {
  const { existing: existingLabels = [], new: newLabels = [] } = Object.groupBy(
    labels,
    (l) => (l.id ? "existing" : "new"),
  );

  const createdLabels =
    newLabels.length > 0
      ? await db(c.env)
          .insert(label)
          .values(newLabels)
          .returning({ id: label.id })
      : [];

  return [...existingLabels, ...createdLabels].map((label) => label.id!);
}

api.post("/worklog", async (c) => {
  const newWorklog = await c.req.json();

  try {
    const labelIds = await ensureLabelsExist(c, newWorklog.labels);

    const [inserted] = await db(c.env)
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
      await db(c.env).insert(worklog_label).values(labelsConnections);
    }

    return c.json({ success: true, worklog: inserted });
  } catch (error) {
    console.error("Database query failed:", error);
    return c.text("Failed to save worklog entry", 500);
  }
});

export type AppType = typeof api;
