import { Hono } from "hono"
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq, sql } from "drizzle-orm"
import { db } from '../../../db';
import { worklog, worklog_label, label } from '../../../schema';
import { duration } from "drizzle-orm/gel-core";

type AggregatedLabels = typeof label.$inferSelect;

export const worklogController = new Hono()

worklogController.get("/", async (c) => {
  try {
      const result = await db.select({
        name: worklog.name,
        notes: worklog.notes,
        time: worklog.time,
        duration: worklog.duration,
        labels: sql<AggregatedLabels[]>`JSON_AGG(JSON_BUILD_OBJECT('name', ${label.name}))`
      }).from(worklog)
          .leftJoin(worklog_label, eq(worklog.id, worklog_label.worklogId))
          .leftJoin(label, eq(worklog_label.labelId, label.id))
          .groupBy(worklog.name, worklog.notes, worklog.time, worklog.duration);
      console.log(Bun.inspect(result, { depth: 5, colors: true }))
      console.log(Bun.inspect(c.json(result), { depth: 5, colors: true }))
      return c.json(result);
    } catch (error) {
      console.error('Database query failed:', error);
      return c.text('Failed to connect to database', 500);
    }
})
