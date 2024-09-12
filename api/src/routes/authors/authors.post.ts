import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { fmap } from "../../lib/functor.ts";
import { createdAt, ulidDate } from "../../lib/ulid.ts";
import type { Env } from "../../types.ts";

const app = new Hono<Env>().post(
  "/authors",
  zValidator(
    "json",
    z
      .object({
        name: z.string().min(1).max(100),
      })
      .strict(),
    (result, c) => {
      if (!result.success) {
        return c.json(result.error.flatten(), 400);
      }
    },
  ),
  async (c) => {
    const { name } = c.req.valid("json");

    const { id, date } = ulidDate();

    const author = await c.var.db
      .insertInto("Author")
      .values({ id, updatedAt: date, name })
      .returning(["id", "updatedAt", "name"])
      .executeTakeFirstOrThrow()
      .then(fmap(createdAt));

    return c.json(author, 201, {
      "content-location": `${c.req.url}/${author.id}`,
    });
  },
);

export default app;
