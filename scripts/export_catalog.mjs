// Export the live device catalog (data/catalog.ts) to data/catalog.json so other
// tools (e.g. the Smart WhatsApp AI Agent) can read the SAME prices the pricing
// app shows — single source of truth. Re-run after any GTM price update.
//
//   node scripts/export_catalog.mjs
//
import { readFileSync, writeFileSync, unlinkSync } from "fs";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcPath = path.join(root, "data", "catalog.ts");
const tmpPath = path.join(root, "data", "_catalog_export_tmp.mjs");
const outPath = path.join(root, "data", "catalog.json");

const src = readFileSync(srcPath, "utf8");
const js = ts.transpileModule(src, {
  compilerOptions: { module: "ESNext", target: "ES2020" },
}).outputText;

writeFileSync(tmpPath, js);
try {
  const mod = await import("file://" + tmpPath.replace(/\\/g, "/") + "?t=" + Date.now());
  const catalog = mod.catalog;
  if (!Array.isArray(catalog)) throw new Error("catalog export is not an array");
  writeFileSync(outPath, JSON.stringify(catalog));
  const devices = catalog.reduce(
    (n, b) => n + (b.models?.reduce((m, md) => m + (md.storages?.length || 1), 0) || 0),
    0
  );
  console.log(`catalog.json written: ${catalog.length} brands, ~${devices} device variants`);
} finally {
  try { unlinkSync(tmpPath); } catch {}
}
