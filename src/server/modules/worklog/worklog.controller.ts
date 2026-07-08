import { Hono } from "hono"
import { eq, sql } from "drizzle-orm"
import { db } from '@/db';
import { worklog, worklog_label, label } from '@/schema';

type WorkLog = typeof worklog.$inferInsert;
type Label = typeof label.$inferInsert;
type WorklogLabel = typeof worklog_label.$inferInsert;

export const worklogController = new Hono()

worklogController.get("/", async (c) => {
  try {
      const result = await db.select({
        name: worklog.name,
        notes: worklog.notes,
        time: worklog.time,
        duration: worklog.duration,
        labels: sql<Label[]>`JSON_AGG(JSON_BUILD_OBJECT('name', ${label.name}))`
      }).from(worklog)
          .leftJoin(worklog_label, eq(worklog.id, worklog_label.worklogId))
          .leftJoin(label, eq(worklog_label.labelId, label.id))
          .groupBy(worklog.name, worklog.notes, worklog.time, worklog.duration);
      // console.log(Bun.inspect(result, { depth: 5, colors: true }))
      return c.json(result);
    } catch (error) {
      console.error('Database query failed:', error);
      return c.text('Failed to connect to database', 500);
    }
})

async function ensureLabelsExist(labels: Label[]) : Promise<Number[]> {
  const [existingLabels, newLabels] = labels.reduce<[Label[], Label[]]>(
    (acc, element) => {
      acc[element.id ? 0 : 1].push(element);
      return acc;
    }, [[], []]);
  console.log('newLabels', Bun.inspect(newLabels, { depth: 5, colors: true }))
  const result = await db.insert(label)
    .values(newLabels)
    .returning({ id: label.id });

  return [...existingLabels, ...result].map(label => label.id!);
}


worklogController.post('/', async (c) => {
  const newWorklog = await c.req.json();
  console.log('newWorklog', Bun.inspect(newWorklog, { depth: 5, colors: true }))

  try {
    const labelIds = await ensureLabelsExist(newWorklog.labels);
    console.log('labelIds', Bun.inspect(labelIds, { depth: 5, colors: true }))

    const [inserted] = await db.insert(worklog).values({
      time: new Date(newWorklog.time),
      duration: newWorklog.duration,
      name: newWorklog.name,
      notes: newWorklog.notes,
    }).returning(worklog.$inferSelect);

    if (labelIds.length > 0) {
      const worklogId = inserted.id as Number;
      const labelsConnections = labelIds.map(labelId => ({ worklogId, labelId })) as WorklogLabel;
      console.log('labelsConnections', Bun.inspect(labelsConnections, { depth: 5, colors: true }))
      await db.insert(worklog_label).values(labelsConnections);
    }

    return c.json({ success: true, worklog: inserted });
  } catch (error) {
    console.error('Database query failed:', error);
    return c.text('Failed to save worklog entry', 500);
  }
});
