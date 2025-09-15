import { Hono } from "hono";

import type { Env } from "../../types.ts";
import authors_id_books_get from "./authors.id.books.get.ts";
import books_get from "./books.get.ts";
import books_id_delete from "./books.id.delete.ts";
import books_id_get from "./books.id.get.ts";
import books_id_patch from "./books.id.patch.ts";
import books_post from "./books.post.ts";

const app = new Hono<Env>()
  .route("/", authors_id_books_get)
  .route("/", books_id_delete)
  .route("/", books_id_get)
  .route("/", books_id_patch)
  .route("/", books_get)
  .route("/", books_post);

export default app;
