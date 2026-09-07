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
      name: "DemoGhostCore",
      formats: ["es", "cjs"],
      fileName: format => `index.${format === "es" ? "js" : "cjs"}`
    },
    rollupOptions: {
      output: {
        assetFileNames: "demoghost.[ext]"
      }
    },
    sourcemap: true,
    minify: "esbuild"
  }
});
