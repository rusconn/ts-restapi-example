import { Hono } from "hono";

import type { Env } from "../../types.ts";

const app = new Hono<Env>().delete("/authors/:id", async (c) => {
  const { id } = c.req.param();

  const author = await c.var.db
    .deleteFrom("Author")
    .where("id", "=", id)
    .returning("id")
    .executeTakeFirst();

  return author ? c.json(undefined, 204) : c.json(undefined, 404);
});

export default app;
