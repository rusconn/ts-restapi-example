import { Hono } from "hono";

import type { Env } from "../../types.ts";

const app = new Hono<Env>().post("/:authorId/books/:bookId", async (c) => {
  const { authorId, bookId } = c.req.param();

  const [author, book, authorBook] = await Promise.all([
    c.var.db //
      .selectFrom("Author")
      .where("id", "=", authorId)
      .select("id")
      .executeTakeFirst(),
    c.var.db //
      .selectFrom("Book")
      .where("id", "=", bookId)
      .select("id")
      .executeTakeFirst(),
    c.var.db
      .selectFrom("AuthorBook")
      .where("authorId", "=", authorId)
      .where("bookId", "=", bookId)
      .selectAll()
      .executeTakeFirst(),
  ]);

  if (!author || !book) {
    return c.json(undefined, 404);
  }
  if (authorBook) {
    return c.json("Already Exists", 409); // 409 でいいのか？
  }

  await c.var.db
    .insertInto("AuthorBook")
    .values({ authorId, bookId })
    .returningAll()
    .executeTakeFirstOrThrow();

  return c.json(undefined, 201);
});

export default app;
