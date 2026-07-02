import { Hono } from "hono"
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { db } from '../../../db';
import { worklog } from '../../../schema';


export const todosController = new Hono().get("/", async (c) => {
  try {
      const result = await db.select().from(worklog);
      return c.json(result);
    } catch (error) {
      console.error('Database query failed:', error);
      return c.text('Failed to connect to database', 500);
    }
})
