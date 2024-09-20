import { Hono } from "hono";

import type { Env } from "../../types.ts";

const app = new Hono<Env>().delete("/authors/:authorId/books/:bookId", async (c) => {
  const { authorId, bookId } = c.req.param();

  const authorBook = await c.var.api.authorBook.delete(authorId, bookId);

  return authorBook ? c.json(undefined, 204) : c.json(undefined, 404);
});

export default app;
