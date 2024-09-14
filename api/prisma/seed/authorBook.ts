import type { Transaction } from "kysely";

import type { DB } from "../../src/db/types.ts";
import { alice, bob } from "./author.ts";
import { aliceBobBook1, aliceBook1, aliceBook2, bobBook1 } from "./book.ts";

export const seed = async (tsx: Transaction<DB>) => {
  const authorBooks = [
    {
      authorId: alice.id,
      bookId: aliceBook1.id,
    },
    {
      authorId: alice.id,
      bookId: aliceBook2.id,
    },
    {
      authorId: alice.id,
      bookId: aliceBobBook1.id,
    },
    {
      authorId: bob.id,
      bookId: bobBook1.id,
    },
    {
      authorId: bob.id,
      bookId: aliceBobBook1.id,
    },
  ];

  await tsx.insertInto("AuthorBook").values(authorBooks).execute();
};
