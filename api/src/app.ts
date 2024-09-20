import { Hono } from "hono";
import { requestId } from "hono/request-id";

import { db } from "./db/client.ts";
import { notFound } from "./error-handlers/not-found.ts";
import { onError } from "./error-handlers/on-error.ts";
import { api } from "./middlewares/api.ts";
import { logger } from "./middlewares/logger.ts";
import { logging } from "./middlewares/logging.ts";
import { start } from "./middlewares/start.ts";
import authorBook from "./routes/author-book/_mod.ts";
import author from "./routes/author/_mod.ts";
import book from "./routes/book/_mod.ts";
import health from "./routes/health.ts";
import type { Env } from "./types.ts";

const app = new Hono<Env>()
  // contexts
  .use(start)
  .use(requestId())
  .use(logger)
  .use(api(db))
  // loggings
  .use(logging)
  // routes
  .route("/", author)
  .route("/", authorBook)
  .route("/", book)
  .route("/", health)
  // error handlings
  .notFound(notFound)
  .onError(onError);

// for Hono's RPC
export type API = typeof app;

export default app;
