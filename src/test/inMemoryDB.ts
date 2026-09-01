import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { relations } from "@/../drizzle/relations";
import { type LoadDB } from "@/db";
import { PGlite } from "@electric-sql/pglite";

export const inMemoryDB: LoadDB = async () => {
  const client = new PGlite();
  const db = drizzle({ client, relations });

  await migrate(db, {
    migrationsFolder: "./drizzle",
  });

  return db;
};
