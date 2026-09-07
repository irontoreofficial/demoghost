const fs = require("node:fs");
const zlib = require("node:zlib");

const files = [
  { name: "Core (dist/index.js)", path: "packages/core/dist/index.js" },
  { name: "Core CJS (dist/index.cjs)", path: "packages/core/dist/index.cjs" },
  { name: "Core CSS (dist/demoghost.css)", path: "packages/core/dist/demoghost.css" },
  { name: "Recorder (dist/index.js)", path: "packages/recorder/dist/index.js" },
  { name: "Recorder CJS (dist/index.cjs)", path: "packages/recorder/dist/index.cjs" },
  { name: "Controls (dist/index.js)", path: "packages/controls/dist/index.js" },
  { name: "Controls CJS (dist/index.cjs)", path: "packages/controls/dist/index.cjs" },
  { name: "Controls CSS (dist/controls.css)", path: "packages/controls/dist/controls.css" },
  { name: "Main ESM (dist/demoghost.js)", path: "packages/demoghost/dist/demoghost.js" },
  { name: "Main CJS (dist/demoghost.cjs)", path: "packages/demoghost/dist/demoghost.cjs" },
  { name: "Main Minified IIFE (dist/demoghost.min.js)", path: "packages/demoghost/dist/demoghost.min.js" },
  { name: "Main CSS (dist/demoghost.css)", path: "packages/demoghost/dist/demoghost.css" }
];

console.log("| Component | Format | Raw Size | Gzip Size |");
console.log("|-----------|--------|----------|-----------|");

for (const f of files) {
  if (fs.existsSync(f.path)) {
    const raw = fs.readFileSync(f.path);
    const gz = zlib.gzipSync(raw);
    const rawKb = (raw.length / 1024).toFixed(2);
    const gzKb = (gz.length / 1024).toFixed(2);
    console.log(`| ${f.name} | ${f.path.endsWith(".css") ? "CSS" : f.path.endsWith(".cjs") ? "CJS" : f.path.endsWith(".min.js") ? "IIFE" : "ESM"} | ${rawKb} kB (${raw.length} B) | ${gzKb} kB (${gz.length} B) |`);
  } else {
    console.log(`| ${f.name} | N/A | MISSING | MISSING |`);
  }
}
