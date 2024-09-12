import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { etag } from "hono/etag";
import { z } from "zod";

import { strongETag } from "../../lib/etag.ts";
import { fmap } from "../../lib/functor.ts";
import { createdAt } from "../../lib/ulid.ts";
import type { Env } from "../../types.ts";

const app = new Hono<Env>().patch(
  "/authors/:id",
  etag(),
  zValidator(
    "json",
    z
      .object({
        name: z.string().min(1).max(100),
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
    const { name } = c.req.valid("json");
    const ifMatch = c.req.header("if-match");

    if (ifMatch) {
      const author = await c.var.db
        .selectFrom("Author")
        .where("id", "=", id)
        .selectAll()
        .executeTakeFirst()
        .then(fmap(createdAt));

      if (!author) {
        return c.json(undefined, 404);
      }
      if (ifMatch !== (await strongETag(author))) {
        return c.json("Precondition Failed", 412);
      }
    }

    const author = await c.var.db
      .updateTable("Author")
      .where("id", "=", id)
      .set({ name })
      .returningAll()
      .executeTakeFirst()
      .then(fmap(createdAt));

    return author ? c.json(author, 200) : c.json(undefined, 404);
  },
);

export default app;
