import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "node:path";

export default defineConfig({
  plugins: [
    dts({
      include: ["src/**/*"],
      rollupTypes: true
    })
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "DemoGhost",
      formats: ["es", "cjs", "iife"],
      fileName: format => {
        if (format === "es") return "demoghost.js";
        if (format === "cjs") return "demoghost.cjs";
        if (format === "iife") return "demoghost.min.js";
        return `demoghost.${format}.js`;
      }
    },
    rollupOptions: {
      output: {
        assetFileNames: "demoghost.[ext]",
        exports: "named",
        extend: true
      }
    },
    sourcemap: true,
    minify: "esbuild"
  }
});
