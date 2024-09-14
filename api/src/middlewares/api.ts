import { createMiddleware } from "hono/factory";

import { AuthorAPI } from "../datasources/author.ts";
import { AuthorBookAPI } from "../datasources/authorBook.ts";
import { BookAPI } from "../datasources/book.ts";
import type { Env } from "../types.ts";

export const api = createMiddleware<Env>(async (c, next) => {
  c.set("api", {
    author: new AuthorAPI(c.var._db),
    authorBook: new AuthorBookAPI(c.var._db),
    book: new BookAPI(c.var._db),
  });
  await next();
});
