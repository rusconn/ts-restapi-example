import { randomUUID } from "node:crypto";

import { Hono } from "hono";

import { AuthorAPI, AuthorBookAPI, BookAPI } from "./datasources/_mod.ts";
import { db } from "./db/mod.ts";
import { logger } from "./logger.ts";
import { authors, authorsbooks, books, health } from "./routes/mod.ts";
import type { Env } from "./types.ts";

const app = new Hono<Env>()
  // contexts
  .use(async (c, next) => {
    c.set("start", Date.now());
    c.set("requestId", randomUUID());
    c.set("api", {
      author: new AuthorAPI(db),
      authorBook: new AuthorBookAPI(db),
      book: new BookAPI(db),
    });
    c.set("_db", db);
    await next();
  })
  // logs
  .use(async (c, next) => {
    const { method, path } = c.req;
    const { requestId, start } = c.var;

    logger.info(
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

    logger.info(
      {
        requestId,
        status: c.res.status,
        duration: `${Date.now() - start}ms`,
      },
      "response-log",
    );
  })
  // routes
  .route("", authors)
  .route("", authorsbooks)
  .route("", books)
  .route("", health)
  // error handlings
  .notFound((c) => c.json("Not Found", 404))
  .onError((err, c) => {
    const { requestId } = c.var;
    logger.error({ requestId, err }, "error-log");
    return c.json("Internal Server Error", 500);
  });

// for Hono's RPC
export type API = typeof app;

export default app;
