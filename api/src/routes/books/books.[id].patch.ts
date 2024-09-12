import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { etag } from "hono/etag";
import { strongETag } from "../../lib/etag.ts";
import { fmap } from "../../lib/functor.ts";
import { createdAt } from "../../lib/ulid.ts";
import type { Env } from "../../types.ts";

const app = new Hono<Env>().patch(
  "/books/:id",
  etag(),
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
    const { id } = c.req.param();
    const { title } = c.req.valid("json");
    const ifMatch = c.req.header("if-match");

    if (ifMatch) {
      const book = await c.var.db
        .selectFrom("Book")
        .where("id", "=", id)
        .selectAll()
        .executeTakeFirst()
        .then(fmap(createdAt));

      if (!book) {
        return c.json(undefined, 404);
      }
      if (ifMatch !== (await strongETag(book))) {
        return c.json("Precondition Failed", 412);
      }
    }

    const book = await c.var.db
      .updateTable("Book")
      .where("id", "=", id)
      .set({ title })
      .returningAll()
      .executeTakeFirst()
      .then(fmap(createdAt));

    return book ? c.json(book, 200) : c.json(undefined, 404);
  },
);

export default app;
