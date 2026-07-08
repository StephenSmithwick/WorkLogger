import { Hono } from "hono"
import { neon } from '@neondatabase/serverless'
import { db } from '@/db';
import { label } from '@/schema';

type AggregatedLabels = typeof label.$inferSelect;

export const labelController = new Hono()

labelController.get("/", async (c) => {
  try {
      const result = await db.select().from(label)
      return c.json(result);
    } catch (error) {
      console.error('Database query failed:', error);
      return c.text('Failed to connect to database', 500);
    }
})
