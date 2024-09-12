import { sha1 } from "hono/utils/crypto";

export const strongETag = async (data: unknown) => {
  const hash = await sha1(data);

  // crypto.subtle が無いと発生する可能性がある
  if (hash == null) {
    throw new Error("hash failed");
  }

  return `"${hash}"` as const;
};
