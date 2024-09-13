import { createMiddleware } from "hono/factory";

import { logger as log } from "../logger.ts";
import type { Env } from "../types.ts";

export const logger = createMiddleware<Env>(async (c, next) => {
  const { method, path } = c.req;
  const { requestId, start } = c.var;

  log.info(
    {
      requestId,
      req: `${method} ${path}`,
      ...(method === "GET" && {
        queries: c.req.queries(),
      }),
      ...((method === "POST" || method === "PATCH") && {
        json: await c.req.json(),
      }),
    },
    "request-log",
  );

  await next();

  log.info(
    {
      requestId,
      status: c.res.status,
      duration: `${Date.now() - start}ms`,
    },
    "response-log",
  );
});
