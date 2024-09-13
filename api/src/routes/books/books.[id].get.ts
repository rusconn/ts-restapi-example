import { Hono } from "hono";
import { etag } from "hono/etag";

import type { Env } from "../../types.ts";

const app = new Hono<Env>().get("/books/:id", etag(), async (c) => {
  const { id } = c.req.param();

  const book = await c.var.api.book.get(id);

  return book
    ? c.json(book, 200, {
        "cache-control": "public, max-age=0, must-revalidate",
      })
    : c.json(undefined, 404);
});

export default app;
