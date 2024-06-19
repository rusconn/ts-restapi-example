import { Hono } from "hono";

import type { Env } from "../../types.ts";

const app = new Hono<Env>().delete("/books/:id", async (c) => {
  const { id } = c.req.param();

  const book = await c.var.db
    .deleteFrom("Book")
    .where("id", "=", id)
    .returning("id")
    .executeTakeFirst();

  return book ? c.json(undefined, 204) : c.json(undefined, 404);
});

export default app;
