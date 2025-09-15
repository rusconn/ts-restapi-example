import { createMiddleware } from "hono/factory";

import type { Env } from "../types.ts";

export const logging = createMiddleware<Env>(async (c, next) => {
  const { method, path } = c.req;
  const { logger, start } = c.var;

  logger.info(
    {
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

  logger.info(
    {
      status: c.res.status,
      duration: `${Date.now() - start}ms`,
    },
    "response-log",
  );
});
