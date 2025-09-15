import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import * as z from "zod";

import * as s from "../../lib/schema.ts";
import type { Env } from "../../types.ts";

const app = new Hono<Env>().post(
  "/authors/:authorId/books/:bookId",
  zValidator("param", z.object({ authorId: s.authorId, bookId: s.bookId }), (result, c) => {
    if (!result.success) {
      return c.json(z.treeifyError(result.error), 400);
    }
  }),
  async (c) => {
    const { authorId, bookId } = c.req.valid("param");

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
  },
);

export default app;
