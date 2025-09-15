import { bodyLimit as honoBodyLimit } from "hono/body-limit";

export const bodyLimit = (maxSize: number) => {
  return honoBodyLimit({
    maxSize,
    onError: (c) => {
      return c.json("Payload Too Large", 413);
    },
  });
};
