import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { fmap } from "../../lib/functor.ts";
import { createdAt, ulidDate } from "../../lib/ulid.ts";
import type { Env } from "../../types.ts";

const app = new Hono<Env>().post(
  "/",
  zValidator(
    "json",
    z
      .object({
        title: z.string().min(1).max(100),
      })
      .strict(),
    (result, c) => {
      if (!result.success) {
        return c.json(result.error.flatten(), 400);
      }
    },
  ),
  async (c) => {
    const { title } = c.req.valid("json");

    const { id, date } = ulidDate();

    const book = await c.var.db
      .insertInto("Book")
      .values({ id, updatedAt: date, title })
      .returningAll()
      .executeTakeFirstOrThrow()
      .then(fmap(createdAt));

    return c.json(book, 201, {
      "content-location": `${c.req.url}/${book.id}`,
    });
  },
);

export default app;
