import { defineConfig, mergeConfig } from "vite";

import configShared from "../vite.config.js";
import { dependencies } from "./package.json";

export default mergeConfig(
  configShared,
  defineConfig({
    build: {
      rollupOptions: {
        external: Object.keys(dependencies),
      },
    },
  }),
);
