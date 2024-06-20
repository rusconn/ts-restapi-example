import { Hono } from "hono";

import type { Env } from "../../types.ts";

const app = new Hono<Env>().delete("/books/:id", async (c) => {
  const { id } = c.req.param();

  await c.var.cache.unlink(id);

  const book = await c.var.db
    .deleteFrom("Book")
    .where("id", "=", id)
    .returning("id")
    .executeTakeFirst();

  return c.json(undefined, book ? 204 : 404);
});

export default app;
