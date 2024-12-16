import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { etag } from "hono/etag";
import { z } from "zod";

import * as s from "../../lib/schema.ts";
import type { Env } from "../../types.ts";

const app = new Hono<Env>().get(
  "/authors/:id",
  etag(),
  zValidator("param", z.object({ id: s.authorId }), (result, c) => {
    if (!result.success) {
      return c.json(result.error.flatten(), 400);
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");

    const author = await c.var.api.author.get(id);

    return author
      ? c.json(author, 200, {
          "cache-control": "public, max-age=0, must-revalidate",
        })
      : c.json(undefined, 404);
  },
);

export default app;
