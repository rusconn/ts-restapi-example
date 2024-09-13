import { createMiddleware } from "hono/factory";

import { AuthorAPI, AuthorBookAPI, BookAPI } from "../datasources/_mod.ts";
import type { Env } from "../types.ts";

export const api = createMiddleware<Env>(async (c, next) => {
  c.set("api", {
    author: new AuthorAPI(c.var._db),
    authorBook: new AuthorBookAPI(c.var._db),
    book: new BookAPI(c.var._db),
  });
  await next();
});
