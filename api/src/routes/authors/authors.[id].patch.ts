import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { etag } from "hono/etag";
import { z } from "zod";

import { strongETag } from "../../lib/etag.ts";
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

    const data = {
      ...(name && { name }),
    };

    if (ifMatch) {
      const { type, updated } = await c.var.api.author.updateWithCheck(
        id,
        data,
        async (got) => (await strongETag(got)) === ifMatch,
      );

      const statuses = {
        notFound: 404,
        checkError: 412,
        success: 200,
      } as const;

      return c.json(updated, statuses[type]);
    } else {
      const updated = await c.var.api.author.update(id, data);

      return c.json(updated, updated ? 200 : 404);
    }
  },
);

export default app;
