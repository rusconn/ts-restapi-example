import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { etag } from "hono/etag";
import { z } from "zod";

import { strongETag } from "../../lib/etag.ts";
import * as s from "../../lib/schema.ts";
import type { Env } from "../../types.ts";

const app = new Hono<Env>().patch(
  "/books/:id",
  etag(),
  zValidator("param", z.object({ id: s.bookId }), (result, c) => {
    if (!result.success) {
      return c.json(result.error.flatten(), 400);
    }
  }),
  zValidator(
    "json",
    z
      .object({
        title: z.string().min(1).max(100),
      })
      .strict()
      .partial(),
    (result, c) => {
      if (!result.success) {
        return c.json(result.error.flatten(), 400);
      }
    },
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const { title } = c.req.valid("json");
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

    const book = await c.var.api.book.update(id, {
      ...(title && { title }),
    });

    return book ? c.json(book, 200) : c.json(undefined, 404);
  },
);

export default app;
