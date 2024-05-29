import type { Transaction } from "kysely";

import type { DB } from "../../src/db/mod.ts";

export const seed = async (tsx: Transaction<DB>) => {
  const authors = [alice, bob, charlie];
  await tsx.insertInto("Author").values(authors).execute();
};

export const alice = {
  id: "01HZGPKBNKF3VQB5BYPQ104WN8",
  createdAt: new Date(0),
  updatedAt: new Date(4),
  name: "alice",
};
export const bob = {
  id: "01HZGPKBNKQNXY8XQ0TYGR4NXJ",
  createdAt: new Date(1),
  updatedAt: new Date(1),
  name: "bob",
};
export const charlie = {
  id: "01HZGPKBNKN5K194QS4WPGHDTF",
  createdAt: new Date(2),
  updatedAt: new Date(2),
  name: "charlie",
};
