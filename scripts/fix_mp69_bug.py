"""
Fix systematic MP69 zerolution copy-error.
The MP48 value was wrongly copied into MP69 (MP69 should be the 3rd PDF column,
not the MP48 value). Correct values verified against RFS 4 June PDF compiled
zerolution tables (column order: MP48 | MFP399 | MP69 | MP99 | MP89 | ...).
"""
import re, sys, pathlib

CATALOG = pathlib.Path(__file__).parent.parent / "data" / "catalog.ts"

# model -> {mode: correct MP69 monthly value ("NA" or number)}
FIXES = {
    "Vivo V60 Lite 5G":     {"zero24": "65", "zero36": "45"},
    "Vivo X Fold 5 5G":     {"zero24": "NA", "zero36": "NA"},
    "Redmi Note 15 Pro 5G": {"zero24": "60", "zero36": "40"},
    "Xiaomi 15T 5G":        {"zero24": "80", "zero36": "55"},
    "Xiaomi 15T Pro 5G":    {"zero24": "NA", "zero36": "NA"},
    "Xiaomi 17 Ultra 5G":   {"zero24": "NA", "zero36": "NA"},
}

content = CATALOG.read_text(encoding="utf-8")
lines = content.split("\n")

def mp69_line(val):
    if val == "NA":
        return 'MP69: { monthly: "NA", dapLabel: "NA" },'
    return f'MP69: {{ monthly: {val}, dapLabel: "Check ECC" }},'

current_model = None
current_mode = None
fixed = []
for i, ln in enumerate(lines):
    s = ln.strip()
    m = re.match(r'model: "(.+?)"', s)
    if m:
        current_model = m.group(1); current_mode = None; continue
    if s.startswith("zero24:"): current_mode = "zero24"; continue
    if s.startswith("zero36:"): current_mode = "zero36"; continue
    if s.startswith(("upfront", "hotlink", "HOTLINK", "regions")): current_mode = None
    if current_model in FIXES and current_mode in FIXES.get(current_model, {}):
        if s.startswith("MP69: {"):
            new = mp69_line(FIXES[current_model][current_mode])
            indent = ln[:len(ln) - len(ln.lstrip())]
            lines[i] = indent + new
            fixed.append(f"{current_model} {current_mode} -> MP69 {FIXES[current_model][current_mode]}")
            current_mode = None  # only first MP69 in the block

CATALOG.write_text("\n".join(lines), encoding="utf-8")
print(f"Applied {len(fixed)} fixes:")
for f in fixed:
    print("  OK", f)
if len(fixed) != 12:
    print(f"WARNING: expected 12 fixes, got {len(fixed)}")
    sys.exit(1)
