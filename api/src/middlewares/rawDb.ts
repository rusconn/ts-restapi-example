import { createMiddleware } from "hono/factory";

import { db } from "../db/mod.ts";
import type { Env } from "../types.ts";

export const rawDb = createMiddleware<Env>(async (c, next) => {
  c.set("_db", db);
  await next();
});
