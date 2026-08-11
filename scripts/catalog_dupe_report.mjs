// Compares every duplicated catalog entry field-by-field so a merge decision is
// made on evidence, not on which copy happens to be longer.
//
// Duplicates matter beyond tidiness: the app keys search results by
// `${brand}-${model}`, so two entries sharing a key make React unable to unmount
// the old rows, which leaves ghost results pinned above every search.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const src = readFileSync(new URL("../data/catalog.ts", import.meta.url), "utf8");
const js = ts.transpileModule(src, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { catalog } = await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));

// ── collect every (brand, model) occurrence, keeping its block index ────────
const seen = new Map();
catalog.forEach((brand, bi) => {
  brand.models.forEach((model, mi) => {
    const key = `${brand.brand}|${model.model}`;
    if (!seen.has(key)) seen.set(key, []);
    seen.get(key).push({ bi, mi, brand: brand.brand, model });
  });
});

// ── brand blocks appearing more than once ──────────────────────────────────
const brandCount = {};
catalog.forEach((b, i) => (brandCount[b.brand] = [...(brandCount[b.brand] || []), i]));
console.log("=== BRAND BLOCKS ===");
Object.entries(brandCount).forEach(([b, idx]) => {
  const flag = idx.length > 1 ? "  <-- SPLIT" : "";
  console.log(`  ${b.padEnd(10)} block(s) ${idx.join(", ")}   models: ${idx.map((i) => catalog[i].models.length).join(" + ")}${flag}`);
});

// ── models filed under a brand their name contradicts ──────────────────────
const BRAND_WORDS = ["Huawei", "Samsung", "Apple", "iPhone", "Honor", "Vivo", "Oppo",
                     "Realme", "Xiaomi", "Google", "Pixel", "Nubia", "Redmagic"];
console.log("\n=== MISFILED (model name names a different brand) ===");
let misfiled = 0;
catalog.forEach((brand, bi) => {
  brand.models.forEach((model) => {
    const named = BRAND_WORDS.find((w) => new RegExp(`^${w}\\b`, "i").test(model.model));
    if (!named) return;
    const canon = named === "iPhone" ? "Apple" : named === "Pixel" ? "Google" : named;
    if (canon.toLowerCase() !== brand.brand.toLowerCase() && brand.brand !== "Hotlink") {
      console.log(`  block ${bi} "${brand.brand}" contains "${model.model}"  -> belongs in ${canon}`);
      misfiled++;
    }
  });
});
if (!misfiled) console.log("  none");

// ── field-by-field comparison of duplicate keys ────────────────────────────
const planKeys = (model) => {
  const out = new Set();
  for (const s of model.storages || [])
    for (const [reg, tabs] of Object.entries(s.regions || {}))
      for (const [tab, rows] of Object.entries(tabs || {}))
        for (const plan of Object.keys(rows || {})) out.add(`${s.storage}/${reg}/${tab}/${plan}`);
  return out;
};
/**
 * Cells keyed for cross-copy comparison. The storage LABEL is deliberately left
 * out when a model has a single storage: duplicate copies routinely disagree on
 * the label ("256GB" vs "Default") while describing the same physical variant,
 * and keying on it would make the two copies share no cells at all — which reads
 * as "no disagreement" when nothing was actually compared.
 */
const priceMap = (model) => {
  const m = {};
  const single = (model.storages || []).length === 1;
  for (const s of model.storages || [])
    for (const [reg, tabs] of Object.entries(s.regions || {}))
      for (const [tab, rows] of Object.entries(tabs || {}))
        for (const [plan, v] of Object.entries(rows || {}))
          m[`${single ? "" : s.storage + "/"}${reg}/${tab}/${plan}`] = JSON.stringify(v);
  return m;
};

console.log("\n=== DUPLICATE KEYS (same brand + same model) ===");
let dupes = 0;
for (const [key, hits] of seen) {
  if (hits.length < 2) continue;
  dupes++;
  console.log(`\n--- ${key}   (${hits.length} copies)`);
  hits.forEach((h, n) => {
    const st = h.model.storages.map((s) => s.storage).join(" / ");
    console.log(`  copy ${n + 1}: block ${h.bi}  storages[${st}]  rrp[${h.model.storages.map((s) => s.rrp).join(",")}]  ` +
                `plan-cells ${planKeys(h.model).size}  aliases[${(h.model.aliases || []).join(",")}]`);
  });
  // do any shared cells DISAGREE on price? that is the only dangerous case
  const maps = hits.map((h) => priceMap(h.model));
  const conflicts = [];
  const allCells = new Set(maps.flatMap((m) => Object.keys(m)));
  for (const cell of allCells) {
    const vals = [...new Set(maps.map((m) => m[cell]).filter((v) => v !== undefined))];
    if (vals.length > 1) conflicts.push({ cell, vals });
  }
  if (conflicts.length) {
    console.log(`  ⚠️  ${conflicts.length} cell(s) DISAGREE on price — a merge must not be automatic:`);
    conflicts.slice(0, 8).forEach((c) => console.log(`       ${c.cell}: ${c.vals.join("   vs   ")}`));
  } else {
    console.log(`  ✅ no price disagreement — copies differ only by coverage, safe to keep the fuller one`);
    const sizes = maps.map((m) => Object.keys(m).length);
    const best = sizes.indexOf(Math.max(...sizes));
    console.log(`     keep copy ${best + 1} (block ${hits[best].bi}, ${sizes[best]} cells vs ${sizes.join("/")})`);
  }
}
if (!dupes) console.log("  none");
