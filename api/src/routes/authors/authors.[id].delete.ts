import { Hono } from "hono";

import type { Env } from "../../types.ts";

const app = new Hono<Env>().delete("/authors/:id", async (c) => {
  const { id } = c.req.param();

  await c.var.cache.unlink(id);

  const author = await c.var.db
    .deleteFrom("Author")
    .where("id", "=", id)
    .returning("id")
    .executeTakeFirst();

  return c.json(undefined, author ? 204 : 404);
});

export default app;
