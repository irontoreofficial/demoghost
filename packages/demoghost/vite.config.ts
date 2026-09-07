import { defineConfig } from "vite";
import path from "node:path";
import fs from "node:fs";

function bundleDts() {
  return {
    name: "bundle-dts",
    closeBundle() {
      const coreDtsPath = path.resolve(__dirname, "../core/dist/index.d.ts");
      const recorderDtsPath = path.resolve(__dirname, "../recorder/dist/index.d.ts");
      const controlsDtsPath = path.resolve(__dirname, "../controls/dist/index.d.ts");
      const outDtsPath = path.resolve(__dirname, "dist/index.d.ts");

      let coreDts = fs.readFileSync(coreDtsPath, "utf-8");
      let recorderDts = fs.readFileSync(recorderDtsPath, "utf-8");
      let controlsDts = fs.readFileSync(controlsDtsPath, "utf-8");

      // Strip external imports from subpackages
      coreDts = coreDts.replace(/export\s*\{\s*\}\s*;?/g, "");
      recorderDts = recorderDts.replace(
        /import\s*\{[^}]*\}\s*from\s*['"]@demoghost\/core['"];?\r?\n?/g,
        ""
      );
      recorderDts = recorderDts.replace(/export\s*\{\s*\}\s*;?/g, "");
      controlsDts = controlsDts.replace(
        /import\s*\{[^}]*\}\s*from\s*['"]@demoghost\/core['"];?\r?\n?/g,
        ""
      );
      controlsDts = controlsDts.replace(/export\s*\{\s*\}\s*;?/g, "");

      const demoghostDts = `
export declare class DemoGhost {
    static actions: ActionRegistry;
    static configure(config: DemoGhostConfig): void;
    static play(scenarioOrSteps: DemoScenario | DemoStep[], options?: PlaybackOptions): PlaybackController;
    static record(options?: RecorderOptions): EventRecorder;
    static create(scenario: DemoScenario, defaultOptions?: PlaybackOptions): {
        play: (options?: PlaybackOptions) => PlaybackController;
    };
    static serialize(scenario: DemoScenario): string;
    static deserialize(json: string): DemoScenario;
    static toTypeScript(scenario: DemoScenario): string;
    static toJavaScript(scenario: DemoScenario): string;
    static export(scenario: DemoScenario, format?: "json" | "ts" | "js"): string;
    static on<K extends keyof PlaybackEvents>(event: K, listener: (data: PlaybackEvents[K]) => void): () => void;
    static off<K extends keyof PlaybackEvents>(event: K, listener: (data: PlaybackEvents[K]) => void): void;
    static move: typeof move;
    static click: typeof click;
    static doubleClick: typeof doubleClick;
    static rightClick: typeof rightClick;
    static type: typeof type;
    static clear: typeof clear;
    static focus: typeof focus;
    static blur: typeof blur;
    static wait: typeof wait;
    static waitFor: typeof waitFor;
    static scroll: typeof scroll;
    static scrollTo: typeof scrollTo;
    static select: typeof select;
    static check: typeof check;
    static uncheck: typeof uncheck;
    static hover: typeof hover;
    static press: typeof press;
    static highlight: typeof highlight;
    static caption: typeof caption;
    static drag: typeof drag;
}

export default DemoGhost;
`;

      const combined = [coreDts, recorderDts, controlsDts, demoghostDts].join("\n\n");
      fs.writeFileSync(outDtsPath, combined, "utf-8");
    }
  };
}

export default defineConfig({
  plugins: [bundleDts()],
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
        extend: true,
        inlineDynamicImports: true
      }
    },
    sourcemap: true,
    minify: "esbuild"
  }
});
