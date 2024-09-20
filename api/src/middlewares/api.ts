import { createMiddleware } from "hono/factory";

import { AuthorBookAPI } from "../datasources/author-book.ts";
import { AuthorAPI } from "../datasources/author.ts";
import { BookAPI } from "../datasources/book.ts";
import { HealthAPI } from "../datasources/health.ts";
import type { db } from "../db/client.ts";
import type { Env } from "../types.ts";

export const api = (client: typeof db) =>
  createMiddleware<Env>(async (c, next) => {
    c.set("api", {
      author: new AuthorAPI(client),
      authorBook: new AuthorBookAPI(client),
      book: new BookAPI(client),
      health: new HealthAPI(client),
    });
    await next();
  });
