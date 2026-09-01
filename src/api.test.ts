import { createAPI } from "@/api";
import { inMemoryDB } from "@/test/inMemoryDB";
import { testClient } from "hono/testing";
import { test, expect } from "vitest";
import { randomBytes } from "node:crypto";
import { sign } from "hono/jwt";
import { label, worklog, worklog_label } from "./schema";

const JWT_SECRET = randomBytes(32).toString("hex");

const headers = async (user: string) => ({
  headers: {
    Cookie: `auth_token=${await sign({ sub: user }, JWT_SECRET)}`,
  },
});

async function setup() {
  const db = await inMemoryDB();
  const api = createAPI(async () => db);
  const client = testClient(api, { JWT_SECRET });
  return { db, client };
}

test("Api returns only labels that match user", async () => {
  const { db, client } = await setup();
  await db.insert(label).values([
    { name: "test", user: "dev_user" },
    { name: "test 2", user: "other_user" },
  ]);

  const labels = await client.label.$get({}, await headers("dev_user"));

  expect(await labels.json()).toEqual([
    { id: 1, name: "test", user: "dev_user" },
  ]);
});

test("Api returns only worklogs that match user", async () => {
  const { db, client } = await setup();
  await db.insert(worklog).values([
    {
      user: "dev_user",
      name: "test",
      notes: "notes",
      time: new Date("2020-01-01T12:00"),
      duration: "1 hour",
    },
    {
      user: "another_user",
      name: "test 2",
      notes: "notes",
      time: new Date(),
      duration: "1 hour",
    },
  ]);
  await db.insert(label).values([
    { name: "test", user: "dev_user" },
    { name: "other", user: "other_user" },
  ]);
  await db.insert(worklog_label).values([
    { worklogId: 1, labelId: 1 },
    { worklogId: 1, labelId: 2 },
  ]);

  const labels = await client.worklog.$get({}, await headers("dev_user"));

  expect(await labels.json()).toEqual([
    {
      id: 1,
      user: "dev_user",
      name: "test",
      notes: "notes",
      time: "2020-01-01T19:00:00.000Z",
      duration: "01:00:00",
      labels: [{ id: 1, name: "test" }],
    },
  ]);
});
