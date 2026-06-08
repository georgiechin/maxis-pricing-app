# GTM Update Playbook — Maxis Pricing App (full-auto)

This is the accumulated, battle-tested procedure for applying a new Maxis GTM
update to the catalog and shipping it. READ THIS FIRST on every run. Append new
lessons to "Known traps" whenever you hit something new — that's how this gets
smarter over time.

Repo: `data/catalog.ts` (devices), `data/homewifi.ts` (5G Home WiFi).
Audit: `python scripts/audit_catalog.py` (must be 0 critical before any push).

---

## SCOPE — what belongs in THIS app

IN (consumer counter tool):
- Maxis Postpaid plans: MP48, MP69, MP89, MP99, MP109, MP139, MP169, MP199
- Hotlink Postpaid plans: HP45, HP65, HP75
- 5G Home WiFi (WiFi 69/99/139/159 + routers) → `data/homewifi.ts`

OUT (do NOT add — different products/customers):
- Enterprise / Business Postpaid (MBP*, MFP business), AirFibre, SME deals
- Home Fibre + Home Devices (TVs, PS5, iPad on Zerolution)
- Hotlink Prepaid (passes, top-ups)
If an email is one of these, note it in the summary and skip it.

---

## PDF COLUMN MAPPING (critical)

Compiled tables column order:
`MP48 | MFP399 (new FP) | MP69 | MP89 | MP99 | MP109 | MP139 | MP169 | MP199`
- catalog `MP48` key == PDF **MP48** column (NOT MFP399).
- **MFP399 is NOT tracked** in the catalog — ignore that column.
- DTP = Dealer Transfer Price = dealer's COST (not customer price). Never put DTP
  in the catalog. DAP = Device Advance Payment = refundable deposit, rebated.

---

## KNOWN TRAPS (learned the hard way — check every time)

1. **MP69 == MP48 copy error.** If a zerolution row shows MP69 monthly identical
   to MP48, it's almost certainly a data-entry copy mistake — the real MP69 is
   the 3rd column. This caused a 6-device overcharge bug. Verify against the
   compiled table's actual MP69 column.
2. **Old price vs new price side-by-side.** Device-specific pages often show
   "old / new" pairs (e.g. "899 / 199"). Use the NEW value. Cross-check the
   device-specific page against the compiled table (they can disagree — trust the
   newer/device-specific page for new pricing, but confirm).
3. **"Do not sell" warnings.** GTM sometimes flags a plan/price as wrong (e.g.
   "S26 on MP89 incorrect, do not sell"). Do NOT apply those values — leave as-is
   or NA, and FLAG in the summary.
4. **totalUpfront = devicePrice + dap** on every upfront/hotlink row. The audit
   enforces this. If your edit breaks it, you mis-keyed.
5. **NA consistency.** If devicePrice is "NA", dap and totalUpfront must be "NA" too.
6. **zero36 monthly < zero24 monthly** for the same plan (longer term = lower).
   If reversed, you swapped them.

---

## PROCEDURE

1. Gmail: search `from:maxis.com.my newer_than:Nd has:attachment`, GTM/device/
   RFS/Hotlink/Postpaid subjects. Get full thread → PDF attachment IDs.
2. Save new PDFs to Drive folder `0ADp-Lnz8jxDBUk9PVA` (skip if already there).
3. Decode the PDF: base64 from Drive is too big to read inline — write bytes to a
   file, then parse with `pdfplumber` (use `python -X utf8`, errors='replace').
4. Identify in-scope device changes (see SCOPE). List new devices, price changes,
   EOL flags. Filter out everything OUT-of-scope.
5. Apply edits to `data/catalog.ts`:
   - Price change → edit the device's region/tab/plan values.
   - New device → insert at the correct brand block, near devices of similar RRP.
   - EOL / stock-ending → add `eol: true,` after the model's `aliases:` line.
   - Use a Python script with a `replace_unique()` helper (assert exactly 1 match
     before replacing) — see scripts/update_jun4.py for the pattern.
6. **GATE: `python scripts/audit_catalog.py` → must be `0 critical`.**
   If not, STOP. Do not push. Fix or flag.
7. `npx tsc --noEmit` → clean (a pre-existing layout.tsx note is fine).
8. Metadata in `data/catalog.ts`:
   - Bump `CATALOG_DATE` to the GTM effective date (YYYY-MM-DD). This busts the
     PWA cache so staff phones pull the update. ALWAYS bump on any catalog change.
   - If it's a new pricing GTM, update `CATALOG_SOURCE` (e.g. "GTM 11 June 2026").
     If only a flag/EOL changed (no prices), leave CATALOG_SOURCE as-is.
   - Add a `LATEST_UPDATES` entry at the top (type "new"/"change"/"alert").
9. `npm run build` → confirms gen-sw regenerates `public/sw.js` with the new
   `CACHE = maxis-<date>` key, and the app compiles.
10. Commit (audit/TS/build results in the message), push to branch AND main.
11. Summarize to the user: what changed, what was out-of-scope, audit result.

---

## DEPLOY GOTCHAS (don't re-break these)

- `.vercelignore` must NOT exclude all of `scripts/` — `scripts/gen-sw.mjs` runs
  in the build (prebuild). Exclude `*.py` + `__pycache__` + `*.md` instead.
  (A blanket `scripts/` once stripped gen-sw.mjs → every deploy failed.)
- `@vercel/analytics` is a dependency (in package.json) and layout.tsx imports it
  alongside `<SwRegister />`. Keep both.
- Verify the production deploy goes green after pushing (Vercel MCP:
  list_deployments → state READY). The last GREEN production deploy is what's live.

---

## DO NOT auto-push when UNSURE

Full-auto means clear, verified changes. If a value is genuinely unconfirmed —
not in the current GTM PDF, or source ambiguous — do NOT guess and push. Apply
what's certain, and FLAG the uncertain item for the user.
Currently open/unconfirmed: Vivo V70 5G and Vivo X200 FE 5G (MP69==MP48 signature
but not in the 4 June PDF — needs source confirmation before fixing).
