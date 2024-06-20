import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { strongETag } from "../../lib/etag.ts";
import { fmap } from "../../lib/functor.ts";
import { createdAt } from "../../lib/ulid.ts";
import { logger } from "../../logger.ts";
import type { Env } from "../../types.ts";

const app = new Hono<Env>().patch(
  "/authors/:id",
  zValidator(
    "json",
    z
      .object({
        name: z.string().min(1).max(100),
      })
      .strict()
      .partial(),
    (result, c) => {
      if (!result.success) {
        return c.json(result.error.flatten(), 400);
      }
    },
  ),
  async (c) => {
    const { id } = c.req.param();
    const { name } = c.req.valid("json");
    const ifMatch = c.req.header("If-Match");
    const { requestId } = c.var;

    if (ifMatch) {
      const etag = await c.var.cache.get(id);

      if (etag) {
        if (ifMatch !== etag) {
          return c.json("Precondition Failed", 412);
        }
      } else {
        const author = await c.var.db
          .selectFrom("Author")
          .where("id", "=", id)
          .select(["id", "updatedAt", "name"])
          .executeTakeFirst()
          .then(fmap(createdAt));

        if (!author) {
          return c.json(undefined, 404);
        }

        const etag = await strongETag(author);

        if (ifMatch !== etag) {
          return c.json("Precondition Failed", 412);
        }
      }
    }

    const author = await c.var.db
      .updateTable("Author")
      .where("id", "=", id)
      .set({ name })
      .returning(["id", "updatedAt", "name"])
      .executeTakeFirst()
      .then(fmap(createdAt));

    if (!author) {
      return c.json(undefined, 404);
    }

    const etag = await strongETag(author);

    const result = await c.var.cache //
      .set(id, etag)
      .catch((_) => null);

    // db と cache に不整合が発生、cache を更新する必要がある。
    // 別のプロセスへ移譲するか、手動で修正するか
    if (result !== "OK") {
      logger.fatal({ requestId, author, id, etag }, "cache-failed-log");
      throw new Error("cache failed");
    }

    return c.json(author, 200, { etag });
  },
);

export default app;
