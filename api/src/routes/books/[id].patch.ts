import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { fmap } from "../../lib/functor.ts";
import { createdAt } from "../../lib/ulid.ts";
import type { Env } from "../../types.ts";

const app = new Hono<Env>().patch(
  "/:id",
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
