"""
GTM 4 June 2026 (RFS 4 Jun) + Hotlink Device Updates
"""
import sys, pathlib

CATALOG = pathlib.Path(__file__).parent.parent / "data" / "catalog.ts"

def ru(content: str, old: str, new: str, label: str) -> str:
    count = content.count(old)
    if count != 1:
        print(f"  ERROR [{label}]: expected 1 match, found {count}")
        sys.exit(1)
    print(f"  OK [{label}]")
    return content.replace(old, new, 1)

content = CATALOG.read_text(encoding="utf-8")

# Shared NA block used in zerolution (both zero24 and zero36 end with same pattern)
_ALL_NA = (
    'MP69: { monthly: "NA", dapLabel: "Check ECC" },\n'
    'MP89: { monthly: "NA", dapLabel: "Check ECC" },\n'
    'MP99: { monthly: "NA", dapLabel: "Check ECC" },\n'
    'MP109: { monthly: "NA", dapLabel: "Check ECC" },\n'
    'MP139: { monthly: "NA", dapLabel: "Check ECC" },\n'
    'MP169: { monthly: "NA", dapLabel: "Check ECC" },\n'
    'MP199: { monthly: "NA", dapLabel: "Check ECC" }\n'
)

# ─── 1. Metadata ───────────────────────────────────────────────────────────────
content = ru(content,
    'export const CATALOG_SOURCE = "GTM 21 May 2026";',
    'export const CATALOG_SOURCE = "GTM 4 June 2026";',
    "CATALOG_SOURCE")

content = ru(content,
    'export const CATALOG_DATE = "2026-05-21";',
    'export const CATALOG_DATE = "2026-06-04";',
    "CATALOG_DATE")

content = ru(content,
    '  {\n    date: "21 May",\n    type: "new",\n    text: "📱 New: Honor 500 Smart 5G · Vivo X300 FE 5G · Vivo X300 Ultra 5G",',
    '  {\n    date: "4 Jun",\n    type: "new",\n    text: "📱 New: Oppo A6 5G · Honor Magic V6 5G (pre-order)",\n    subtext: "A6 5G RRP RM1,599 · Magic V6 RRP RM7,699 · pre-order 4 Jun, launch 12 Jun",\n  },\n  {\n    date: "4 Jun",\n    type: "change",\n    text: "🔄 iPhone 17 series now from MP89 · Honor 600 Lite & A26 zerolution · Hotlink repriced",\n    subtext: "C85 & V80 free on HP75 24M · Neo 5 DAP fixed · HP75 A26 5G added",\n  },\n  {\n    date: "21 May",\n    type: "new",\n    text: "📱 New: Honor 500 Smart 5G · Vivo X300 FE 5G · Vivo X300 Ultra 5G",',
    "LATEST_UPDATES 4 Jun")

# ─── 2. Honor 600 Lite ECEM zero24/36 — fill plan pricing ──────────────────────
# Exact anchor from file: zero24 ends with },  zero36 ends with }, then HOTLINK
_H600L_OLD = (
    'MP48: { monthly: 58, dapLabel: "NA" },\n'
    + _ALL_NA
    + '},\n'              # closes zero24 (comma → zero36 follows)
    'zero36: {\n'
    'MP48: { monthly: "NA", dapLabel: "NA" },\n'
    + _ALL_NA
    + '}\n'               # closes zero36 (no comma)
    '},\n'                # closes ECEM (comma → HOTLINK follows)
    'HOTLINK: {\n'
    'hotlink12: {\n'
    'HP75: { devicePrice: 699'
)
_H600L_NEW = (
    'MP48: { monthly: 58, dapLabel: "NA" },\n'
    'MP69: { monthly: 50, dapLabel: "Check ECC" },\n'
    'MP89: { monthly: 50, dapLabel: "Check ECC" },\n'
    'MP99: { monthly: 45, dapLabel: "Check ECC" },\n'
    'MP109: { monthly: 45, dapLabel: "Check ECC" },\n'
    'MP139: { monthly: 35, dapLabel: "Check ECC" },\n'
    'MP169: { monthly: 20, dapLabel: "Check ECC" },\n'
    'MP199: { monthly: 5, dapLabel: "Check ECC" }\n'
    '},\n'
    'zero36: {\n'
    'MP48: { monthly: 38, dapLabel: "NA" },\n'
    'MP69: { monthly: 35, dapLabel: "Check ECC" },\n'
    'MP89: { monthly: 35, dapLabel: "Check ECC" },\n'
    'MP99: { monthly: 30, dapLabel: "Check ECC" },\n'
    'MP109: { monthly: 30, dapLabel: "Check ECC" },\n'
    'MP139: { monthly: 25, dapLabel: "Check ECC" },\n'
    'MP169: { monthly: 15, dapLabel: "Check ECC" },\n'
    'MP199: { monthly: 0, dapLabel: "Check ECC" }\n'
    '}\n'
    '},\n'
    'HOTLINK: {\n'
    'hotlink12: {\n'
    'HP75: { devicePrice: 699'
)
content = ru(content, _H600L_OLD, _H600L_NEW, "Honor 600 Lite ECEM zero24/36")

# ─── 3. Galaxy A26 5G ECEM zero24/36 — fill plan pricing ───────────────────────
# A26 has NO HOTLINK in ECEM section; closes all the way to Galaxy A56 5G
_A26_OLD = (
    'MP48: { monthly: 58, dapLabel: "NA" },\n'
    + _ALL_NA
    + '},\n'              # closes zero24
    'zero36: {\n'
    'MP48: { monthly: "NA", dapLabel: "NA" },\n'
    + _ALL_NA
    + '}\n'               # closes zero36
    '}\n'                 # closes ECEM
    '}\n'                 # closes regions
    '}\n'                 # closes storage object
    ']\n'                 # closes storages
    '},\n'                # closes model entry
    '{\n'
    'model: "Galaxy A56 5G",'
)
_A26_NEW = (
    'MP48: { monthly: 58, dapLabel: "NA" },\n'
    'MP69: { monthly: 50, dapLabel: "Check ECC" },\n'
    'MP89: { monthly: 50, dapLabel: "Check ECC" },\n'
    'MP99: { monthly: 45, dapLabel: "Check ECC" },\n'
    'MP109: { monthly: 45, dapLabel: "Check ECC" },\n'
    'MP139: { monthly: 30, dapLabel: "Check ECC" },\n'
    'MP169: { monthly: 15, dapLabel: "Check ECC" },\n'
    'MP199: { monthly: 0, dapLabel: "Check ECC" }\n'
    '},\n'
    'zero36: {\n'
    'MP48: { monthly: 38, dapLabel: "NA" },\n'
    'MP69: { monthly: 35, dapLabel: "Check ECC" },\n'
    'MP89: { monthly: 35, dapLabel: "Check ECC" },\n'
    'MP99: { monthly: 30, dapLabel: "Check ECC" },\n'
    'MP109: { monthly: 30, dapLabel: "Check ECC" },\n'
    'MP139: { monthly: 20, dapLabel: "Check ECC" },\n'
    'MP169: { monthly: 10, dapLabel: "Check ECC" },\n'
    'MP199: { monthly: 0, dapLabel: "Check ECC" }\n'
    '}\n'
    '}\n'
    '}\n'
    '}\n'
    ']\n'
    '},\n'
    '{\n'
    'model: "Galaxy A56 5G",'
)
content = ru(content, _A26_OLD, _A26_NEW, "Galaxy A26 5G ECEM zero24/36")

# ─── 4. Nubia Neo 5 5G Hotlink — fix 24M DAP 180→120 ──────────────────────────
content = ru(content,
    'HP75: { devicePrice: 299, dap: 180, totalUpfront: 479, monthly: 67.50 }',
    'HP75: { devicePrice: 299, dap: 120, totalUpfront: 419, monthly: 67.50 }',
    "Nubia Neo 5 24M DAP fix")

# ─── 5. Honor 600 Lite Hotlink — reprice ──────────────────────────────────────
content = ru(content,
    'hotlink12: {\nHP75: { devicePrice: 699, dap: 0, totalUpfront: 699, monthly: 75 }\n},\nhotlink24: {\nHP75: { devicePrice: 399, dap: 60, totalUpfront: 459, monthly: 72.50 }\n}\n}\n}\n}]\n},\n{\nmodel: "Realme C85 4G",',
    'hotlink12: {\nHP75: { devicePrice: 859, dap: 60, totalUpfront: 919, monthly: 75 }\n},\nhotlink24: {\nHP75: { devicePrice: 499, dap: 120, totalUpfront: 619, monthly: 72.50 }\n}\n}\n}\n}]\n},\n{\nmodel: "Realme C85 4G",',
    "Honor 600 Lite Hotlink reprice")

# ─── 6. Realme C85 4G Hotlink — 24M HP75 FREE ─────────────────────────────────
content = ru(content,
    'HP65: { devicePrice: 99, dap: 180, totalUpfront: 279, monthly: 57.50 },\nHP75: { devicePrice: 49, dap: 150, totalUpfront: 199, monthly: 68.75 }\n}\n}\n}\n}]\n},\n{\nmodel: "Nubia V80 Max 4G",',
    'HP65: { devicePrice: 99, dap: 180, totalUpfront: 279, monthly: 57.50 },\nHP75: { devicePrice: 0, dap: 150, totalUpfront: 150, monthly: 68.75 }\n}\n}\n}\n}]\n},\n{\nmodel: "Nubia V80 Max 4G",',
    "Realme C85 Hotlink 24M HP75 free")

# ─── 7. Nubia V80 Max Hotlink — 24M HP75 FREE ─────────────────────────────────
content = ru(content,
    'HP65: { devicePrice: 99, dap: 180, totalUpfront: 279, monthly: 57.50 },\nHP75: { devicePrice: 49, dap: 150, totalUpfront: 199, monthly: 68.75 }\n}\n}\n}\n}]\n},\n{\nmodel: "Vivo Y11d 4G",',
    'HP65: { devicePrice: 99, dap: 180, totalUpfront: 279, monthly: 57.50 },\nHP75: { devicePrice: 0, dap: 150, totalUpfront: 150, monthly: 68.75 }\n}\n}\n}\n}]\n},\n{\nmodel: "Vivo Y11d 4G",',
    "Nubia V80 Max Hotlink 24M HP75 free")

# ─── 8. Samsung Galaxy A26 5G — insert new Hotlink device ──────────────────────
A26_HL = (
    '{\nmodel: "Samsung Galaxy A26 5G",\n'
    'aliases: ["samsung", "a26", "hotlink"],\n'
    'storages: [{\nstorage: "8+256GB",\nrrp: 1399,\nregions: {\nHOTLINK: {\n'
    'hotlink12: {\nHP75: { devicePrice: 599, dap: 0, totalUpfront: 599, monthly: 75 }\n},\n'
    'hotlink24: {\nHP75: { devicePrice: 299, dap: 120, totalUpfront: 419, monthly: 72.50 }\n}\n}\n}\n}]},\n'
)
content = ru(content,
    '{\nmodel: "Honor 600 Lite 5G",\naliases: ["honor", "honor600lite", "hotlink"],',
    A26_HL + '{\nmodel: "Honor 600 Lite 5G",\naliases: ["honor", "honor600lite", "hotlink"],',
    "Samsung A26 5G Hotlink insert")

# ─── 9. Insert Oppo A6 5G ECEM ────────────────────────────────────────────────
OPPO_A6 = '''{
model: "Oppo A6 5G",
aliases: ["oppo", "a6"],
storages: [{
storage: "8+512GB",
rrp: 1599,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: 599, dap: 200, totalUpfront: 799 },
MP99: { devicePrice: 499, dap: 300, totalUpfront: 799 },
MP109: { devicePrice: 499, dap: 300, totalUpfront: 799 },
MP139: { devicePrice: 0, dap: 780, totalUpfront: 780 },
MP169: { devicePrice: 0, dap: 780, totalUpfront: 780 },
MP199: { devicePrice: 0, dap: 780, totalUpfront: 780 }
},
upfront36: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 99, dap: 700, totalUpfront: 799 },
MP109: { devicePrice: 99, dap: 700, totalUpfront: 799 },
MP139: { devicePrice: 0, dap: 780, totalUpfront: 780 },
MP169: { devicePrice: 0, dap: 780, totalUpfront: 780 },
MP199: { devicePrice: 0, dap: 780, totalUpfront: 780 }
},
zero24: {
MP48: { monthly: 66, dapLabel: "NA" },
MP69: { monthly: 60, dapLabel: "Check ECC" },
MP89: { monthly: 60, dapLabel: "Check ECC" },
MP99: { monthly: 55, dapLabel: "Check ECC" },
MP109: { monthly: 55, dapLabel: "Check ECC" },
MP139: { monthly: 45, dapLabel: "Check ECC" },
MP169: { monthly: 35, dapLabel: "Check ECC" },
MP199: { monthly: 20, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 44, dapLabel: "NA" },
MP69: { monthly: 40, dapLabel: "Check ECC" },
MP89: { monthly: 40, dapLabel: "Check ECC" },
MP99: { monthly: 35, dapLabel: "Check ECC" },
MP109: { monthly: 35, dapLabel: "Check ECC" },
MP139: { monthly: 30, dapLabel: "Check ECC" },
MP169: { monthly: 20, dapLabel: "Check ECC" },
MP199: { monthly: 10, dapLabel: "Check ECC" }
}
}
}
}]
},
'''
content = ru(content,
    '{\nmodel: "Oppo Reno 15F 5G",',
    OPPO_A6 + '{\nmodel: "Oppo Reno 15F 5G",',
    "Oppo A6 5G ECEM insert")

# ─── 10. Insert Honor Magic V6 5G ECEM ────────────────────────────────────────
MAGIC_V6 = '''{
model: "Honor Magic V6 5G",
aliases: ["honor", "magicv6"],
storages: [
{
storage: "16+512GB",
rrp: 7699,
promo: "Pre-order 4 Jun — FREE Skyworth 32\\" Google TV (RRP RM1,099). Launch 12 Jun.",
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 5999, dap: 0, totalUpfront: 5999 },
MP139: { devicePrice: 5799, dap: 180, totalUpfront: 5979 },
MP169: { devicePrice: 5599, dap: 360, totalUpfront: 5959 },
MP199: { devicePrice: 5299, dap: 660, totalUpfront: 5959 }
},
zero24: {
MP48: { monthly: 320, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 290, dapLabel: "Check ECC" },
MP109: { monthly: 290, dapLabel: "Check ECC" },
MP139: { monthly: 280, dapLabel: "Check ECC" },
MP169: { monthly: 265, dapLabel: "Check ECC" },
MP199: { monthly: 245, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 213, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 200, dapLabel: "Check ECC" },
MP109: { monthly: 200, dapLabel: "Check ECC" },
MP139: { monthly: 190, dapLabel: "Check ECC" },
MP169: { monthly: 175, dapLabel: "Check ECC" },
MP199: { monthly: 155, dapLabel: "Check ECC" }
}
}
}
}
]
},
'''
content = ru(content,
    '{\nmodel: "Honor Magic V5 5G",',
    MAGIC_V6 + '{\nmodel: "Honor Magic V5 5G",',
    "Honor Magic V6 5G ECEM insert")

# ─── 11-17. iPhone zerolution MP89 updates ─────────────────────────────────────
# Pattern: find MP48 + MP89=NA + specific MP109 value and add the right MP89 value.
# For 17e: MP99 is also NA → add both MP89 and MP99.
# For 17/Pro/ProMax: MP99 already correct → only add MP89.

iphone_updates = [
    # (mp48_z24, mp99_z24_old, mp89_z24_new, mp109_z24, mp48_z36, mp99_z36_old, mp89_z36_new, mp109_z36, label)
    # iPhone 17e 256GB: MP99 is NA → fix both MP89 and MP99
    (124, '"NA"', 113, 113, 83, '"NA"', 75, 75, "iPhone 17e 256GB"),
    # iPhone 17e 512GB: MP99 is NA → fix both
    (166, '"NA"', 151, 151, 111, '"NA"', 100, 100, "iPhone 17e 512GB"),
    # iPhone 17 256GB: MP99=151 already, only MP89=NA
    (166, 151, 151, 151, 111, 100, 100, 100, "iPhone 17 256GB"),
    # iPhone 17 512GB: MP99=189 already
    (208, 189, 189, 189, 138, 126, 126, 126, "iPhone 17 512GB"),
    # iPhone 17 Pro 256GB: MP99=208 already
    (229, 208, 208, 208, 152, 138, 138, 138, "iPhone 17 Pro 256GB"),
    # iPhone 17 Pro 512GB
    (270, 246, 246, 246, 180, 164, 164, 164, "iPhone 17 Pro 512GB"),
    # iPhone 17 Pro 1TB
    (312, 284, 284, 284, 208, 189, 189, 189, "iPhone 17 Pro 1TB"),
    # iPhone 17 Pro Max 256GB
    (249, 227, 227, 227, 166, 151, 151, 151, "iPhone 17 Pro Max 256GB"),
    # iPhone 17 Pro Max 512GB
    (291, 265, 265, 265, 194, 176, 176, 176, "iPhone 17 Pro Max 512GB"),
    # iPhone 17 Pro Max 1TB
    (333, 303, 303, 303, 222, 202, 202, 202, "iPhone 17 Pro Max 1TB"),
    # iPhone 17 Pro Max 2TB
    (416, 378, 378, 378, 277, 252, 252, 252, "iPhone 17 Pro Max 2TB"),
]

for mp48_24, mp99_24_old, mp89_24, mp109_24, mp48_36, mp99_36_old, mp89_36, mp109_36, lbl in iphone_updates:
    # Include zero24/zero36 opener to disambiguate identical MP values across blocks
    old24 = (
        'zero24: {\n'
        f'MP48: {{ monthly: {mp48_24}, dapLabel: "NA" }},\n'
        f'MP69: {{ monthly: "NA", dapLabel: "Check ECC" }},\n'
        f'MP89: {{ monthly: "NA", dapLabel: "Check ECC" }},\n'
        f'MP99: {{ monthly: {mp99_24_old}, dapLabel: "Check ECC" }},\n'
        f'MP109: {{ monthly: {mp109_24}, dapLabel: "Check ECC" }},'
    )
    new24 = (
        'zero24: {\n'
        f'MP48: {{ monthly: {mp48_24}, dapLabel: "NA" }},\n'
        f'MP69: {{ monthly: "NA", dapLabel: "Check ECC" }},\n'
        f'MP89: {{ monthly: {mp89_24}, dapLabel: "Check ECC" }},\n'
        f'MP99: {{ monthly: {mp109_24}, dapLabel: "Check ECC" }},\n'
        f'MP109: {{ monthly: {mp109_24}, dapLabel: "Check ECC" }},'
    )
    content = ru(content, old24, new24, f"{lbl} zero24 MP89")

    old36 = (
        'zero36: {\n'
        f'MP48: {{ monthly: {mp48_36}, dapLabel: "NA" }},\n'
        f'MP69: {{ monthly: "NA", dapLabel: "Check ECC" }},\n'
        f'MP89: {{ monthly: "NA", dapLabel: "Check ECC" }},\n'
        f'MP99: {{ monthly: {mp99_36_old}, dapLabel: "Check ECC" }},\n'
        f'MP109: {{ monthly: {mp109_36}, dapLabel: "Check ECC" }},'
    )
    new36 = (
        'zero36: {\n'
        f'MP48: {{ monthly: {mp48_36}, dapLabel: "NA" }},\n'
        f'MP69: {{ monthly: "NA", dapLabel: "Check ECC" }},\n'
        f'MP89: {{ monthly: {mp89_36}, dapLabel: "Check ECC" }},\n'
        f'MP99: {{ monthly: {mp109_36}, dapLabel: "Check ECC" }},\n'
        f'MP109: {{ monthly: {mp109_36}, dapLabel: "Check ECC" }},'
    )
    content = ru(content, old36, new36, f"{lbl} zero36 MP89")

# ─── Write ─────────────────────────────────────────────────────────────────────
CATALOG.write_text(content, encoding="utf-8")
print(f"\nDone. Lines: {len(content.splitlines())}")
