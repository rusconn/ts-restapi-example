import { builtinModules } from "node:module";

import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2023",
    sourcemap: true,
    rollupOptions: {
      external: [/^node:.+/, ...builtinModules],
    },
    lib: {
      entry: "src/main",
      fileName: "main",
      formats: ["es"],
    },
  },
  define: {
    "import.meta.vitest": "undefined",
  },
});
