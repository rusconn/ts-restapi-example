import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { strongETag } from "../../lib/etag.ts";
import { fmap } from "../../lib/functor.ts";
import { createdAt, ulidDate } from "../../lib/ulid.ts";
import { logger } from "../../logger.ts";
import type { Env } from "../../types.ts";

const app = new Hono<Env>().post(
  "/authors",
  zValidator(
    "json",
    z
      .object({
        name: z.string().min(1).max(100),
      })
      .strict(),
    (result, c) => {
      if (!result.success) {
        return c.json(result.error.flatten(), 400);
      }
    },
  ),
  async (c) => {
    const { name } = c.req.valid("json");
    const { requestId } = c.var;

    const { id, date } = ulidDate();

    const author = await c.var.db
      .insertInto("Author")
      .values({ id, updatedAt: date, name })
      .returning(["id", "updatedAt", "name"])
      .executeTakeFirstOrThrow()
      .then(fmap(createdAt));

    const etag = await strongETag(author);

    const result = await c.var.cache //
      .set(id, etag)
      .catch((_) => null);

    if (result !== "OK") {
      logger.error({ requestId, author, id, etag }, "cache-failed-log");
    }

    return c.json(author, 201, {
      "content-location": `${c.req.url}/${author.id}`,
    });
  },
);

export default app;
