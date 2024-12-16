import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import * as s from "../../lib/schema.ts";
import type { Env } from "../../types.ts";

const app = new Hono<Env>().delete(
  "/authors/:authorId/books/:bookId",
  zValidator("param", z.object({ authorId: s.authorId, bookId: s.bookId }), (result, c) => {
    if (!result.success) {
      return c.json(result.error.flatten(), 400);
    }
  }),
  async (c) => {
    const { authorId, bookId } = c.req.valid("param");

    const authorBook = await c.var.api.authorBook.delete(authorId, bookId);

    return authorBook ? c.json(undefined, 204) : c.json(undefined, 404);
  },
);

export default app;
