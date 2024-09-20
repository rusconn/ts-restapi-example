import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import type { Env } from "../../types.ts";

const app = new Hono<Env>().post(
  "/books",
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

    const book = await c.var.api.book.create({ title });

    return c.json(book, 201, {
      "content-location": `${c.req.url}/${book.id}`,
    });
  },
);

export default app;
