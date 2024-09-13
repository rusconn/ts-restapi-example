import { Hono } from "hono";
import { requestId } from "hono/request-id";

import { logger as log } from "./logger.ts";
import { api, logger, rawDb, start } from "./middlewares/_mod.ts";
import { authors, authorsbooks, books, health } from "./routes/mod.ts";
import type { Env } from "./types.ts";

const app = new Hono<Env>()
  // contexts
  .use(requestId())
  .use(start)
  .use(rawDb)
  .use(api)
  // logs
  .use(logger)
  // routes
  .route("", authors)
  .route("", authorsbooks)
  .route("", books)
  .route("", health)
  // error handlings
  .notFound((c) => c.json("Not Found", 404))
  .onError((err, c) => {
    const { requestId } = c.var;
    log.error({ requestId, err }, "error-log");
    return c.json("Internal Server Error", 500);
  });

// for Hono's RPC
export type API = typeof app;

export default app;
