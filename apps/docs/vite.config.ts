import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  base: process.env.BASE_URL || "./",
  resolve: {
    alias: {
      "demoghost/css": path.resolve(__dirname, "../../packages/demoghost/src/styles.css"),
      demoghost: path.resolve(__dirname, "../../packages/demoghost/src/index.ts"),
      "@demoghostjs/core": path.resolve(__dirname, "../../packages/core/src/index.ts"),
      "@demoghostjs/recorder": path.resolve(__dirname, "../../packages/recorder/src/index.ts"),
      "@demoghostjs/controls": path.resolve(__dirname, "../../packages/controls/src/index.ts")
    }
  },
  server: {
    port: 5173
  }
});
