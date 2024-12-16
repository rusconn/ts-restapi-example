import type { Transaction } from "kysely";

import type { DB } from "../../src/db/types.ts";

export const seed = async (tsx: Transaction<DB>) => {
  const authors = [alice, bob, charlie];
  await tsx.insertInto("Author").values(authors).execute();
};

export const alice = {
  id: "0193cc6d-d719-76c5-9e24-14f554301218",
  updatedAt: new Date(4),
  name: "alice",
};
export const bob = {
  id: "0193cc6d-dea3-74b5-a0ed-871ec7baf99e",
  updatedAt: new Date(1),
  name: "bob",
};
export const charlie = {
  id: "0193cc6d-e4aa-746a-9745-0304d9e68424",
  updatedAt: new Date(2),
  name: "charlie",
};
