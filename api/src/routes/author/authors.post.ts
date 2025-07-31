import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import * as z from "zod";

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
        return c.json(z.treeifyError(result.error), 400);
      }
    },
  ),
  async (c) => {
    const { name } = c.req.valid("json");

    const author = await c.var.api.author.create({ name });

    return c.json(author, 201, {
      "content-location": `${c.req.url}/${author.id}`,
    });
  },
);

export default app;
