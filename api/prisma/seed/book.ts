import type { Transaction } from "kysely";

import type { DB } from "../../src/db/mod.ts";

export const seed = async (tsx: Transaction<DB>) => {
  const books = [aliceBook1, aliceBook2, bobBook1, aliceBobBook1];
  await tsx.insertInto("Book").values(books).execute();
};

export const aliceBook1 = {
  id: "01HZGPKBNK64EZMF9GQQJC2J5K",
  createdAt: new Date(0),
  updatedAt: new Date(4),
  title: "alice book 1",
};
export const aliceBook2 = {
  id: "01HZGPKBNKJ9X3C2HEH2AWFDP8",
  createdAt: new Date(1),
  updatedAt: new Date(1),
  title: "alice book 2",
};
export const bobBook1 = {
  id: "01HZGPKBNK2T1KWWAHN4QMCDNW",
  createdAt: new Date(2),
  updatedAt: new Date(2),
  title: "bob book 1",
};
export const aliceBobBook1 = {
  id: "01HZGPKBNKXV66F1DB1WJCN5T0",
  createdAt: new Date(3),
  updatedAt: new Date(5),
  title: "alice bob book 1",
};
