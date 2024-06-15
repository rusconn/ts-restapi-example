import { Hono } from "hono";

import type { Env } from "../../types.ts";
import id_authors_get from "./[id].authors.get.ts";
import id_delete from "./[id].delete.ts";
import id_get from "./[id].get.ts";
import id_patch from "./[id].patch.ts";
import get from "./get.ts";
import post from "./post.ts";

const app = new Hono<Env>()
  .route("", id_authors_get)
  .route("", id_delete)
  .route("", id_get)
  .route("", id_patch)
  .route("", get)
  .route("", post);

export default app;
