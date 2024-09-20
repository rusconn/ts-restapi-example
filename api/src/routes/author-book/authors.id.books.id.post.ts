import { Hono } from "hono";

import type { Env } from "../../types.ts";

const app = new Hono<Env>().post("/authors/:authorId/books/:bookId", async (c) => {
  const { authorId, bookId } = c.req.param();

  const [author, book, authorBook] = await Promise.all([
    c.var.api.author.isExists(authorId),
    c.var.api.book.isExists(bookId),
    c.var.api.authorBook.isExists(authorId, bookId),
  ]);

  if (!author || !book) {
    return c.json(undefined, 404);
  }
  if (authorBook) {
    return c.json("Already Exists", 409); // 409 でいいのか？
  }

  await c.var.api.authorBook.create(authorId, bookId);

  return c.json(undefined, 201);
});

export default app;
