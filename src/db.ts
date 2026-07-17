import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { relations } from "@/../drizzle/relations";

export function db(env: { DATABASE_URL: string }) {
  const sql = neon(env.DATABASE_URL);
  return drizzle({ client: sql, relations });
}
