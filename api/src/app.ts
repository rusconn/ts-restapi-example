import { Hono } from "hono";
import { requestId } from "hono/request-id";

import { notFound } from "./errorhandlers/notFound.ts";
import { onError } from "./errorhandlers/onError.ts";
import { api } from "./middlewares/api.ts";
import { logger } from "./middlewares/logger.ts";
import { logging } from "./middlewares/logging.ts";
import { rawDb } from "./middlewares/rawDb.ts";
import { start } from "./middlewares/start.ts";
import authors from "./routes/authors/_mod.ts";
import authorsbooks from "./routes/authorsbooks/_mod.ts";
import books from "./routes/books/_mod.ts";
import health from "./routes/health.ts";
import type { Env } from "./types.ts";

const app = new Hono<Env>()
  // contexts
  .use(start)
  .use(requestId())
  .use(logger)
  .use(rawDb)
  .use(api)
  // loggings
  .use(logging)
  // routes
  .route("/", authors)
  .route("/", authorsbooks)
  .route("/", books)
  .route("/", health)
  // error handlings
  .notFound(notFound)
  .onError(onError);

// for Hono's RPC
export type API = typeof app;

export default app;
