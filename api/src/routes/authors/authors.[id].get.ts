import { Hono } from "hono";
import { etag } from "hono/etag";

import { fmap } from "../../lib/functor.ts";
import { createdAt } from "../../lib/ulid.ts";
import type { Env } from "../../types.ts";

const app = new Hono<Env>().get("/authors/:id", etag(), async (c) => {
  const { id } = c.req.param();

  const author = await c.var.db
    .selectFrom("Author")
    .where("id", "=", id)
    .select(["id", "updatedAt", "name"])
    .executeTakeFirst()
    .then(fmap(createdAt));

  return author
    ? c.json(author, 200, {
        "cache-control": "public, max-age=0, must-revalidate",
      })
    : c.json(undefined, 404);
});

export default app;
