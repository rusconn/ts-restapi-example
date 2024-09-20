import { Hono } from "hono";

import { strongETag } from "../../lib/etag.ts";
import type { Env } from "../../types.ts";

const app = new Hono<Env>().delete("/books/:id", async (c) => {
  const { id } = c.req.param();
  const ifMatch = c.req.header("if-match");

  if (ifMatch) {
    const book = await c.var.api.book.get(id);

    if (!book) {
      return c.json(undefined, 404);
    }
    if (ifMatch !== (await strongETag(book))) {
      return c.json("Precondition Failed", 412);
    }
  }

  const book = await c.var.api.book.delete(id);

  return book ? c.json(undefined, 204) : c.json(undefined, 404);
});

export default app;
