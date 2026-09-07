import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  base: process.env.BASE_URL || "./",
  resolve: {
    alias: {
      "demoghost/css": path.resolve(__dirname, "../../packages/demoghost/src/styles.css"),
      demoghost: path.resolve(__dirname, "../../packages/demoghost/src/index.ts"),
      "@demoghost/core": path.resolve(__dirname, "../../packages/core/src/index.ts"),
      "@demoghost/recorder": path.resolve(__dirname, "../../packages/recorder/src/index.ts"),
      "@demoghost/controls": path.resolve(__dirname, "../../packages/controls/src/index.ts")
    }
  },
  server: {
    port: 5173
  }
});
