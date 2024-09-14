import type { Transaction } from "kysely";

import type { DB } from "../../src/db/types.ts";

export const seed = async (tsx: Transaction<DB>) => {
  const authors = [alice, bob, charlie];
  await tsx.insertInto("Author").values(authors).execute();
};

export const alice = {
  id: "01HZGPKBNKF3VQB5BYPQ104WN8",
  updatedAt: new Date(4),
  name: "alice",
};
export const bob = {
  id: "01HZGPKBNKQNXY8XQ0TYGR4NXJ",
  updatedAt: new Date(1),
  name: "bob",
};
export const charlie = {
  id: "01HZGPKBNKN5K194QS4WPGHDTF",
  updatedAt: new Date(2),
  name: "charlie",
};
