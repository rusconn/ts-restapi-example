import { Hono } from "hono";

import type { Env } from "../../types.ts";

const app = new Hono<Env>().delete("/authors/:authorId/books/:bookId", async (c) => {
  const { authorId, bookId } = c.req.param();

  const authorBook = await c.var.db
    .deleteFrom("AuthorBook")
    .where("authorId", "=", authorId)
    .where("bookId", "=", bookId)
    .returningAll()
    .executeTakeFirst();

  return authorBook ? c.json(undefined, 204) : c.json(undefined, 404);
});

export default app;
