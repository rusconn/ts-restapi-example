import { createMiddleware } from "hono/factory";

import { logger as appLogger } from "../logger.ts";
import type { Env } from "../types.ts";

export const logger = createMiddleware<Env>(async (c, next) => {
  const { requestId } = c.var;
  c.set("logger", appLogger.child({ requestId }));
  await next();
});
