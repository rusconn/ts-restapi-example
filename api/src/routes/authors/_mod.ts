import { Hono } from "hono";

import type { Env } from "../../types.ts";
import authors_id_delete from "./authors.[id].delete.ts";
import authors_id_get from "./authors.[id].get.ts";
import authors_id_patch from "./authors.[id].patch.ts";
import authors_get from "./authors.get.ts";
import authors_post from "./authors.post.ts";
import books_id_authors_get from "./books.[id].authors.get.ts";

const app = new Hono<Env>()
  .route("/", authors_id_delete)
  .route("/", authors_id_get)
  .route("/", authors_id_patch)
  .route("/", authors_get)
  .route("/", authors_post)
  .route("/", books_id_authors_get);

export default app;
