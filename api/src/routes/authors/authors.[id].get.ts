import { Hono } from "hono";
import { etag } from "hono/etag";

import type { Env } from "../../types.ts";

const app = new Hono<Env>().get("/authors/:id", etag(), async (c) => {
  const { id } = c.req.param();

  const author = await c.var.api.author.get(id);

  return author
    ? c.json(author, 200, {
        "cache-control": "public, max-age=0, must-revalidate",
      })
    : c.json(undefined, 404);
});

export default app;
