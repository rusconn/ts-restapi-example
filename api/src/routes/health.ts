import { Hono } from "hono";
import { sql } from "kysely";

import { logger } from "../logger.ts";
import type { Env } from "../types.ts";

const app = new Hono<Env>().get("/health", async (c) => {
  type Status = "OK" | "NG";

  const checkDb = async (): Promise<Status> => {
    try {
      await sql`select 1`.execute(c.var.db);
      return "OK";
    } catch (e) {
      logger.error(e, "db-health-error");
      return "NG";
    }
  };

  const checkCache = async (): Promise<Status> => {
    try {
      await c.var.cache.get("hoge");
      return "OK";
    } catch (e) {
      logger.error(e, "cache-health-error");
      return "NG";
    }
  };

  const [db, cache] = await Promise.all([checkDb(), checkCache()]);

  const statuses = { db, cache };
  const code = Object.values(statuses).includes("NG") ? 503 : 200;

  return c.json(statuses, code);
});

export default app;
