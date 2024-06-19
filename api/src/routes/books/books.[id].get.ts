import { Hono } from "hono";

import { fmap } from "../../lib/functor.ts";
import { createdAt } from "../../lib/ulid.ts";
import type { Env } from "../../types.ts";

const app = new Hono<Env>().get("/books/:id", async (c) => {
  const { id } = c.req.param();

  const book = await c.var.db
    .selectFrom("Book")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst()
    .then(fmap(createdAt));

  return book ? c.json(book, 200) : c.json(undefined, 404);
});

export default app;
