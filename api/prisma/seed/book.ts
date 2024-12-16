import type { Transaction } from "kysely";

import type { DB } from "../../src/db/types.ts";

export const seed = async (tsx: Transaction<DB>) => {
  const books = [aliceBook1, aliceBook2, bobBook1, aliceBobBook1];
  await tsx.insertInto("Book").values(books).execute();
};

export const aliceBook1 = {
  id: "0193cc6d-eb8c-738c-aad3-be8265cb9e8f",
  updatedAt: new Date(4),
  title: "alice book 1",
};
export const aliceBook2 = {
  id: "0193cc6e-029a-7419-80e0-4d8cc8f21c3b",
  updatedAt: new Date(1),
  title: "alice book 2",
};
export const bobBook1 = {
  id: "0193cc6e-077c-7672-bd3e-1a8552828463",
  updatedAt: new Date(2),
  title: "bob book 1",
};
export const aliceBobBook1 = {
  id: "0193cc6e-0d3b-705c-a762-e99ee57a7dd1",
  updatedAt: new Date(5),
  title: "alice bob book 1",
};
