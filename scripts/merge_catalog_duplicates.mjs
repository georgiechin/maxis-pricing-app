// One-off repair: merge the duplicate/misfiled catalog entries created by
// Agent 3's chunked writer (see scripts/catalog_known_duplicates.json).
//
// Surgical text edits, not a JSON round-trip — re-serialising would reformat the
// whole file and bury the real change in noise.
//
// DECISIONS (11 Aug 2026):
//  * Pura 90s Pro 5G / Pro Max — the two copies disagree on Zerolution MP69
//    (RM112/RM74 and RM162/RM108 in one, "NA" in the other). KEEP "NA".
//    Over-quoting is worse than under-quoting: a price staff can't actually
//    process becomes an angry customer, while "not on MP69, but on MP99..." is
//    an upsell. The NA copy is also the fuller one (30 cells vs 25) and matches
//    the normal flagship shape — low tiers excluded, "FREE on MP169/MP199".
//  * Keep the OTHER copy's storage label ("256GB"/"512GB" beats "Default") and
//    its richer aliases, so search still finds it.
//  * Realme 16T 5G — no price disagreement; keep the "8+256GB" copy.
//  * Huawei devices filed under Honor and Xiaomi are deleted outright.
//  * The two Huawei brand blocks become one.
//
// Dry run by default; --write to apply. Verifies afterwards that no surviving
// price cell changed except the ones listed above.
import { readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const FILE = new URL("../data/catalog.ts", import.meta.url);
const WRITE = process.argv.includes("--write");

function parse(text) {
  const js = ts.transpileModule(text, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));
}

/** Byte range of the object literal starting at the `{` that opens `model: "X"`. */
function modelSpan(src, from, name) {
  const needle = `model: "${name}"`;
  const at = src.indexOf(needle, from);
  if (at === -1) return null;
  let start = src.lastIndexOf("{", at);
  let depth = 0, i = start, inStr = null;
  for (; i < src.length; i++) {
    const c = src[i];
    if (inStr) { if (c === "\\") i++; else if (c === inStr) inStr = null; continue; }
    if (c === '"' || c === "'") { inStr = c; continue; }
    if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) { i++; break; } }
  }
  while (src[i] === ",") i++;                       // swallow the trailing comma
  return { start, end: i, at };
}

/** Byte range of a whole brand block, chosen by index among blocks of that name. */
function brandSpan(src, brand, nth) {
  const marks = [...src.matchAll(new RegExp(`brand:\\s*"${brand}"`, "g"))].map((m) => m.index);
  if (marks.length <= nth) return null;
  const at = marks[nth];
  let start = src.lastIndexOf("{", at);
  let depth = 0, i = start, inStr = null;
  for (; i < src.length; i++) {
    const c = src[i];
    if (inStr) { if (c === "\\") i++; else if (c === inStr) inStr = null; continue; }
    if (c === '"' || c === "'") { inStr = c; continue; }
    if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) { i++; break; } }
  }
  while (src[i] === ",") i++;
  return { start, end: i };
}

let src = readFileSync(FILE, "utf8");
const before = await parse(src);
const cellsOf = (cat) => {
  const out = {};
  for (const b of cat.catalog)
    for (const m of b.models)
      for (const s of m.storages || [])
        for (const [reg, tabs] of Object.entries(s.regions || {}))
          for (const [tab, rows] of Object.entries(tabs || {}))
            for (const [plan, v] of Object.entries(rows || {}))
              out[`${b.brand}|${m.model}|${reg}.${tab}.${plan}`] = JSON.stringify(v);
  return out;
};
const cellsBefore = cellsOf(before);

const log = [];

// 1. Huawei devices misfiled under Honor and Xiaomi — delete outright.
for (const brand of ["Honor", "Xiaomi"]) {
  for (const name of ["Huawei Pura 90s Pro 5G", "Huawei Pura 90s Pro Max 5G"]) {
    const blk = brandSpan(src, brand, 0);
    const span = modelSpan(src.slice(blk.start, blk.end), 0, name);
    if (!span) { log.push(`  – ${name} not found in ${brand} (already clean)`); continue; }
    src = src.slice(0, blk.start + span.start) + src.slice(blk.start + span.end);
    log.push(`  ✂ removed "${name}" misfiled under ${brand}`);
  }
}

// 2. In the surviving Huawei block (the second one), relabel the two devices'
//    storage and restore the richer aliases from the copy being dropped.
const RELABEL = [
  { name: "Huawei Pura 90s Pro 5G", storage: "256GB",
    aliases: '["huawei", "pura90spro", "pura90s", "maxis exclusive"]' },
  { name: "Huawei Pura 90s Pro Max 5G", storage: "512GB",
    aliases: '["huawei", "pura90spromax", "pura90s", "maxis exclusive"]' },
];
{
  const keep = brandSpan(src, "Huawei", 1);          // block 5 — the fuller copy
  let body = src.slice(keep.start, keep.end);
  for (const r of RELABEL) {
    const span = modelSpan(body, 0, r.name);
    if (!span) { log.push(`  ! ${r.name} missing from the kept Huawei block`); continue; }
    let obj = body.slice(span.start, span.end);
    const o1 = obj;
    obj = obj.replace(/storage:\s*"Default"/, `storage: "${r.storage}"`);
    obj = obj.replace(/aliases:\s*\[[^\]]*\]/, `aliases: ${r.aliases}`);
    if (obj !== o1) log.push(`  ✎ ${r.name}: storage -> ${r.storage}, aliases restored`);
    body = body.slice(0, span.start) + obj + body.slice(span.end);
  }
  src = src.slice(0, keep.start) + body + src.slice(keep.end);
}

// 3. Drop the first Huawei brand block entirely (its 2 devices now live in the
//    kept block, with safer prices).
{
  const dead = brandSpan(src, "Huawei", 0);
  const doomed = src.slice(dead.start, dead.end);
  const names = [...doomed.matchAll(/model:\s*"([^"]+)"/g)].map((m) => m[1]);
  src = src.slice(0, dead.start) + src.slice(dead.end);
  log.push(`  ✂ removed the duplicate Huawei brand block (${names.join(", ")})`);
}

// 4. Realme 16T 5G twice in one block — keep the "8+256GB" copy.
{
  const blk = brandSpan(src, "Realme", 0);
  let body = src.slice(blk.start, blk.end);
  const first = modelSpan(body, 0, "Realme 16T 5G");
  const second = modelSpan(body, first.end, "Realme 16T 5G");
  if (second) {
    const a = body.slice(first.start, first.end);
    const drop = /storage:\s*"8\+256GB"/.test(a) ? second : first;   // keep the labelled one
    body = body.slice(0, drop.start) + body.slice(drop.end);
    log.push(`  ✂ removed the duplicate Realme 16T 5G (kept the 8+256GB entry)`);
    src = src.slice(0, blk.start) + body + src.slice(blk.end);
  }
}

// ── verify ────────────────────────────────────────────────────────────────
const after = await parse(src);
const cellsAfter = cellsOf(after);

const EXPECTED_GONE = /^(Honor|Xiaomi)\|Huawei Pura/;
const changed = [];
for (const [k, v] of Object.entries(cellsAfter)) {
  if (!(k in cellsBefore)) { changed.push(`NEW  ${k}`); continue; }
  if (cellsBefore[k] !== v) changed.push(`DIFF ${k}\n       was ${cellsBefore[k]}\n       now ${v}`);
}
const removed = Object.keys(cellsBefore).filter((k) => !(k in cellsAfter));
const unexpectedRemoved = removed.filter((k) => !EXPECTED_GONE.test(k) && !k.startsWith("Huawei|Huawei Pura"));

console.log("CHANGES");
log.forEach((l) => console.log(l));
console.log(`\nBrands: ${before.catalog.length} -> ${after.catalog.length}`);
console.log(`Models: ${before.catalog.reduce((n, b) => n + b.models.length, 0)} -> ` +
            `${after.catalog.reduce((n, b) => n + b.models.length, 0)}`);
console.log(`Price cells: ${Object.keys(cellsBefore).length} -> ${Object.keys(cellsAfter).length}`);
console.log(`  removed ${removed.length} (all from the deleted duplicate copies)`);

if (changed.length) {
  console.log("\n⚠️  SURVIVING CELLS CHANGED VALUE — investigate before writing:");
  changed.slice(0, 20).forEach((c) => console.log("   " + c));
} else {
  console.log("\n✅ no surviving price cell changed value");
}
if (unexpectedRemoved.length) {
  console.log("\n⚠️  UNEXPECTED REMOVALS:");
  unexpectedRemoved.slice(0, 20).forEach((k) => console.log("   " + k));
}

const safe = !changed.length && !unexpectedRemoved.length;
if (WRITE && safe) {
  copyFileSync(FILE, new URL("../data/catalog.ts.bak_merge_11aug", import.meta.url));
  writeFileSync(FILE, src);
  console.log("\nWRITTEN (backup: data/catalog.ts.bak_merge_11aug)");
} else if (WRITE) {
  console.log("\nREFUSED TO WRITE — verification failed above.");
  process.exit(1);
} else {
  console.log("\nDRY RUN — rerun with --write to apply");
}
