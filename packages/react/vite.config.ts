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
      entry: path.resolve(__dirname, "src/index.tsx"),
      name: "DemoGhostReact",
      formats: ["es", "cjs"],
      fileName: format => `index.${format === "es" ? "js" : "cjs"}`
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "demoghost",
        "@demoghost/core",
        "@demoghost/recorder",
        "@demoghost/controls"
      ]
    },
    sourcemap: true,
    minify: "esbuild"
  }
});
