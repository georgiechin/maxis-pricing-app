#!/usr/bin/env python3
"""
Audit data/catalog.ts for internal data-integrity inconsistencies.

The catalog is TypeScript, but the `catalog` array literal is JSON-like.
We extract that array, normalise it into valid JSON, then walk every device
and apply a set of integrity rules.

Usage:
    python scripts/audit_catalog.py [path/to/catalog.ts]

Exit code is 0 if no CRITICAL issues found, 1 otherwise.
"""

import json
import re
import sys
from pathlib import Path

ECEM_PLANS = {"MP48", "MP69", "MP89", "MP99", "MP109", "MP139", "MP169", "MP199"}
HOTLINK_PLANS = {"HP45", "HP65", "HP75"}

UPFRONT_MODES = ("upfront", "upfront36")
HOTLINK_MODES = ("hotlink12", "hotlink24")

# A devicePrice more than this multiple of RRP is "absurd".
ABSURD_RRP_MULTIPLE = 1.5


def find_catalog_file():
    if len(sys.argv) > 1:
        return Path(sys.argv[1])
    here = Path(__file__).resolve().parent
    return here.parent / "data" / "catalog.ts"


def extract_catalog_json(ts_text):
    """Extract `export const catalog: ... = [ ... ];` and convert to JSON."""
    # Find the start of the catalog array.
    m = re.search(r"export const catalog\s*:[^=]*=\s*\[", ts_text)
    if not m:
        raise RuntimeError("Could not find `export const catalog` array.")
    start = m.end() - 1  # position of the opening '['

    # Walk braces/brackets to find the matching close, ignoring strings/comments.
    depth = 0
    i = start
    n = len(ts_text)
    in_str = False
    str_ch = ""
    end = None
    while i < n:
        ch = ts_text[i]
        if in_str:
            if ch == "\\":
                i += 2
                continue
            if ch == str_ch:
                in_str = False
            i += 1
            continue
        # not in string
        if ch in ('"', "'"):
            in_str = True
            str_ch = ch
            i += 1
            continue
        # line comment
        if ch == "/" and i + 1 < n and ts_text[i + 1] == "/":
            j = ts_text.find("\n", i)
            i = n if j == -1 else j
            continue
        # block comment
        if ch == "/" and i + 1 < n and ts_text[i + 1] == "*":
            j = ts_text.find("*/", i)
            i = n if j == -1 else j + 2
            continue
        if ch in "[{":
            depth += 1
        elif ch in "]}":
            depth -= 1
            if depth == 0:
                end = i
                break
        i += 1

    if end is None:
        raise RuntimeError("Could not find end of catalog array.")

    body = ts_text[start : end + 1]
    return tsobj_to_json(body)


def tsobj_to_json(body):
    """Convert a JS object/array literal (JSON-ish) into strict JSON."""
    out = []
    i = 0
    n = len(body)
    in_str = False
    str_ch = ""
    while i < n:
        ch = body[i]
        if in_str:
            if ch == "\\":
                # handle escape sequence
                nxt = body[i + 1] if i + 1 < n else ""
                if str_ch == "'" and nxt == "'":
                    # \' inside single-quoted -> plain ' in JSON
                    out.append("'")
                else:
                    out.append("\\")
                    if nxt:
                        out.append(nxt)
                i += 2
                continue
            if ch == str_ch:
                in_str = False
                out.append('"')
                i += 1
                continue
            if ch == '"':
                # raw double quote inside a (single-quoted) string -> escape
                out.append('\\"')
                i += 1
                continue
            out.append(ch)
            i += 1
            continue
        # not in string
        if ch in ('"', "'"):
            # normalise single-quoted strings to double quotes
            in_str = True
            str_ch = ch
            out.append('"')
            i += 1
            continue
        # line comment
        if ch == "/" and i + 1 < n and body[i + 1] == "/":
            j = body.find("\n", i)
            i = n if j == -1 else j
            continue
        # block comment
        if ch == "/" and i + 1 < n and body[i + 1] == "*":
            j = body.find("*/", i)
            i = n if j == -1 else j + 2
            continue
        out.append(ch)
        i += 1

    s = "".join(out)

    # Quote unquoted object keys:  key:  ->  "key":
    s = re.sub(r"([{,]\s*)([A-Za-z_$][\w$]*)\s*:", r'\1"\2":', s)

    # Remove trailing commas before } or ]
    s = re.sub(r",(\s*[}\]])", r"\1", s)

    return json.loads(s)


# ---------------------------------------------------------------------------
# Issue collection
# ---------------------------------------------------------------------------

issues = []  # each: (severity, category, message)


def add(severity, category, message):
    issues.append((severity, category, message))


def is_num(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def is_na(v):
    return isinstance(v, str) and v.strip().upper() == "NA"


def ctx(brand, model, storage, region, mode, plan):
    return f"{brand} / {model} [{storage}] {region}.{mode}.{plan}"


def audit():
    catalog_path = find_catalog_file()
    ts_text = catalog_path.read_text(encoding="utf-8")
    catalog = extract_catalog_json(ts_text)

    seen_devices = {}  # (model_lower, storage_lower) -> context

    device_count = 0
    row_count = 0

    for brand_obj in catalog:
        brand = brand_obj.get("brand", "?")
        for model_obj in brand_obj.get("models", []):
            model = model_obj.get("model", "?")
            for st in model_obj.get("storages", []):
                device_count += 1
                storage = st.get("storage", "?")
                rrp = st.get("rrp")

                regions = st.get("regions", {})
                region_set = set(regions.keys())

                # Rule 6: duplicate devices (model + storage).
                # A genuine duplicate is one where the same model+storage is
                # listed twice AND the two listings share a region (conflicting
                # pricing). The same model split across Hotlink-only and
                # Maxis-postpaid-only entries is by design, so we report that
                # separately at lower severity.
                key = (model.strip().lower(), str(storage).strip().lower())
                if key in seen_devices:
                    prev_brand, prev_regions = seen_devices[key]
                    overlap = region_set & prev_regions
                    if overlap:
                        add(
                            "WARNING",
                            "Duplicate device (region conflict)",
                            f"{brand} / {model} [{storage}] duplicates "
                            f"{prev_brand} entry; both define region(s) "
                            f"{sorted(overlap)} - pricing may conflict",
                        )
                    else:
                        add(
                            "INFO",
                            "Cross-platform listing",
                            f"{model} [{storage}] listed under both "
                            f"{prev_brand} ({sorted(prev_regions)}) and "
                            f"{brand} ({sorted(region_set)}) - expected for "
                            f"Hotlink + Maxis split",
                        )
                else:
                    seen_devices[key] = (brand, region_set)

                for region, modes in regions.items():
                    # determine allowed plan keys for this region
                    if region == "ECEM":
                        allowed = ECEM_PLANS
                    elif region == "HOTLINK":
                        allowed = HOTLINK_PLANS
                    else:
                        allowed = None
                        add(
                            "WARNING",
                            "Unknown region",
                            f"{brand} / {model} [{storage}] has unexpected region key "
                            f"'{region}'",
                        )

                    zero24_map = modes.get("zero24", {})
                    zero36_map = modes.get("zero36", {})

                    for mode, rows in modes.items():
                        if not isinstance(rows, dict):
                            continue
                        for plan, row in rows.items():
                            if not isinstance(row, dict):
                                continue
                            row_count += 1
                            where = ctx(brand, model, storage, region, mode, plan)

                            # Rule 4: plan key validity
                            if allowed is not None and plan not in allowed:
                                add(
                                    "WARNING",
                                    "Invalid plan key",
                                    f"{where}: plan '{plan}' not valid for region {region} "
                                    f"(allowed: {sorted(allowed)})",
                                )

                            dp = row.get("devicePrice")
                            dap = row.get("dap")
                            total = row.get("totalUpfront")
                            monthly = row.get("monthly")

                            # Rule 5: negative / absurd values
                            for fld_name, val in (
                                ("devicePrice", dp),
                                ("dap", dap),
                                ("monthly", monthly),
                                ("totalUpfront", total),
                            ):
                                if is_num(val) and val < 0:
                                    add(
                                        "CRITICAL",
                                        "Negative value",
                                        f"{where}: {fld_name} is negative ({val})",
                                    )
                            if (
                                is_num(dp)
                                and is_num(rrp)
                                and rrp > 0
                                and dp > rrp * ABSURD_RRP_MULTIPLE
                            ):
                                add(
                                    "CRITICAL",
                                    "Absurd devicePrice",
                                    f"{where}: devicePrice {dp} far exceeds RRP {rrp} "
                                    f"(> {ABSURD_RRP_MULTIPLE}x)",
                                )

                            # Upfront / hotlink math + NA + missing total
                            if mode in UPFRONT_MODES or mode in HOTLINK_MODES:
                                # Rule 2: NA consistency (only meaningful where the
                                # row carries devicePrice/dap/totalUpfront)
                                na_flags = {
                                    "devicePrice": is_na(dp),
                                    "dap": is_na(dap),
                                    "totalUpfront": is_na(total),
                                }
                                present = {
                                    k: v
                                    for k, v in (
                                        ("devicePrice", dp),
                                        ("dap", dap),
                                        ("totalUpfront", total),
                                    )
                                    if v is not None
                                }
                                any_na = any(na_flags[k] for k in present)
                                all_na = all(is_na(v) for v in present.values()) if present else False
                                if any_na and not all_na:
                                    detail = ", ".join(
                                        f"{k}={present[k]!r}" for k in present
                                    )
                                    add(
                                        "WARNING",
                                        "NA inconsistency",
                                        f"{where}: mix of NA and numeric fields ({detail})",
                                    )

                                # Rule 1/3: upfront math
                                if is_num(dp) and is_num(dap):
                                    expected = dp + dap
                                    if is_num(total):
                                        if abs(total - expected) > 0.001:
                                            add(
                                                "CRITICAL",
                                                "Upfront math",
                                                f"{where}: totalUpfront {total} != "
                                                f"devicePrice {dp} + dap {dap} = {expected}",
                                            )
                                    elif total is None or is_na(total):
                                        # Rule 8: missing/non-numeric total
                                        # (skip if everything is NA, handled above)
                                        if not (is_na(dp) or is_na(dap)):
                                            add(
                                                "CRITICAL",
                                                "Missing totalUpfront",
                                                f"{where}: devicePrice {dp} + dap {dap} "
                                                f"= {expected} but totalUpfront is "
                                                f"{total!r}",
                                            )

                    # Rule 7: zero36 monthly should be <= zero24 monthly per plan
                    for plan, z36 in zero36_map.items():
                        z24 = zero24_map.get(plan)
                        if not isinstance(z36, dict) or not isinstance(z24, dict):
                            continue
                        m36 = z36.get("monthly")
                        m24 = z24.get("monthly")
                        if is_num(m36) and is_num(m24) and m36 > m24:
                            add(
                                "WARNING",
                                "Zerolution swap",
                                f"{brand} / {model} [{storage}] {region}.{plan}: "
                                f"zero36 monthly {m36} > zero24 monthly {m24} "
                                f"(longer term should be cheaper)",
                            )

    return device_count, row_count


def main():
    try:
        device_count, row_count = audit()
    except Exception as e:  # pragma: no cover
        print(f"ERROR parsing catalog: {e}", file=sys.stderr)
        sys.exit(2)

    crit = [i for i in issues if i[0] == "CRITICAL"]
    warn = [i for i in issues if i[0] == "WARNING"]
    info = [i for i in issues if i[0] == "INFO"]

    print("=" * 70)
    print(f"CATALOG AUDIT - {device_count} device-storage entries, {row_count} pricing rows")
    print("=" * 70)

    def dump(group, label):
        print(f"\n{label} ({len(group)})")
        print("-" * 70)
        if not group:
            print("  (none)")
            return
        # group by category
        by_cat = {}
        for sev, cat, msg in group:
            by_cat.setdefault(cat, []).append(msg)
        for cat in sorted(by_cat):
            print(f"\n  [{cat}]")
            for msg in by_cat[cat]:
                print(f"    - {msg}")

    dump(crit, "CRITICAL")
    dump(warn, "WARNING")
    dump(info, "INFO")

    print("\n" + "=" * 70)
    print(
        f"TOTAL: {len(crit)} critical, {len(warn)} warning, {len(info)} info"
    )
    print("=" * 70)

    sys.exit(1 if crit else 0)


if __name__ == "__main__":
    main()
