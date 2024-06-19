import { Hono } from "hono";

import type { Env } from "../../types.ts";
import authors_id_books_id_delete from "./authors.[id].books.[id].delete.ts";
import authors_id_books_id_post from "./authors.[id].books.[id].post.ts";

const app = new Hono<Env>()
  .route("", authors_id_books_id_delete)
  .route("", authors_id_books_id_post);

export default app;
