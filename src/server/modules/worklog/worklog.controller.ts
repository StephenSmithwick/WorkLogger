import { Hono } from "hono"
import { eq, sql } from "drizzle-orm"
import { db } from '@/db';
import { worklog, worklog_label, label } from '@/schema';

type Label = typeof label.$inferInsert;
type WorklogLabel = typeof worklog_label.$inferInsert;

export const worklogController = new Hono()

worklogController.get("/", async (c) => {
  try {
      const result = await db.select({
        id: worklog.id,
        name: worklog.name,
        notes: worklog.notes,
        time: worklog.time,
        duration: worklog.duration,
        labels: sql<Label[]>`JSON_AGG(JSON_BUILD_OBJECT('name', ${label.name}))`
      }).from(worklog)
          .leftJoin(worklog_label, eq(worklog.id, worklog_label.worklogId))
          .leftJoin(label, eq(worklog_label.labelId, label.id))
          .groupBy(worklog.id);
      return c.json(result);
    } catch (error) {
      console.error('Database query failed:', error);
      return c.text('Failed to connect to database', 500);
    }
})

async function ensureLabelsExist(labels: Label[]) : Promise<number[]> {
  const [existingLabels, newLabels] = labels.reduce<[Label[], Label[]]>(
    (acc, element) => {
      acc[element.id ? 0 : 1].push(element);
      return acc;
    }, [[], []]);

  const createdLabels = newLabels.length > 0
    ? await db.insert(label).values(newLabels).returning({ id: label.id })
    : [];

  return [...existingLabels, ...createdLabels].map(label => label.id!);
}


worklogController.post('/', async (c) => {
  const newWorklog = await c.req.json();
  // console.log('New Worklog', Bun.inspect(newWorklog, { depth: 5, colors: true }))

  try {
    const labelIds = await ensureLabelsExist(newWorklog.labels);

    const [inserted] = await db.insert(worklog).values({
      time: new Date(newWorklog.time),
      duration: newWorklog.duration,
      name: newWorklog.name,
      notes: newWorklog.notes,
    }).returning();

    if (labelIds.length > 0) {
      const worklogId = inserted.id;
      const labelsConnections : WorklogLabel[] = labelIds.map(labelId => ({ worklogId, labelId }));
      await db.insert(worklog_label).values(labelsConnections);
    }

    return c.json({ success: true, worklog: inserted });
  } catch (error) {
    console.error('Database query failed:', error);
    return c.text('Failed to save worklog entry', 500);
  }
});
