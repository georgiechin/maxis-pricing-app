// Correct Zerolution monthly figures in data/catalog.ts against the 23 Jul 2026
// GTM deck. Agent 3 wrote several rows one cell out of step: a value is repeated
// early and the last one is lost, e.g. Pixel 10a MP89/MP99/MP109 all 95 where
// the deck reads 95 / 80 / 80, and MP199 55 where the deck reads 40.
//
// The corrections are passed in as explicit data (see DECK below), read from the
// PDF by HEADER X-COORDINATE, not by counting values. That distinction already
// cost one wrong conclusion today: the Zerolution header is
//   RRP | MP48 | MFP-299 | MFP-399 | MP69 | MP99 | MP89 | MP109 | MP139 | MP169 | MP199
// so MP48 precedes the fibre columns and MP99 precedes MP89. Assuming either the
// "natural" order or ascending plan numbers shifts every row and invents errors.
// The mapping is corroborated where deck and catalog already agree (Pura 90s Pro:
// MP99 110, MP89 NA in both).
//
// Only cells that actually differ are touched. Verified afterwards by re-reading
// the catalog and requiring an exact match on every listed cell.
import { readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const FILE = new URL("../data/catalog.ts", import.meta.url);
const WRITE = process.argv.includes("--write");

// device -> storage -> tab -> plan -> deck value
const DECK = {
  "Google Pixel 10 5G": { "256GB": {
    zero24: { MP89: 175 },
    zero36: {},
  }},
  "Google Pixel 10a 5G": { "256GB": {
    zero24: { MP99: 80, MP109: 80, MP139: 70, MP169: 55, MP199: 40 },
    zero36: {},
  }},
  "Google Pixel 10 Pro 5G": {
    "512GB": { zero36: { MP99: 150 } },
    "1TB":   { zero24: { MP99: 250 } },
  },
  "Google Pixel 10 Pro XL 5G": {
    "256GB": { zero24: { MP99: 200 }, zero36: { MP99: 140 } },
    "512GB": { zero24: { MP89: 260 }, zero36: { MP89: 175 } },
    "1TB":   { zero24: { MP89: 300 }, zero36: { MP89: 200 } },
  },
  "Honor Pad 10 5G": { "Default": { zero24: { MP69: 70 } } },
  "Huawei Mate 80 Pro": { "Default": {
    zero24: { MP99: 130, MP139: 120 },
    zero36: { MP99: 90 },
  }},
  "Huawei Mate X7": { "Default": {
    zero24: { MP99: 305 },
    zero36: { MP99: 210 },
  }},
  "Huawei Mate XT": { "Default": {
    zero24: { MP99: 569, MP139: 559 },
    zero36: { MP99: 409 },
  }},
};

/** Balanced-brace span of the object opened by the `{` before `at`. */
function spanFrom(src, at) {
  let start = src.lastIndexOf("{", at);
  let depth = 0, i = start, inStr = null;
  for (; i < src.length; i++) {
    const c = src[i];
    if (inStr) { if (c === "\\") i++; else if (c === inStr) inStr = null; continue; }
    if (c === '"' || c === "'") { inStr = c; continue; }
    if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) { i++; break; } }
  }
  return { start, end: i };
}

/** Span of `key: {` … `}` inside [from,to). */
function keySpan(src, key, from, to) {
  const re = new RegExp(`\\b${key}\\s*:\\s*\\{`, "g");
  re.lastIndex = from;
  const m = re.exec(src.slice(0, to));
  if (!m || m.index >= to) return null;
  return spanFrom(src, m.index + m[0].length - 1);
}

let src = readFileSync(FILE, "utf8");
const edits = [];

for (const [model, storages] of Object.entries(DECK)) {
  const mAt = src.indexOf(`model: "${model}"`);
  if (mAt === -1) { edits.push({ err: `model not found: ${model}` }); continue; }
  const mSpan = spanFrom(src, mAt);

  for (const [storage, tabs] of Object.entries(storages)) {
    // find the storage entry inside this model
    const sRe = new RegExp(`storage:\\s*"${storage.replace(/[+]/g, "\\$&")}"`);
    const sm = sRe.exec(src.slice(mSpan.start, mSpan.end));
    if (!sm) { edits.push({ err: `storage ${storage} not found in ${model}` }); continue; }
    const sSpan = spanFrom(src, mSpan.start + sm.index);

    for (const [tab, plans] of Object.entries(tabs)) {
      if (!Object.keys(plans).length) continue;
      const tSpan = keySpan(src, tab, sSpan.start, sSpan.end);
      if (!tSpan) { edits.push({ err: `${tab} not found for ${model} [${storage}]` }); continue; }

      for (const [plan, want] of Object.entries(plans)) {
        const pSpan = keySpan(src, plan, tSpan.start, tSpan.end);
        if (!pSpan) { edits.push({ err: `${plan} not found in ${model} ${tab}` }); continue; }
        const body = src.slice(pSpan.start, pSpan.end);
        const mm = /monthly:\s*("NA"|'NA'|[-\d.]+)/.exec(body);
        if (!mm) { edits.push({ err: `no monthly in ${model} ${tab}.${plan}` }); continue; }
        const had = mm[1];
        if (had === String(want)) continue;                       // already right
        const patched = body.slice(0, mm.index) +
                        mm[0].replace(mm[1], String(want)) +
                        body.slice(mm.index + mm[0].length);
        src = src.slice(0, pSpan.start) + patched + src.slice(pSpan.end);
        edits.push({ model, storage, tab, plan, had, want });
      }
    }
  }
}

const errs = edits.filter((e) => e.err);
const good = edits.filter((e) => !e.err);

console.log("PLANNED EDITS");
for (const e of good) {
  console.log(`  ${e.model} [${e.storage}] ${e.tab}.${e.plan}: ${e.had} -> ${e.want}`);
}
if (errs.length) {
  console.log("\nPROBLEMS (nothing written for these):");
  errs.forEach((e) => console.log("  ! " + e.err));
}
console.log(`\n${good.length} cell(s) to change, ${errs.length} problem(s)`);

// ── verify by re-parsing ──────────────────────────────────────────────────
const js = ts.transpileModule(src, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { catalog } = await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));

let bad = 0;
for (const [model, storages] of Object.entries(DECK)) {
  for (const [storage, tabs] of Object.entries(storages)) {
    for (const [tab, plans] of Object.entries(tabs)) {
      for (const [plan, want] of Object.entries(plans)) {
        let got;
        for (const b of catalog) for (const m of b.models) {
          if (m.model !== model) continue;
          for (const s of m.storages) {
            if (s.storage !== storage) continue;
            got = ((s.regions?.ECEM || {})[tab] || {})[plan]?.monthly;
          }
        }
        if (String(got) !== String(want)) {
          console.log(`  ✗ verify ${model} [${storage}] ${tab}.${plan}: want ${want}, got ${JSON.stringify(got)}`);
          bad++;
        }
      }
    }
  }
}
console.log(bad ? `\n${bad} cell(s) FAILED verification` : "\n✅ every targeted cell now matches the deck");

if (WRITE && !bad && !errs.length) {
  copyFileSync(FILE, new URL("../data/catalog.ts.bak_zerofix", import.meta.url));
  writeFileSync(FILE, src);
  console.log("WRITTEN (backup: data/catalog.ts.bak_zerofix)");
} else if (WRITE) {
  console.log("REFUSED TO WRITE — see failures above.");
  process.exit(1);
} else {
  console.log("DRY RUN — rerun with --write to apply");
}
