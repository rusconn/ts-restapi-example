import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { fmap } from "../../lib/functor.ts";
import { createdAt } from "../../lib/ulid.ts";
import type { Env } from "../../types.ts";

const app = new Hono<Env>().patch(
  "/authors/:id",
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
