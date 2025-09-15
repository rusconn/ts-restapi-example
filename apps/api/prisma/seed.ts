import { db } from "../src/db/client.ts";

import * as author from "./seed/author.ts";
import * as authorBook from "./seed/author-book.ts";
import * as book from "./seed/book.ts";

const seed = async () => {
  await db.transaction().execute(async (tsx) => {
    await Promise.all([author.seed(tsx), book.seed(tsx)]);
    await authorBook.seed(tsx);
  });
};

try {
  await seed();
} catch (e) {
  console.error(e);
} finally {
  await db.destroy();
}
