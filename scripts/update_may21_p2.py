"""
GTM 21 May 2026 – Part 2: Add 3 missing devices
  • Samsung Galaxy A57 5G  (RRP 2,699)
  • Vivo Y31 5G            (RRP 1,399) – zerolution only
  • Vivo Y39 5G            (RRP 999)   – zerolution only
"""

import re, sys, pathlib

CATALOG = pathlib.Path(__file__).parent.parent / "data" / "catalog.ts"


def replace_unique(content: str, old: str, new: str, label: str) -> str:
    count = content.count(old)
    if count != 1:
        print(f"  ERROR [{label}]: expected 1 match, found {count}")
        sys.exit(1)
    print(f"  OK [{label}]")
    return content.replace(old, new, 1)


content = CATALOG.read_text(encoding="utf-8")

# ──────────────────────────────────────────────────────────────
# 1. Samsung Galaxy A57 5G  (RRP 2,699) — insert between A56 and S25 FE
# ──────────────────────────────────────────────────────────────
A57_BLOCK = """{
model: "Galaxy A57 5G",
aliases: ["samsung", "a57"],
storages: [
{
storage: "Default",
rrp: 2699,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 1299, dap: 300, totalUpfront: 1599 },
MP139: { devicePrice: 999, dap: 600, totalUpfront: 1599 },
MP169: { devicePrice: 599, dap: 1000, totalUpfront: 1599 },
MP199: { devicePrice: 0, dap: 1600, totalUpfront: 1600 }
},
upfront36: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 899, dap: 700, totalUpfront: 1599 },
MP109: { devicePrice: 899, dap: 700, totalUpfront: 1599 },
MP139: { devicePrice: 199, dap: 1100, totalUpfront: 1299 },
MP169: { devicePrice: 0, dap: 1600, totalUpfront: 1600 },
MP199: { devicePrice: 0, dap: 1600, totalUpfront: 1600 }
},
zero24: {
MP48: { monthly: 112, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "NA" },
MP89: { monthly: "NA", dapLabel: "NA" },
MP99: { monthly: 95, dapLabel: "Check ECC" },
MP109: { monthly: 95, dapLabel: "Check ECC" },
MP139: { monthly: 85, dapLabel: "Check ECC" },
MP169: { monthly: 75, dapLabel: "Check ECC" },
MP199: { monthly: 55, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 74, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "NA" },
MP89: { monthly: "NA", dapLabel: "NA" },
MP99: { monthly: 65, dapLabel: "Check ECC" },
MP109: { monthly: 65, dapLabel: "Check ECC" },
MP139: { monthly: 60, dapLabel: "Check ECC" },
MP169: { monthly: 50, dapLabel: "Check ECC" },
MP199: { monthly: 35, dapLabel: "Check ECC" }
}
}
}
}
]
},
"""

content = replace_unique(
    content,
    '{\nmodel: "Galaxy S25 FE 5G",',
    A57_BLOCK + '{\nmodel: "Galaxy S25 FE 5G",',
    "Samsung Galaxy A57 5G insertion",
)

# ──────────────────────────────────────────────────────────────
# 2. Vivo Y39 5G  (RRP 999, zero24 MP48=41 only) — insert before Y11 5G
# ──────────────────────────────────────────────────────────────
Y39_BLOCK = """{
model: "Vivo Y39 5G",
aliases: ["vivo", "y39"],
storages: [{
storage: "Default",
rrp: 999,
regions: {
ECEM: {
zero24: {
MP48: { monthly: 41, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "NA" },
MP89: { monthly: "NA", dapLabel: "NA" },
MP99: { monthly: "NA", dapLabel: "NA" },
MP109: { monthly: "NA", dapLabel: "NA" },
MP139: { monthly: "NA", dapLabel: "NA" },
MP169: { monthly: "NA", dapLabel: "NA" },
MP199: { monthly: "NA", dapLabel: "NA" }
}
}
}
}]
},
"""

content = replace_unique(
    content,
    '{\nmodel: "Vivo Y11 5G",\naliases: ["vivo", "y11"],',
    Y39_BLOCK + '{\nmodel: "Vivo Y11 5G",\naliases: ["vivo", "y11"],',
    "Vivo Y39 5G insertion (before Y11)",
)

# ──────────────────────────────────────────────────────────────
# 3. Vivo Y31 5G  (RRP 1,399, zero24 MP48=58 only) — insert between Y11 and Y21
# ──────────────────────────────────────────────────────────────
Y31_BLOCK = """{
model: "Vivo Y31 5G",
aliases: ["vivo", "y31"],
storages: [{
storage: "Default",
rrp: 1399,
regions: {
ECEM: {
zero24: {
MP48: { monthly: 58, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "NA" },
MP89: { monthly: "NA", dapLabel: "NA" },
MP99: { monthly: "NA", dapLabel: "NA" },
MP109: { monthly: "NA", dapLabel: "NA" },
MP139: { monthly: "NA", dapLabel: "NA" },
MP169: { monthly: "NA", dapLabel: "NA" },
MP199: { monthly: "NA", dapLabel: "NA" }
}
}
}
}]
},
"""

# Anchor: the very last line of Y11's zero24 block, followed by the Y21 opener
ANCHOR = (
    'MP199: { monthly: "NA", dapLabel: "NA" }\n'
    "}\n"
    "}\n"
    "}\n"
    "}]\n"
    "},\n"
    "{\n"
    'model: "Vivo Y21 5G",'
)

REPLACEMENT = (
    'MP199: { monthly: "NA", dapLabel: "NA" }\n'
    "}\n"
    "}\n"
    "}\n"
    "}]\n"
    "},\n"
    + Y31_BLOCK
    + "{\n"
    'model: "Vivo Y21 5G",'
)

content = replace_unique(content, ANCHOR, REPLACEMENT, "Vivo Y31 5G insertion (between Y11 and Y21)")

# ──────────────────────────────────────────────────────────────
# Write
# ──────────────────────────────────────────────────────────────
CATALOG.write_text(content, encoding="utf-8")
print("\nAll 3 devices added successfully.")
