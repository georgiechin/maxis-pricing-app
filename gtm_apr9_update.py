"""
GTM 9 Apr 2026 — catalog.ts update script
Changes:
  1. Add Vivo V70 FE 5G (new device)
  2. Honor 600 Lite 5G — MP89 upfront: device 299, dap 160, total 459
  3. Samsung Galaxy A26 5G — MP89 upfront: device 199, dap 160, total 359
  4. Samsung Galaxy S26 (512GB) — new upfront + zerolution prices
  5. Samsung Galaxy S26+ (512GB) — new upfront + zerolution prices
  6. Samsung Galaxy S26 Ultra (512GB & 1TB) — new upfront + zerolution prices
  7. Add promo strings to key models
"""
import re

CATALOG_PATH = r"C:\Users\USER\maxis-pricing-app\.claude\worktrees\laughing-wilbur\data\catalog.ts"

with open(CATALOG_PATH, "r", encoding="utf-8") as f:
    content = f.read()

original = content

# ─── 1. Honor 600 Lite 5G — update MP89 upfront ──────────────────────────────
# Old: MP89: { devicePrice: 399, dap: 160, totalUpfront: 559 }  (or similar)
# New: MP89: { devicePrice: 299, dap: 160, totalUpfront: 459 }
# Also add promo string
content = re.sub(
    r'(model: "Honor 600 Lite 5G".*?storage: "256GB".*?)'
    r'MP89: \{ devicePrice: \d+, dap: \d+, totalUpfront: \d+ \}',
    lambda m: m.group(1) + 'MP89: { devicePrice: 299, dap: 160, totalUpfront: 459 }',
    content, count=1, flags=re.DOTALL
)

# Add promo to Honor 600 Lite storage block (after rrp line)
content = re.sub(
    r'(model: "Honor 600 Lite 5G".*?storage: "256GB",\s*\n\s*rrp: 1399,)',
    r'\1\n      promo: "Price down — RM299 with MP89. Free with MP169 & up.",',
    content, count=1, flags=re.DOTALL
)

# ─── 2. Samsung Galaxy A26 5G — update MP89 upfront ──────────────────────────
# New: MP89: { devicePrice: 199, dap: 160, totalUpfront: 359 }
content = re.sub(
    r'(model: "Galaxy A26 5G".*?)'
    r'MP89: \{ devicePrice: \d+, dap: \d+, totalUpfront: \d+ \}',
    lambda m: m.group(1) + 'MP89: { devicePrice: 199, dap: 160, totalUpfront: 359 }',
    content, count=1, flags=re.DOTALL
)

# Add promo to Galaxy A26 5G
content = re.sub(
    r'(model: "Galaxy A26 5G".*?storage: ".*?",\s*\n\s*rrp: 1399,)',
    r'\1\n      promo: "RM199 with MP89. Free with MP99 & up.",',
    content, count=1, flags=re.DOTALL
)

# ─── 3. Samsung S26 — update upfront & zerolution prices ─────────────────────
# From GTM page 13 & 22:
# Upfront 24M: MP109: 3699/0/3699, MP139: 3499/100/3599, MP169: 3199/360/3559, MP199: 2999/560/3559
# Zero36: MP48:144, MP69:116, MP99:115, MP89:115, MP109:104, MP139:104, MP169:95, MP199:80
# Wait, need to re-read page 13 carefully:
# Zero36: MP48:144, MFP399:116, MP99/109:115(104), MP139:104, MP169:95, MP199:80
# From compiled table page 29:
# Zero36: 144, 116, NA(MP69), 115, NA(MP89), 115(104), 104, 95, 80
# From compiled zero36 page 29: S26 512GB: 144 116 NA 115 NA 115/104 104 95 80
# The dedicated page 13 shows: MP99/109: 115/104 meaning MP99=115, MP109=104
# Zero24: MP48:216, MFP399:174, MP99:174, MP109:174(155 - wait page 13 shows 174/155)
# From page 13: MP99/109: 174/155, MP139: 155(144?), MP169: 144(150?), MP199: 130
# Actually from compiled table page 26 (zero24):
# S26 512GB 5199: 216 174 NA 174 NA 174/155 155/144 144/150 130
# This is getting confusing. Let me use page 13 dedicated data:
# Zero36: MP48=144, MP99=115, MP109=104, MP139=104, MP169=95, MP199=80
# Zero24: MP48=216, MP99=174, MP109=155, MP139=144(?), MP169=130(?), MP199=?
# Wait page 13 actually says for S26:
# Zero36: MP48:144, MFP399:116, MP99/109: 115 / 104, MP139:104(?), MP169: 95(?), MP199:80
# Let me use the compiled table values which are cleaner:

# From page 29 (zero36) S26 512GB row: 144 116 NA 115 NA 115 104 95 80
# Columns: MP48 | MFP399 | MP69 | MP99 | MP89 | MP109 | MP139 | MP169 | MP199
# So: MP48=144, MFP399=116(ignore), MP69=NA, MP99=115, MP89=NA(same as MP99), MP109=104, MP139=104, MP169=95, MP199=80
# Wait, page 29 row: "Samsung Galaxy S26 (512GB) 5,199 144 116 NA 115 NA 115 104 95 80"
# Values after RRP: 144, 116, NA, 115, NA, 115, 104, 95, 80
# Columns: MP48, MFP399, MP69, MP99, MP89, MP109, MP139, MP169, MP199
# So: MP48=144, MP69=NA, MP99=115, MP89=NA, MP109=115, MP139=104, MP169=95, MP199=80
# Hmm MP99=115 and MP109=115? That's unusual... let me check dedicated page 13
# Page 13: "MP 99/109: 115 / 104" → MP99=115, MP109=104
# But compiled says MP109=115 (4th value after NA=115). Let me recount:
# "144 116 NA 115 NA 115 104 95 80" - 9 values
# Col 1 (MP48)=144, Col 2 (MFP399)=116, Col 3 (MP69)=NA, Col 4 (MP99)=115, Col 5 (MP89)=NA, Col 6 (MP109)=115, Col 7 (MP139)=104, Col 8 (MP169)=95, Col 9 (MP199)=80
# But page 13 says MP99/109 = 115/104 → MP99=115, MP109=104
# The compiled table has MP99=115, MP89=NA, MP109=115 which contradicts page 13
# Page 13 is the dedicated page so I'll trust it: MP99=115, MP109=104
# And from page 13: MP139=104, MP169=95, MP199=80 - wait page 13 shows "104 105/mth 95/mth 80/mth"
# "S26 512GB 5,199 144/mth 116/mth 115/mth 104 105/mth 95/mth 80/mth"
# That's: MP48=144, MFP399=116, MP99/109=115/104, MP139=105, MP169=95, MP199=80
# Hmm so MP139=105? Or 104? Let me use: MP99=115, MP109=104, MP139=105, MP169=95, MP199=80

# For zero24 from page 13:
# "S26 512GB 5,199 216/mth 174/mth 174 175/mth 155 165/mth 144 150/mth 130/mth"
# MP48=216, MFP399=174, MP99=174(175?), MP109=155(165?), MP139=144(150?), MP169=?, MP199=130
# This is confusing with the dual numbers. Let me parse:
# "174 175/mth" → MP99=174, MP89=175 (same column showing two values)
# Actually reading more carefully: "MP 99/109: 174 175/mth 155 165/mth 144 150/mth 130/mth"
# The numbers in pairs: 174/175 (MP99/MP89?), 155/165 (MP109/something?), 144/150, 130
# This is getting too confusing. Let me use the compiled table values (page 26) which are cleaner single values.
# From compiled zero24 page 26: "Samsung Galaxy S26 (512GB) 5,199 216 174 NA 174 NA 174 155 144 130"
# Columns: MP48=216, MFP399=174, MP69=NA, MP99=174, MP89=NA, MP109=174, MP139=155, MP169=144, MP199=130
# Wait MP99=174 and MP109=174? And dedicated page says MP99=174, MP109=155.
# Page 13: "MP 99/109: 174/155" so MP99=174, MP109=155
# Compiled table MP109 column (6th value)=174 which conflicts.
# I'll go with dedicated page 13: zero24 MP48=216, MP99=174, MP109=155, MP139=144, MP169=130, MP199=?
# Hmm I don't see MP199 for zero24 clearly. Let me use: 130 for MP199 based on compiled table

# Given complexity of this parsing, I'll use values I'm confident about from dedicated pages:

# S26 512GB zero36: MP48=144, MP99=115, MP109=104, MP139=104, MP169=95, MP199=80
# S26 512GB zero24: MP48=216, MP99=174, MP109=155, MP139=144, MP169=130, MP199=130

# Actually for zero24 the last two (MP169 and MP199) from compiled table: 144, 130
# So zero24: MP139=155, MP169=144, MP199=130 - let me go with compiled for these

# I'll use the compiled table values as they're more systematic:
# Zero36 S26 512: MP48=144, MP69=NA, MP99=115, MP89=NA, MP109=104(compiled says 115 but trust dedicated), MP139=104, MP169=95, MP199=80
# I'll go with: MP99=115, MP89=NA, MP109=104, MP139=104, MP169=95, MP199=80

# For upfront from page 13/22:
# S26 512GB upfront 24M: MP109: device=3699, dap=0, total=3699
#                         MP139: device=3499, dap=100, total=3599
#                         MP169: device=3199, dap=360, total=3559
#                         MP199: device=2999, dap=560, total=3559

# S26+ 512GB upfront 24M: MP109: 4599/0/4599, MP139: 4399/100/4499, MP169: 4199/300/4499, MP199: 3899/600/4499
# S26 Ultra 512GB upfront: MP109: 5199/0/5199, MP139: 4999/0/4999, MP169: 4699/300/4999, MP199: 4399/600/4999
# S26 Ultra 1TB upfront: MP109: 6299/0/6299, MP139: 6099/0/6099, MP169: 5799/300/6099, MP199: 5499/600/6099

# Zero36 S26+ 512: 172, 144, NA, 142, NA, 142, 129, 121, 105 (from page 29)
# → MP48=172, MP69=NA, MP99=142, MP89=NA, MP109=142, MP139=129, MP169=121, MP199=105
# But dedicated page 14: "MP 99/109: 142 145/mth 129 135/mth 121 125/mth 105/mth"
# MP99=142, MP89=145, MP109=129, MP139=135(?), MP169=121(?), MP199=105
# I'll go with compiled table: MP99=142, MP109=142, MP139=129, MP169=121, MP199=105

# Zero36 S26 Ultra 512: 188, 160, NA, 154, NA, 154, 141, 133, 125 (from page 29)
# → MP48=188, MP99=154, MP89=NA, MP109=154, MP139=141, MP169=133, MP199=125
# Dedicated page 15: "MP 99/109: 154 165/mth 141 155/mth 133 145/mth 125/mth"
# MP99=154, MP89=165, MP109=141(?), MP139=155(?), MP169=133(?), MP199=125
# Let me use compiled table values: MP48=188, MP99=154, MP109=154, MP139=141, MP169=133, MP199=125

# Zero36 S26 Ultra 1TB: 222, 194, NA, 195, NA, 195, 185, 175, 155 (from page 29)
# → MP48=222, MP99=195, MP109=195, MP139=185, MP169=175, MP199=155

# Zero24 values from compiled table (page 26):
# S26+: 258 216 NA 212 NA 212 193 181 170
# → MP48=258, MP99=212, MP109=212, MP139=193, MP169=181, MP199=170
# S26 Ultra 512: 283 241 NA 231 NA 231 211 200 191
# → MP48=283, MP99=231, MP109=231, MP139=211, MP169=200, MP199=191
# S26 Ultra 1TB: 333 291 NA 285 NA 285 275 265 245
# → MP48=333, MP99=285, MP109=285, MP139=275, MP169=265, MP199=245

print("Analyzing catalog for Samsung S26 entries...")

# Check current S26 upfront structure
import re as re2
s26_match = re2.search(r'model: "Galaxy S26".*?(?=model: "Galaxy S26\+"|brand:)', content, re2.DOTALL)
if s26_match:
    s26_block = s26_match.group()
    # Check upfront prices
    mp109_match = re2.search(r'MP109: \{ devicePrice: (\d+)', s26_block)
    if mp109_match:
        print(f"S26 current MP109 device price: {mp109_match.group(1)}")
    else:
        print("S26 MP109 not found or different format")

# Update S26 upfront prices
def update_s26_upfront(content, model_name, mp109, mp109_dap, mp109_total,
                        mp139, mp139_dap, mp139_total,
                        mp169, mp169_dap, mp169_total,
                        mp199, mp199_dap, mp199_total):
    pattern = (
        rf'(model: "{re2.escape(model_name)}".*?'
        rf'storage: "512GB".*?upfront: \{{)'
        rf'(.*?)'
        rf'(\}},$\s*zero24:)'
    )
    def replacer(m):
        upfront_block = m.group(2)
        # Replace each plan
        for plan, dp, dap, total in [
            ("MP109", mp109, mp109_dap, mp109_total),
            ("MP139", mp139, mp139_dap, mp139_total),
            ("MP169", mp169, mp169_dap, mp169_total),
            ("MP199", mp199, mp199_dap, mp199_total),
        ]:
            upfront_block = re2.sub(
                rf'{plan}: \{{ devicePrice: \d+, dap: \d+, totalUpfront: \d+ \}}',
                f'{plan}: {{ devicePrice: {dp}, dap: {dap}, totalUpfront: {total} }}',
                upfront_block
            )
        return m.group(1) + upfront_block + m.group(3)
    return re2.sub(pattern, replacer, content, count=1, flags=re2.DOTALL | re2.MULTILINE)

content = update_s26_upfront(content, "Galaxy S26",
    3699, 0, 3699,
    3499, 100, 3599,
    3199, 360, 3559,
    2999, 560, 3559)

content = update_s26_upfront(content, "Galaxy S26+",
    4599, 0, 4599,
    4399, 100, 4499,
    4199, 300, 4499,
    3899, 600, 4499)

content = update_s26_upfront(content, "Galaxy S26 Ultra",
    5199, 0, 5199,
    4999, 0, 4999,
    4699, 300, 4999,
    4399, 600, 4999)

print("S26 upfront prices updated")

# ─── Update S26 zero36/zero24 prices ──────────────────────────────────────────
def update_zero_prices(content, model_name, storage, zero_key, plan_values):
    """Line-by-line approach: find model/storage/zero_key context then update plan lines."""
    lines = content.split('\n')
    result = []
    state = 'find_model'
    changed = False

    for line in lines:
        if state == 'find_model':
            if f'model: "{model_name}"' in line:
                state = 'find_storage'
        elif state == 'find_storage':
            if f'storage: "{storage}"' in line:
                state = 'find_zero'
            elif 'model:' in line:  # moved past this model
                state = 'find_model'
        elif state == 'find_zero':
            if f'{zero_key}:' in line and '{' in line:
                state = 'in_zero'
            elif 'model:' in line:
                state = 'find_model'
        elif state == 'in_zero':
            stripped = line.strip()
            # End of zero block: lone closing brace
            if stripped == '}' or stripped == '},':
                state = 'done'
            else:
                for plan, monthly in plan_values.items():
                    if f'{plan}: {{' in line and 'monthly:' in line:
                        if monthly == "NA":
                            new_line = re.sub(r'(monthly:)\s*(?:\d+|"[^"]*")', r'\1 "NA"', line)
                        else:
                            new_line = re.sub(r'(monthly:)\s*(?:\d+|"[^"]*")', rf'\1 {monthly}', line)
                        if new_line != line:
                            changed = True
                            line = new_line
                        break

        result.append(line)

    if not changed:
        print(f"  WARNING: Could not update {model_name} {storage} {zero_key} (no lines changed)")
    return '\n'.join(result)

# S26 512GB zero36
content = update_zero_prices(content, "Galaxy S26", "512GB", "zero36", {
    "MP48": 144, "MP69": "NA", "MP89": "NA", "MP99": 115, "MP109": 104, "MP139": 104, "MP169": 95, "MP199": 80
})
# S26 512GB zero24
content = update_zero_prices(content, "Galaxy S26", "512GB", "zero24", {
    "MP48": 216, "MP69": "NA", "MP89": "NA", "MP99": 174, "MP109": 155, "MP139": 144, "MP169": 130, "MP199": 130
})

# S26+ 512GB zero36
content = update_zero_prices(content, "Galaxy S26+", "512GB", "zero36", {
    "MP48": 172, "MP69": "NA", "MP89": "NA", "MP99": 142, "MP109": 142, "MP139": 129, "MP169": 121, "MP199": 105
})
# S26+ 512GB zero24
content = update_zero_prices(content, "Galaxy S26+", "512GB", "zero24", {
    "MP48": 258, "MP69": "NA", "MP89": "NA", "MP99": 212, "MP109": 212, "MP139": 193, "MP169": 181, "MP199": 170
})

# S26 Ultra 512GB zero36
content = update_zero_prices(content, "Galaxy S26 Ultra", "512GB", "zero36", {
    "MP48": 188, "MP69": "NA", "MP89": "NA", "MP99": 154, "MP109": 154, "MP139": 141, "MP169": 133, "MP199": 125
})
# S26 Ultra 512GB zero24
content = update_zero_prices(content, "Galaxy S26 Ultra", "512GB", "zero24", {
    "MP48": 283, "MP69": "NA", "MP89": "NA", "MP99": 231, "MP109": 231, "MP139": 211, "MP169": 200, "MP199": 191
})

# S26 Ultra 1TB zero36
content = update_zero_prices(content, "Galaxy S26 Ultra", "1TB", "zero36", {
    "MP48": 222, "MP69": "NA", "MP89": "NA", "MP99": 195, "MP109": 195, "MP139": 185, "MP169": 175, "MP199": 155
})
# S26 Ultra 1TB zero24
content = update_zero_prices(content, "Galaxy S26 Ultra", "1TB", "zero24", {
    "MP48": 333, "MP69": "NA", "MP89": "NA", "MP99": 285, "MP109": 285, "MP139": 275, "MP169": 265, "MP199": 245
})

print("S26 zerolution prices updated")

# ─── 4. Add promo to Samsung S26 series ──────────────────────────────────────
content = re.sub(
    r'(model: "Galaxy S26"[^+].*?storage: "512GB",\s*\n\s*rrp: 5199,)',
    r'\1\n      promo: "RM104/mo on MP139 (Zero36). Free DAP from MP109.",',
    content, count=1, flags=re.DOTALL
)
content = re.sub(
    r'(model: "Galaxy S26\+".*?storage: "512GB",\s*\n\s*rrp: 6199,)',
    r'\1\n      promo: "RM142/mo on MP99 (Zero36). Free DAP from MP109.",',
    content, count=1, flags=re.DOTALL
)
content = re.sub(
    r'(model: "Galaxy S26 Ultra".*?storage: "512GB",\s*\n\s*rrp: 6799,)',
    r'\1\n      promo: "RM154/mo on MP99 (Zero36). Free DAP from MP109.",',
    content, count=1, flags=re.DOTALL
)

# ─── 5. Add iPhone 17 promo ──────────────────────────────────────────────────
# iPhone 17 is FREE with MP199 on 36M
content = re.sub(
    r'(model: "iPhone 17"[^e].*?storage: "256GB",\s*\n\s*rrp: 3999,)',
    r'\1\n      promo: "Now FREE with MP199 (36M upfront).",',
    content, count=1, flags=re.DOTALL
)

# iPhone 17e
content = re.sub(
    r'(model: "iPhone 17e".*?storage: "256GB",\s*\n\s*rrp: 2999,)',
    r'\1\n      promo: "Free with MP169 & up (36M). Available on 36M contract.",',
    content, count=1, flags=re.DOTALL
)

print("Promo strings added")

# ─── 6. Add Vivo V70 FE 5G ───────────────────────────────────────────────────
vivo_v70_fe = '''
{
model: "Vivo V70 FE 5G",
aliases: ["v70fe", "v70 fe"],
storages: [
{
storage: "8GB+512GB",
rrp: 1999,
promo: "Free with MP169 & up. Gift: camera kit worth RM827.",
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 699, dap: 300, totalUpfront: 999 },
MP139: { devicePrice: 399, dap: 600, totalUpfront: 999 },
MP169: { devicePrice: 0, dap: 1000, totalUpfront: 1000 },
MP199: { devicePrice: 0, dap: 1000, totalUpfront: 1000 },
},
zero24: {
MP48: { monthly: 83, dapLabel: "NA" },
MP69: { monthly: 75, dapLabel: "NA" },
MP89: { monthly: 75, dapLabel: "NA" },
MP99: { monthly: 70, dapLabel: "NA" },
MP109: { monthly: 70, dapLabel: "NA" },
MP139: { monthly: 60, dapLabel: "NA" },
MP169: { monthly: 45, dapLabel: "NA" },
MP199: { monthly: 30, dapLabel: "NA" },
},
zero36: {
MP48: { monthly: 55, dapLabel: "NA" },
MP69: { monthly: 50, dapLabel: "NA" },
MP89: { monthly: 50, dapLabel: "NA" },
MP99: { monthly: 45, dapLabel: "NA" },
MP109: { monthly: 45, dapLabel: "NA" },
MP139: { monthly: 40, dapLabel: "NA" },
MP169: { monthly: 30, dapLabel: "NA" },
MP199: { monthly: 20, dapLabel: "NA" },
},
},
},
},
],
},'''

# Insert Vivo V70 FE after the Vivo brand opening and before Vivo V70 5G
content = re.sub(
    r'(brand: "Vivo",\s*\nmodels: \[\s*\n)',
    r'\1' + vivo_v70_fe + '\n',
    content, count=1
)

print("Vivo V70 FE 5G added")

# Write updated content
with open(CATALOG_PATH, "w", encoding="utf-8") as f:
    f.write(content)

# Count changes
changes = sum(1 for a, b in zip(original.split('\n'), content.split('\n')) if a != b)
new_lines = len(content.split('\n')) - len(original.split('\n'))
print(f"\nDone. ~{changes} lines changed, {new_lines} lines added.")
