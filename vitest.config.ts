import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: [],
    include: ["packages/**/*.test.ts", "packages/**/*.spec.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"]
    }
  },
  resolve: {
    alias: {
      "@demoghost/core": path.resolve(__dirname, "packages/core/src"),
      "@demoghost/recorder": path.resolve(__dirname, "packages/recorder/src"),
      "@demoghost/controls": path.resolve(__dirname, "packages/controls/src"),
      demoghost: path.resolve(__dirname, "packages/demoghost/src")
    }
  }
});
