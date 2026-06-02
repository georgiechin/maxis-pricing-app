import sys

path = r"C:\Users\USER\maxis-pricing-app\.claude\worktrees\great-engelbart-b4a5e4\data\catalog.ts"

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

errors = []

def replace_unique(old, new, label):
    global content
    count = content.count(old)
    if count != 1:
        errors.append(f"ERROR [{label}]: found {count} matches (expected 1)")
        return
    content = content.replace(old, new)

# 1. CATALOG_SOURCE / DATE
replace_unique('export const CATALOG_SOURCE = "GTM 14 May 2026";',
               'export const CATALOG_SOURCE = "GTM 21 May 2026";', "CATALOG_SOURCE")
replace_unique('export const CATALOG_DATE = "2026-05-14";',
               'export const CATALOG_DATE = "2026-05-21";', "CATALOG_DATE")

# 2. LATEST_UPDATES — prepend 21 May entries
replace_unique(
    'export const LATEST_UPDATES: AppUpdate[] = [\n  {\n    date: "14 May",',
    'export const LATEST_UPDATES: AppUpdate[] = [\n'
    '  {\n'
    '    date: "21 May",\n'
    '    type: "new",\n'
    '    text: "\U0001f4f1 New: Honor 500 Smart 5G \xb7 Vivo X300 FE 5G \xb7 Vivo X300 Ultra 5G",\n'
    '    subtext: "Honor 500 Smart RRP RM1,099 free on MP99 \xb7 X300 FE RRP RM3,299 \xb7 X300 Ultra RRP RM6,799",\n'
    '  },\n'
    '  {\n'
    '    date: "21 May",\n'
    '    type: "change",\n'
    '    text: "\U0001f504 Honor X9d: RRP RM1,699 \xb7 Reno 15/Pro: RRP DOWN \xb7 A6t 6+256GB \xb7 Vivo X300 repriced",\n'
    '    subtext: "X9d save RM300 \xb7 Reno 15 save RM200 \xb7 Reno 15 Pro save RM300 \xb7 X300 5G DAP adjusted",\n'
    '  },\n'
    '  {\n    date: "14 May",',
    "LATEST_UPDATES"
)

# 3. Honor 500 Smart 5G ECEM — fill in all NA pricing
replace_unique(
    'model: "Honor 500 Smart 5G",\naliases: ["honor", "honor500"],\nstorages: [\n{\nstorage: "8+256GB",\nrrp: 1099,\nregions: {\nECEM: {\nupfront: {\nMP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP109: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP139: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP169: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP199: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" }\n},\nzero24: {\nMP48: { monthly: "NA", dapLabel: "NA" },\nMP69: { monthly: "NA", dapLabel: "NA" },\nMP89: { monthly: "NA", dapLabel: "NA" },\nMP99: { monthly: "NA", dapLabel: "NA" },\nMP109: { monthly: "NA", dapLabel: "NA" },\nMP139: { monthly: "NA", dapLabel: "NA" },\nMP169: { monthly: "NA", dapLabel: "NA" },\nMP199: { monthly: "NA", dapLabel: "NA" }\n},\nzero36: {\nMP48: { monthly: "NA", dapLabel: "NA" },\nMP69: { monthly: "NA", dapLabel: "NA" },\nMP89: { monthly: "NA", dapLabel: "NA" },\nMP99: { monthly: "NA", dapLabel: "NA" },\nMP109: { monthly: "NA", dapLabel: "NA" },\nMP139: { monthly: "NA", dapLabel: "NA" },\nMP169: { monthly: "NA", dapLabel: "NA" },\nMP199: { monthly: "NA", dapLabel: "NA" }\n}\n},',
    'model: "Honor 500 Smart 5G",\naliases: ["honor", "honor500"],\nstorages: [\n{\nstorage: "8+256GB",\nrrp: 1099,\nregions: {\nECEM: {\nupfront: {\nMP69: { devicePrice: 129, dap: 120, totalUpfront: 249 },\nMP89: { devicePrice: 49, dap: 200, totalUpfront: 249 },\nMP99: { devicePrice: 0, dap: 240, totalUpfront: 240 },\nMP109: { devicePrice: 0, dap: 240, totalUpfront: 240 },\nMP139: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP169: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP199: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" }\n},\nzero24: {\nMP48: { monthly: 45, dapLabel: "NA" },\nMP69: { monthly: 40, dapLabel: "Check ECC" },\nMP89: { monthly: 40, dapLabel: "Check ECC" },\nMP99: { monthly: 35, dapLabel: "Check ECC" },\nMP109: { monthly: 35, dapLabel: "Check ECC" },\nMP139: { monthly: 25, dapLabel: "Check ECC" },\nMP169: { monthly: 15, dapLabel: "Check ECC" },\nMP199: { monthly: 0, dapLabel: "Check ECC" }\n},\nzero36: {\nMP48: { monthly: 30, dapLabel: "NA" },\nMP69: { monthly: 25, dapLabel: "Check ECC" },\nMP89: { monthly: 25, dapLabel: "Check ECC" },\nMP99: { monthly: 20, dapLabel: "Check ECC" },\nMP109: { monthly: 20, dapLabel: "Check ECC" },\nMP139: { monthly: 15, dapLabel: "Check ECC" },\nMP169: { monthly: 10, dapLabel: "Check ECC" },\nMP199: { monthly: 0, dapLabel: "Check ECC" }\n}\n},',
    "Honor 500 Smart ECEM pricing"
)

# 4. Honor X9d 5G — RRP 1999→1699 + all pricing update
replace_unique(
    'model: "Honor X9d 5G",\naliases: ["honor", "x9d"],\nstorages: [\n{\nstorage: "512GB",\nrrp: 1999,\nregions: {\nECEM: {\nupfront: {\nMP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP99: { devicePrice: 899, dap: 240, totalUpfront: 1139 },\nMP109: { devicePrice: 899, dap: 240, totalUpfront: 1139 },\nMP139: { devicePrice: 399, dap: 740, totalUpfront: 1139 },\nMP169: { devicePrice: 0, dap: 1140, totalUpfront: 1140 },\nMP199: { devicePrice: 0, dap: 1140, totalUpfront: 1140 }\n},\nupfront36: {\nMP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP99: { devicePrice: 499, dap: 640, totalUpfront: 1139 },\nMP109: { devicePrice: 499, dap: 640, totalUpfront: 1139 },\nMP139: { devicePrice: 0, dap: 1140, totalUpfront: 1140 },\nMP169: { devicePrice: 0, dap: 1140, totalUpfront: 1140 },\nMP199: { devicePrice: 0, dap: 1140, totalUpfront: 1140 }\n},\nzero24: {\nMP48: { monthly: 83, dapLabel: "NA" },\nMP69: { monthly: "NA", dapLabel: "NA" },\nMP89: { monthly: "NA", dapLabel: "NA" },\nMP99: { monthly: 75, dapLabel: "Check ECC" },\nMP109: { monthly: 75, dapLabel: "Check ECC" },\nMP139: { monthly: 65, dapLabel: "Check ECC" },\nMP169: { monthly: 50, dapLabel: "Check ECC" },\nMP199: { monthly: 30, dapLabel: "Check ECC" }\n},\nzero36: {\nMP48: { monthly: 55, dapLabel: "NA" },\nMP69: { monthly: "NA", dapLabel: "NA" },\nMP89: { monthly: "NA", dapLabel: "NA" },\nMP99: { monthly: 50, dapLabel: "Check ECC" },\nMP109: { monthly: 50, dapLabel: "Check ECC" },\nMP139: { monthly: 45, dapLabel: "Check ECC" },\nMP169: { monthly: 35, dapLabel: "Check ECC" },\nMP199: { monthly: 20, dapLabel: "Check ECC" }\n}',
    'model: "Honor X9d 5G",\naliases: ["honor", "x9d"],\nstorages: [\n{\nstorage: "512GB",\nrrp: 1699,\nregions: {\nECEM: {\nupfront: {\nMP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP99: { devicePrice: 199, dap: 360, totalUpfront: 559 },\nMP109: { devicePrice: 199, dap: 360, totalUpfront: 559 },\nMP139: { devicePrice: 0, dap: 520, totalUpfront: 520 },\nMP169: { devicePrice: 0, dap: 520, totalUpfront: 520 },\nMP199: { devicePrice: 0, dap: 520, totalUpfront: 520 }\n},\nupfront36: {\nMP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP99: { devicePrice: 0, dap: 520, totalUpfront: 520 },\nMP109: { devicePrice: 0, dap: 520, totalUpfront: 520 },\nMP139: { devicePrice: 0, dap: 520, totalUpfront: 520 },\nMP169: { devicePrice: 0, dap: 520, totalUpfront: 520 },\nMP199: { devicePrice: 0, dap: 520, totalUpfront: 520 }\n},\nzero24: {\nMP48: { monthly: 70, dapLabel: "NA" },\nMP69: { monthly: "NA", dapLabel: "NA" },\nMP89: { monthly: "NA", dapLabel: "NA" },\nMP99: { monthly: 50, dapLabel: "Check ECC" },\nMP109: { monthly: 50, dapLabel: "Check ECC" },\nMP139: { monthly: 40, dapLabel: "Check ECC" },\nMP169: { monthly: 30, dapLabel: "Check ECC" },\nMP199: { monthly: 10, dapLabel: "Check ECC" }\n},\nzero36: {\nMP48: { monthly: 47, dapLabel: "NA" },\nMP69: { monthly: "NA", dapLabel: "NA" },\nMP89: { monthly: "NA", dapLabel: "NA" },\nMP99: { monthly: 35, dapLabel: "Check ECC" },\nMP109: { monthly: 35, dapLabel: "Check ECC" },\nMP139: { monthly: 25, dapLabel: "Check ECC" },\nMP169: { monthly: 20, dapLabel: "Check ECC" },\nMP199: { monthly: 5, dapLabel: "Check ECC" }\n}',
    "Honor X9d repricing"
)

# 5. Oppo A6t 5G — add 6+256GB storage before existing 4+256GB
replace_unique(
    'model: "Oppo A6t 5G",\naliases: ["oppo", "a6t"],\nstorages: [{\nstorage: "4+256GB",',
    'model: "Oppo A6t 5G",\naliases: ["oppo", "a6t"],\nstorages: [{\nstorage: "6+256GB",\nrrp: 1099,\nregions: {\nECEM: {\nupfront: {\nMP69: { devicePrice: 0, dap: 180, totalUpfront: 180 },\nMP89: { devicePrice: 0, dap: 180, totalUpfront: 180 },\nMP99: { devicePrice: 0, dap: 180, totalUpfront: 180 },\nMP109: { devicePrice: 0, dap: 180, totalUpfront: 180 },\nMP139: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP169: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP199: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" }\n},\nzero24: {\nMP48: { monthly: 45, dapLabel: "NA" },\nMP69: { monthly: "NA", dapLabel: "NA" },\nMP89: { monthly: "NA", dapLabel: "NA" },\nMP99: { monthly: "NA", dapLabel: "NA" },\nMP109: { monthly: "NA", dapLabel: "NA" },\nMP139: { monthly: "NA", dapLabel: "NA" },\nMP169: { monthly: "NA", dapLabel: "NA" },\nMP199: { monthly: "NA", dapLabel: "NA" }\n}\n}\n}\n},\n{\nstorage: "4+256GB",',
    "Oppo A6t 6+256GB"
)

# 6. Oppo Reno 15 5G — add upfront36 between upfront and zero24
replace_unique(
    'MP199: { devicePrice: 0, dap: 1400, totalUpfront: 1400 }\n},\nzero24: {\nMP48: { monthly: 99, dapLabel: "NA" },',
    'MP199: { devicePrice: 0, dap: 1400, totalUpfront: 1400 }\n},\nupfront36: {\nMP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP99: { devicePrice: 699, dap: 720, totalUpfront: 1419 },\nMP109: { devicePrice: 699, dap: 720, totalUpfront: 1419 },\nMP139: { devicePrice: 0, dap: 1400, totalUpfront: 1400 },\nMP169: { devicePrice: 0, dap: 1400, totalUpfront: 1400 },\nMP199: { devicePrice: 0, dap: 1400, totalUpfront: 1400 }\n},\nzero24: {\nMP48: { monthly: 99, dapLabel: "NA" },',
    "Oppo Reno 15 5G upfront36"
)

# 7. Oppo Reno 15 Pro 5G — update 24M MP139/169/199 + add upfront36
replace_unique(
    'MP99: { devicePrice: 1599, dap: 300, totalUpfront: 1899 },\nMP109: { devicePrice: 1599, dap: 300, totalUpfront: 1899 },\nMP139: { devicePrice: 1099, dap: 800, totalUpfront: 1899 },\nMP169: { devicePrice: 699, dap: 1200, totalUpfront: 1899 },\nMP199: { devicePrice: 199, dap: 1700, totalUpfront: 1899 }\n},\nzero24: {\nMP48: { monthly: 124, dapLabel: "NA" },',
    'MP99: { devicePrice: 1599, dap: 300, totalUpfront: 1899 },\nMP109: { devicePrice: 1599, dap: 300, totalUpfront: 1899 },\nMP139: { devicePrice: 1299, dap: 600, totalUpfront: 1899 },\nMP169: { devicePrice: 899, dap: 960, totalUpfront: 1859 },\nMP199: { devicePrice: 299, dap: 1560, totalUpfront: 1859 }\n},\nupfront36: {\nMP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP99: { devicePrice: 1199, dap: 700, totalUpfront: 1899 },\nMP109: { devicePrice: 1199, dap: 700, totalUpfront: 1899 },\nMP139: { devicePrice: 499, dap: 1400, totalUpfront: 1899 },\nMP169: { devicePrice: 0, dap: 1900, totalUpfront: 1900 },\nMP199: { devicePrice: 0, dap: 1900, totalUpfront: 1900 }\n},\nzero24: {\nMP48: { monthly: 124, dapLabel: "NA" },',
    "Oppo Reno 15 Pro 5G update"
)

# 8. Vivo X300 5G — update upfront 24M DAPs
replace_unique(
    'MP99: { devicePrice: 2699, dap: 720, totalUpfront: 3419 },\nMP109: { devicePrice: 2699, dap: 720, totalUpfront: 3419 },\nMP139: { devicePrice: 1799, dap: 1400, totalUpfront: 3199 },\nMP169: { devicePrice: 1399, dap: 2100, totalUpfront: 3499 },\nMP199: { devicePrice: 999, dap: 2600, totalUpfront: 3599 }',
    'MP99: { devicePrice: 2699, dap: 0, totalUpfront: 2699 },\nMP109: { devicePrice: 2699, dap: 0, totalUpfront: 2699 },\nMP139: { devicePrice: 1799, dap: 840, totalUpfront: 2639 },\nMP169: { devicePrice: 1399, dap: 1200, totalUpfront: 2599 },\nMP199: { devicePrice: 999, dap: 1600, totalUpfront: 2599 }',
    "Vivo X300 5G DAP update"
)

# 9. Add Vivo X300 FE 5G before Vivo X300 5G
new_x300fe = (
    '{\nmodel: "Vivo X300 FE 5G",\naliases: ["vivo", "x300fe"],\nstorages: [\n{\nstorage: "Default",\nrrp: 3299,\nregions: {\nECEM: {\nupfront: {\nMP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP109: { devicePrice: 1899, dap: 240, totalUpfront: 2139 },\nMP139: { devicePrice: 1599, dap: 540, totalUpfront: 2139 },\nMP169: { devicePrice: 1299, dap: 840, totalUpfront: 2139 },\nMP199: { devicePrice: 899, dap: 1220, totalUpfront: 2119 }\n},\nzero24: {\nMP48: { monthly: 137, dapLabel: "NA" },\nMP69: { monthly: "NA", dapLabel: "NA" },\nMP89: { monthly: "NA", dapLabel: "NA" },\nMP99: { monthly: 110, dapLabel: "Check ECC" },\nMP109: { monthly: 110, dapLabel: "Check ECC" },\nMP139: { monthly: 100, dapLabel: "Check ECC" },\nMP169: { monthly: 85, dapLabel: "Check ECC" },\nMP199: { monthly: 65, dapLabel: "Check ECC" }\n},\nzero36: {\nMP48: { monthly: 91, dapLabel: "NA" },\nMP69: { monthly: "NA", dapLabel: "NA" },\nMP89: { monthly: "NA", dapLabel: "NA" },\nMP99: { monthly: 75, dapLabel: "Check ECC" },\nMP109: { monthly: 75, dapLabel: "Check ECC" },\nMP139: { monthly: 65, dapLabel: "Check ECC" },\nMP169: { monthly: 55, dapLabel: "Check ECC" },\nMP199: { monthly: 40, dapLabel: "Check ECC" }\n}\n}\n}\n}\n]\n},\n{\nmodel: "Vivo X300 5G",'
)
replace_unique('{\nmodel: "Vivo X300 5G",', new_x300fe, "Add Vivo X300 FE 5G")

# 10. Add Vivo X300 Ultra 5G before Vivo X Fold 5 5G
new_x300ultra = (
    '{\nmodel: "Vivo X300 Ultra 5G",\naliases: ["vivo", "x300ultra"],\nstorages: [\n{\nstorage: "Default",\nrrp: 6799,\nregions: {\nECEM: {\nupfront: {\nMP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },\nMP109: { devicePrice: 5299, dap: 0, totalUpfront: 5299 },\nMP139: { devicePrice: 4999, dap: 240, totalUpfront: 5239 },\nMP169: { devicePrice: 4799, dap: 420, totalUpfront: 5219 },\nMP199: { devicePrice: 4499, dap: 720, totalUpfront: 5219 }\n},\nzero24: {\nMP48: { monthly: 283, dapLabel: "NA" },\nMP69: { monthly: "NA", dapLabel: "NA" },\nMP89: { monthly: "NA", dapLabel: "NA" },\nMP99: { monthly: 250, dapLabel: "Check ECC" },\nMP109: { monthly: 250, dapLabel: "Check ECC" },\nMP139: { monthly: 235, dapLabel: "Check ECC" },\nMP169: { monthly: 222, dapLabel: "Check ECC" },\nMP199: { monthly: 205, dapLabel: "Check ECC" }\n},\nzero36: {\nMP48: { monthly: 188, dapLabel: "NA" },\nMP69: { monthly: "NA", dapLabel: "NA" },\nMP89: { monthly: "NA", dapLabel: "NA" },\nMP99: { monthly: 170, dapLabel: "Check ECC" },\nMP109: { monthly: 170, dapLabel: "Check ECC" },\nMP139: { monthly: 155, dapLabel: "Check ECC" },\nMP169: { monthly: 145, dapLabel: "Check ECC" },\nMP199: { monthly: 130, dapLabel: "Check ECC" }\n}\n}\n}\n}\n]\n},\n{\nmodel: "Vivo X Fold 5 5G",'
)
replace_unique('{\nmodel: "Vivo X Fold 5 5G",', new_x300ultra, "Add Vivo X300 Ultra 5G")

# Write file FIRST before any print
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

if errors:
    print("FAILED:")
    for e in errors:
        print(e)
else:
    print("All 10 changes applied successfully.")
