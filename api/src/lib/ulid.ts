import { decodeTime, ulid } from "ulid";

export const ulidDate = () => {
  const id = ulid();
  return { id, date: dateFromUlid(id) };
};

export const createdAt = <T extends { id: Ulid }>(x: T): T & { createdAt: Date } => {
  return { ...x, createdAt: dateFromUlid(x.id) };
};

const dateFromUlid = (id: Ulid) => {
  return new Date(decodeTime(id));
};

type Ulid = ReturnType<typeof ulid>;
