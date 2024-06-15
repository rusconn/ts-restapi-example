import { Hono } from "hono";

import { fmap } from "../../lib/functor.ts";
import { createdAt } from "../../lib/ulid.ts";
import type { Env } from "../../types.ts";

const app = new Hono<Env>().get("/:id", async (c) => {
  const { id } = c.req.param();

  const author = await c.var.db
    .selectFrom("Author")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst()
    .then(fmap(createdAt));

  return author ? c.json(author, 200) : c.json(undefined, 404);
});

export default app;
