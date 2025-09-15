import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import * as z from "zod";

import { strongETag } from "../../lib/etag.ts";
import * as s from "../../lib/schema.ts";
import type { Env } from "../../types.ts";

const app = new Hono<Env>().delete(
  "/authors/:id",
  zValidator("param", z.object({ id: s.authorId }), (result, c) => {
    if (!result.success) {
      return c.json(z.treeifyError(result.error), 400);
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const ifMatch = c.req.header("if-match");

    if (ifMatch) {
      const author = await c.var.api.author.get(id);

      if (!author) {
        return c.json(undefined, 404);
      }
      if (ifMatch !== (await strongETag(author))) {
        return c.json("Precondition Failed", 412);
      }
    }

    const author = await c.var.api.author.delete(id);

    return author ? c.json(undefined, 204) : c.json(undefined, 404);
  },
);

export default app;
