import { sha1 } from "hono/utils/crypto";

/**
 * @throws {Error}: Node.js のバージョンが v15.0.0 よりも古い場合
 */
export const strongETag = async (data: unknown) => {
  const hash = await sha1(data);

  // crypto.subtle が無いと発生する
  if (hash == null) {
    throw new Error("hash failed");
  }

  return `"${hash}"` as const;
};
