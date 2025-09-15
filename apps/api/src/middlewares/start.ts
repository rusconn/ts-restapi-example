import { createMiddleware } from "hono/factory";

import type { Env } from "../types.ts";

export const start = createMiddleware<Env>(async (c, next) => {
  c.set("start", Date.now());
  await next();
});
