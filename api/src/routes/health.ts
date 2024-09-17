import { Hono } from "hono";

import { logger } from "../logger.ts";
import type { Env } from "../types.ts";

const app = new Hono<Env>().get("/health", async (c) => {
  type Status = "OK" | "NG";

  let db: Status = "OK";
  try {
    await c.var.api.health.check();
  } catch (e) {
    logger.error(e, "db-health-error");
    db = "NG";
  }

  const statuses = { db };
  const code = Object.values(statuses).includes("NG") ? 503 : 200;

  return c.json(statuses, code);
});

export default app;
