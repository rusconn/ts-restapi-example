import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import * as z from "zod";

import { strongETag } from "../../lib/etag.ts";
import * as s from "../../lib/schema.ts";
import type { Env } from "../../types.ts";

const app = new Hono<Env>().delete(
  "/books/:id",
  zValidator("param", z.object({ id: s.bookId }), (result, c) => {
    if (!result.success) {
      return c.json(z.treeifyError(result.error), 400);
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const ifMatch = c.req.header("if-match");

    if (ifMatch) {
      const book = await c.var.api.book.get(id);

      if (!book) {
        return c.json(undefined, 404);
      }
      if (ifMatch !== (await strongETag(book))) {
        return c.json("Precondition Failed", 412);
      }
    }

    const book = await c.var.api.book.delete(id);

    return book ? c.json(undefined, 204) : c.json(undefined, 404);
  },
);

export default app;
