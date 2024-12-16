import { v7 as uuidv7 } from "uuid";

export const uuid = uuidv7;

export const uuidDate = () => {
  const id = uuid();
  return { id, date: dateFromUuid(id) };
};

export const createdAt = <T extends { id: Uuid }>(x: T): T & { createdAt: Date } => {
  return { ...x, createdAt: dateFromUuid(x.id) };
};

const dateFromUuid = (id: Uuid) => {
  return new Date(decodeTime(id));
};

const decodeTime = (id: string) => {
  const time = id.replace("-", "").slice(0, 12);
  return Number.parseInt(time, 16);
};

type Uuid = string;
