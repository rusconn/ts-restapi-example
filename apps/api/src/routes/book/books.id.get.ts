import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { etag } from "hono/etag";
import * as z from "zod";

import * as s from "../../lib/schema.ts";
import type { Env } from "../../types.ts";

const app = new Hono<Env>().get(
  "/books/:id",
  etag(),
  zValidator("param", z.object({ id: s.bookId }), (result, c) => {
    if (!result.success) {
      return c.json(z.treeifyError(result.error), 400);
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");

    const book = await c.var.api.book.get(id);

    return book
      ? c.json(book, 200, {
          "cache-control": "public, max-age=0, must-revalidate",
        })
      : c.json(undefined, 404);
  },
);

export default app;
