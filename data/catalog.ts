export type PricingMode = "upfront" | "zero24" | "zero36" | "hotlink12" | "hotlink24";
export type RegionKey = "ECEM" | "HOTLINK";

type UpfrontRow = {
  devicePrice: number | string;
  dap?: number | string;
  totalUpfront?: number | string;
  dapLabel?: string;
};

type ZeroRow = {
  monthly: number | string;
  dapLabel?: string;
};

// Hotlink Postpaid row: flat-fee plan, 12M or 24M contract
export type HotlinkRow = {
  devicePrice: number | string;  // net device cost (after DAP rebate)
  dap: number | string;          // deposit returned monthly
  totalUpfront: number | string; // cash customer brings to store
  monthly: number | string;      // effective monthly plan fee
};

export type StoragePricing = {
  upfront?: Record<string, UpfrontRow>;
  zero24?: Record<string, ZeroRow>;
  zero36?: Record<string, ZeroRow>;
  hotlink12?: Record<string, HotlinkRow>;  // HP65/HP75 on 12-month
  hotlink24?: Record<string, HotlinkRow>;  // HP65/HP75 on 24-month
};

export type RegionPricingMap = Partial<Record<RegionKey, StoragePricing>>;

export type CatalogStorage = {
  storage: string;
  rrp: number;
  notes?: string;
  promo?: string;
  regions: RegionPricingMap;
};

export type CatalogModel = {
  model: string;
  aliases: string[];
  eol?: boolean;
  storages: CatalogStorage[];
};

export type CatalogBrand = {
  brand: string;
  models: CatalogModel[];
};

// Pricing source — update this whenever a new GTM is applied
export const CATALOG_SOURCE = "GTM 23 Apr 2026";
export const CATALOG_DATE = "2026-04-09";

export const catalog: CatalogBrand[] = [
// ── Hotlink Postpaid devices (HP45 / HP65 / HP75) ─────────────────────────
{
brand: "Hotlink",
models: [
{
model: "Samsung Galaxy A07 5G",
aliases: ["samsung", "a07", "a075g", "hotlink"],
storages: [{
storage: "8+256GB",
rrp: 949,
regions: {
HOTLINK: {
hotlink12: {
HP75: { devicePrice: 279, dap: 0, totalUpfront: 279, monthly: 75 }
},
hotlink24: {
HP75: { devicePrice: 0, dap: 200, totalUpfront: 200, monthly: 66.67 }
}
}
}
}]
},
{
model: "Samsung Galaxy A07 LTE",
aliases: ["samsung", "a07", "a07lte", "hotlink"],
storages: [{
storage: "8+256GB",
rrp: 699,
regions: {
HOTLINK: {
hotlink12: {
HP65: { devicePrice: 79, dap: 30, totalUpfront: 109, monthly: 62.50 }
}
}
}
}]
},
{
model: "Nubia A76 5G",
aliases: ["nubia", "a76", "hotlink"],
storages: [{
storage: "8+128GB",
rrp: 899,
regions: {
HOTLINK: {
hotlink12: {
HP75: { devicePrice: 79, dap: 60, totalUpfront: 139, monthly: 70 }
},
hotlink24: {
HP75: { devicePrice: 0, dap: 120, totalUpfront: 120, monthly: 70 }
}
}
}
}]
},
{
model: "Honor 500 Smart 5G",
aliases: ["honor", "honor500", "hotlink"],
storages: [{
storage: "8+256GB",
rrp: 1099,
regions: {
HOTLINK: {
hotlink12: {
HP75: { devicePrice: 459, dap: 0, totalUpfront: 459, monthly: 75 }
},
hotlink24: {
HP75: { devicePrice: 129, dap: 180, totalUpfront: 309, monthly: 67.50 }
}
}
}
}]
},
{
model: "Honor Pad X8b LTE",
aliases: ["honor", "padx8b", "x8b", "hotlink"],
storages: [{
storage: "8+256GB",
rrp: 999,
regions: {
HOTLINK: {
hotlink12: {
HP75: { devicePrice: 659, dap: 0, totalUpfront: 659, monthly: 75 }
},
hotlink24: {
HP75: { devicePrice: 339, dap: 120, totalUpfront: 459, monthly: 70 }
}
}
}
}]
},
{
model: "Honor 600 Lite 5G",
aliases: ["honor", "honor600lite", "hotlink"],
storages: [{
storage: "12+256GB",
rrp: 1399,
promo: "DAP reduced eff 9 Apr 2026.",
regions: {
HOTLINK: {
hotlink12: {
HP75: { devicePrice: 699, dap: 0, totalUpfront: 699, monthly: 75 }
},
hotlink24: {
HP75: { devicePrice: 399, dap: 60, totalUpfront: 459, monthly: 72.50 }
}
}
}
}]
},
{
model: "Realme C85 4G",
aliases: ["realme", "c85", "hotlink"],
storages: [{
storage: "8+256GB",
rrp: 749,
regions: {
HOTLINK: {
hotlink12: {
HP65: { devicePrice: 459, dap: 0, totalUpfront: 459, monthly: 65 },
HP75: { devicePrice: 399, dap: 0, totalUpfront: 399, monthly: 75 }
},
hotlink24: {
HP65: { devicePrice: 99, dap: 180, totalUpfront: 279, monthly: 50 },
HP75: { devicePrice: 49, dap: 150, totalUpfront: 199, monthly: 68.75 }
}
}
}
}]
},
{
model: "Nubia V80 Max 4G",
aliases: ["nubia", "v80max", "hotlink"],
storages: [{
storage: "8+256GB",
rrp: 799,
regions: {
HOTLINK: {
hotlink12: {
HP65: { devicePrice: 459, dap: 0, totalUpfront: 459, monthly: 65 },
HP75: { devicePrice: 399, dap: 0, totalUpfront: 399, monthly: 75 }
},
hotlink24: {
HP65: { devicePrice: 99, dap: 180, totalUpfront: 279, monthly: 50 },
HP75: { devicePrice: 49, dap: 150, totalUpfront: 199, monthly: 68.75 }
}
}
}
}]
},
{
model: "Vivo Y11d 4G",
aliases: ["vivo", "y11d", "hotlink"],
storages: [{
storage: "4+64GB",
rrp: 549,
regions: {
HOTLINK: {
hotlink12: {
HP65: { devicePrice: 199, dap: 0, totalUpfront: 199, monthly: 65 }
}
}
}
}]
},
{
model: "Vivo Y11 5G",
aliases: ["vivo", "y11", "hotlink"],
storages: [{
storage: "4+256GB",
rrp: 1099,
regions: {
HOTLINK: {
hotlink12: {
HP75: { devicePrice: 459, dap: 0, totalUpfront: 459, monthly: 75 }
},
hotlink24: {
HP75: { devicePrice: 99, dap: 180, totalUpfront: 279, monthly: 67.50 }
}
}
}
}]
},
{
model: "Oppo A6t 5G",
aliases: ["oppo", "a6t", "hotlink"],
storages: [{
storage: "4+256GB",
rrp: 1099,
regions: {
HOTLINK: {
hotlink12: {
HP75: { devicePrice: 459, dap: 0, totalUpfront: 459, monthly: 75 }
},
hotlink24: {
HP75: { devicePrice: 99, dap: 180, totalUpfront: 279, monthly: 67.50 }
}
}
}
}]
}
]
},
{
brand: "Apple",
models: [
{
model: "iPhone 15",
aliases: ["iphone", "ip15"],
storages: [
{
storage: "128GB",
rrp: 2999,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: 2072, dap: 480, totalUpfront: 2552 },
MP89: { devicePrice: 2024, dap: 480, totalUpfront: 2504 },
MP99: { devicePrice: 1928, dap: 600, totalUpfront: 2528 },
MP109: { devicePrice: 1880, dap: 600, totalUpfront: 2480 },
MP139: { devicePrice: 1736, dap: 720, totalUpfront: 2456 },
MP169: { devicePrice: 1592, dap: 840, totalUpfront: 2432 },
MP199: { devicePrice: 1448, dap: 960, totalUpfront: 2408 }
},
zero24: {
MP48: { monthly: 110, dapLabel: "NA" },
MP69: { monthly: 99, dapLabel: "Check ECC" },
MP89: { monthly: 99, dapLabel: "Check ECC" },
MP99: { monthly: 99, dapLabel: "Check ECC" },
MP109: { monthly: 99, dapLabel: "Check ECC" },
MP139: { monthly: 85, dapLabel: "Check ECC" },
MP169: { monthly: 82, dapLabel: "Check ECC" },
MP199: { monthly: 79, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 74, dapLabel: "NA" },
MP69: { monthly: 66, dapLabel: "Check ECC" },
MP89: { monthly: 66, dapLabel: "Check ECC" },
MP99: { monthly: 66, dapLabel: "Check ECC" },
MP109: { monthly: 66, dapLabel: "Check ECC" },
MP139: { monthly: 52, dapLabel: "Check ECC" },
MP169: { monthly: 49, dapLabel: "Check ECC" },
MP199: { monthly: 46, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "iPhone 16e",
aliases: ["iphone", "ip16e"],
storages: [
{
storage: "128GB",
rrp: 2999,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: 1684, dap: 840, totalUpfront: 2524 },
MP89: { devicePrice: 1636, dap: 840, totalUpfront: 2476 },
MP99: { devicePrice: 1540, dap: 960, totalUpfront: 2500 },
MP109: { devicePrice: 1492, dap: 960, totalUpfront: 2452 },
MP139: { devicePrice: 1348, dap: 1080, totalUpfront: 2428 },
MP169: { devicePrice: 1204, dap: 1200, totalUpfront: 2404 },
MP199: { devicePrice: 1060, dap: 1340, totalUpfront: 2400 }
},
zero24: {
MP48: { monthly: 115, dapLabel: "NA" },
MP69: { monthly: 104, dapLabel: "Check ECC" },
MP89: { monthly: 104, dapLabel: "Check ECC" },
MP99: { monthly: 104, dapLabel: "Check ECC" },
MP109: { monthly: 104, dapLabel: "Check ECC" },
MP139: { monthly: 90, dapLabel: "Check ECC" },
MP169: { monthly: 87, dapLabel: "Check ECC" },
MP199: { monthly: 84, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 77, dapLabel: "NA" },
MP69: { monthly: 69, dapLabel: "Check ECC" },
MP89: { monthly: 69, dapLabel: "Check ECC" },
MP99: { monthly: 69, dapLabel: "Check ECC" },
MP109: { monthly: 69, dapLabel: "Check ECC" },
MP139: { monthly: 55, dapLabel: "Check ECC" },
MP169: { monthly: 52, dapLabel: "Check ECC" },
MP199: { monthly: 49, dapLabel: "Check ECC" }
}
}
}
},
{
storage: "256GB",
rrp: 3499,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: 2139, dap: 840, totalUpfront: 2979 },
MP89: { devicePrice: 2091, dap: 840, totalUpfront: 2931 },
MP99: { devicePrice: 1995, dap: 960, totalUpfront: 2955 },
MP109: { devicePrice: 1947, dap: 960, totalUpfront: 2907 },
MP139: { devicePrice: 1803, dap: 1080, totalUpfront: 2883 },
MP169: { devicePrice: 1659, dap: 1200, totalUpfront: 2859 },
MP199: { devicePrice: 1515, dap: 1340, totalUpfront: 2855 }
},
zero24: {
MP48: { monthly: 136, dapLabel: "NA" },
MP69: { monthly: 123, dapLabel: "Check ECC" },
MP89: { monthly: 123, dapLabel: "Check ECC" },
MP99: { monthly: 123, dapLabel: "Check ECC" },
MP109: { monthly: 123, dapLabel: "Check ECC" },
MP139: { monthly: 109, dapLabel: "Check ECC" },
MP169: { monthly: 106, dapLabel: "Check ECC" },
MP199: { monthly: 103, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 91, dapLabel: "NA" },
MP69: { monthly: 82, dapLabel: "Check ECC" },
MP89: { monthly: 82, dapLabel: "Check ECC" },
MP99: { monthly: 82, dapLabel: "Check ECC" },
MP109: { monthly: 82, dapLabel: "Check ECC" },
MP139: { monthly: 68, dapLabel: "Check ECC" },
MP169: { monthly: 65, dapLabel: "Check ECC" },
MP199: { monthly: 62, dapLabel: "Check ECC" }
}
}
}
},
{
storage: "512GB",
rrp: 4499,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: 3048, dap: 840, totalUpfront: 3888 },
MP89: { devicePrice: 3000, dap: 840, totalUpfront: 3840 },
MP99: { devicePrice: 2904, dap: 960, totalUpfront: 3864 },
MP109: { devicePrice: 2856, dap: 960, totalUpfront: 3816 },
MP139: { devicePrice: 2712, dap: 1080, totalUpfront: 3792 },
MP169: { devicePrice: 2568, dap: 1200, totalUpfront: 3768 },
MP199: { devicePrice: 2424, dap: 1340, totalUpfront: 3764 }
},
zero24: {
MP48: { monthly: 178, dapLabel: "NA" },
MP69: { monthly: 161, dapLabel: "Check ECC" },
MP89: { monthly: 161, dapLabel: "Check ECC" },
MP99: { monthly: 161, dapLabel: "Check ECC" },
MP109: { monthly: 161, dapLabel: "Check ECC" },
MP139: { monthly: 147, dapLabel: "Check ECC" },
MP169: { monthly: 144, dapLabel: "Check ECC" },
MP199: { monthly: 141, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 118, dapLabel: "NA" },
MP69: { monthly: 107, dapLabel: "Check ECC" },
MP89: { monthly: 107, dapLabel: "Check ECC" },
MP99: { monthly: 107, dapLabel: "Check ECC" },
MP109: { monthly: 107, dapLabel: "Check ECC" },
MP139: { monthly: 93, dapLabel: "Check ECC" },
MP169: { monthly: 90, dapLabel: "Check ECC" },
MP199: { monthly: 87, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "iPhone 16",
aliases: ["iphone", "ip16"],
storages: [
{
storage: "128GB",
rrp: 3499,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: 2509, dap: 480, totalUpfront: 2989 },
MP89: { devicePrice: 2461, dap: 480, totalUpfront: 2941 },
MP99: { devicePrice: 2365, dap: 600, totalUpfront: 2965 },
MP109: { devicePrice: 2317, dap: 600, totalUpfront: 2917 },
MP139: { devicePrice: 2173, dap: 720, totalUpfront: 2893 },
MP169: { devicePrice: 2029, dap: 840, totalUpfront: 2869 },
MP199: { devicePrice: 1885, dap: 960, totalUpfront: 2845 }
},
zero24: {
MP48: { monthly: 130, dapLabel: "NA" },
MP69: { monthly: 117, dapLabel: "Check ECC" },
MP89: { monthly: 117, dapLabel: "Check ECC" },
MP99: { monthly: 117, dapLabel: "Check ECC" },
MP109: { monthly: 117, dapLabel: "Check ECC" },
MP139: { monthly: 103, dapLabel: "Check ECC" },
MP169: { monthly: 100, dapLabel: "Check ECC" },
MP199: { monthly: 97, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 87, dapLabel: "NA" },
MP69: { monthly: 78, dapLabel: "Check ECC" },
MP89: { monthly: 78, dapLabel: "Check ECC" },
MP99: { monthly: 78, dapLabel: "Check ECC" },
MP109: { monthly: 78, dapLabel: "Check ECC" },
MP139: { monthly: 64, dapLabel: "Check ECC" },
MP169: { monthly: 61, dapLabel: "Check ECC" },
MP199: { monthly: 58, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "iPhone 16 Plus",
aliases: ["iphone", "ip16plus"],
storages: [
{
storage: "128GB",
rrp: 4499,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: 3142, dap: 600, totalUpfront: 3742 },
MP89: { devicePrice: 3094, dap: 600, totalUpfront: 3694 },
MP99: { devicePrice: 2998, dap: 720, totalUpfront: 3718 },
MP109: { devicePrice: 2950, dap: 720, totalUpfront: 3670 },
MP139: { devicePrice: 2806, dap: 840, totalUpfront: 3646 },
MP169: { devicePrice: 2662, dap: 960, totalUpfront: 3622 },
MP199: { devicePrice: 2518, dap: 1080, totalUpfront: 3598 }
},
zero24: {
MP48: { monthly: 161, dapLabel: "NA" },
MP69: { monthly: 144, dapLabel: "Check ECC" },
MP89: { monthly: 144, dapLabel: "Check ECC" },
MP99: { monthly: 144, dapLabel: "Check ECC" },
MP109: { monthly: 144, dapLabel: "Check ECC" },
MP139: { monthly: 130, dapLabel: "Check ECC" },
MP169: { monthly: 127, dapLabel: "Check ECC" },
MP199: { monthly: 124, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 106, dapLabel: "NA" },
MP69: { monthly: 95, dapLabel: "Check ECC" },
MP89: { monthly: 95, dapLabel: "Check ECC" },
MP99: { monthly: 95, dapLabel: "Check ECC" },
MP109: { monthly: 95, dapLabel: "Check ECC" },
MP139: { monthly: 81, dapLabel: "Check ECC" },
MP169: { monthly: 78, dapLabel: "Check ECC" },
MP199: { monthly: 75, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "iPhone 17e",
aliases: ["iphone", "ip17e"],
storages: [
{
storage: "256GB",
rrp: 2999,
      promo: "Free from MP169 (36M). Or RM1,941 on MP109 (36M). Save RM1,058.",
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 2250, dap: 240, totalUpfront: 2490 },
MP109: { devicePrice: 2202, dap: 240, totalUpfront: 2442 },
MP139: { devicePrice: 2058, dap: 360, totalUpfront: 2418 },
MP169: { devicePrice: 1914, dap: 480, totalUpfront: 2394 },
MP199: { devicePrice: 1770, dap: 620, totalUpfront: 2390 }
},
zero24: {
MP48: { monthly: 124, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: "NA", dapLabel: "Check ECC" },
MP109: { monthly: 113, dapLabel: "Check ECC" },
MP139: { monthly: 99, dapLabel: "Check ECC" },
MP169: { monthly: 96, dapLabel: "Check ECC" },
MP199: { monthly: 93, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 83, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: "NA", dapLabel: "Check ECC" },
MP109: { monthly: 75, dapLabel: "Check ECC" },
MP139: { monthly: 61, dapLabel: "Check ECC" },
MP169: { monthly: 58, dapLabel: "Check ECC" },
MP199: { monthly: 55, dapLabel: "Check ECC" }
}
}
}
},
{
storage: "512GB",
rrp: 3999,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 3159, dap: 240, totalUpfront: 3399 },
MP109: { devicePrice: 3111, dap: 240, totalUpfront: 3351 },
MP139: { devicePrice: 2967, dap: 360, totalUpfront: 3327 },
MP169: { devicePrice: 2823, dap: 480, totalUpfront: 3303 },
MP199: { devicePrice: 2679, dap: 620, totalUpfront: 3299 }
},
zero24: {
MP48: { monthly: 166, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: "NA", dapLabel: "Check ECC" },
MP109: { monthly: 151, dapLabel: "Check ECC" },
MP139: { monthly: 137, dapLabel: "Check ECC" },
MP169: { monthly: 134, dapLabel: "Check ECC" },
MP199: { monthly: 131, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 111, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: "NA", dapLabel: "Check ECC" },
MP109: { monthly: 100, dapLabel: "Check ECC" },
MP139: { monthly: 87, dapLabel: "Check ECC" },
MP169: { monthly: 84, dapLabel: "Check ECC" },
MP199: { monthly: 81, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "iPhone 17",
aliases: ["iphone", "ip17"],
storages: [
{
storage: "256GB",
rrp: 3999,
      promo: "Now FREE with MP199 (36M upfront).",
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 3159, dap: 360, totalUpfront: 3519 },
MP109: { devicePrice: 3111, dap: 360, totalUpfront: 3471 },
MP139: { devicePrice: 2967, dap: 480, totalUpfront: 3447 },
MP169: { devicePrice: 2823, dap: 600, totalUpfront: 3423 },
MP199: { devicePrice: 2679, dap: 720, totalUpfront: 3399 }
},
zero24: {
MP48: { monthly: 166, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 151, dapLabel: "Check ECC" },
MP109: { monthly: 151, dapLabel: "Check ECC" },
MP139: { monthly: 137, dapLabel: "Check ECC" },
MP169: { monthly: 134, dapLabel: "Check ECC" },
MP199: { monthly: 131, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 111, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 100, dapLabel: "Check ECC" },
MP109: { monthly: 100, dapLabel: "Check ECC" },
MP139: { monthly: 87, dapLabel: "Check ECC" },
MP169: { monthly: 84, dapLabel: "Check ECC" },
MP199: { monthly: 81, dapLabel: "Check ECC" }
}
}
}
},
{
storage: "512GB",
rrp: 4999,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 4069, dap: 360, totalUpfront: 4429 },
MP109: { devicePrice: 4021, dap: 360, totalUpfront: 4381 },
MP139: { devicePrice: 3877, dap: 480, totalUpfront: 4357 },
MP169: { devicePrice: 3733, dap: 600, totalUpfront: 4333 },
MP199: { devicePrice: 3589, dap: 720, totalUpfront: 4309 }
},
zero24: {
MP48: { monthly: 208, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 189, dapLabel: "Check ECC" },
MP109: { monthly: 189, dapLabel: "Check ECC" },
MP139: { monthly: 175, dapLabel: "Check ECC" },
MP169: { monthly: 172, dapLabel: "Check ECC" },
MP199: { monthly: 169, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 138, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 126, dapLabel: "Check ECC" },
MP109: { monthly: 126, dapLabel: "Check ECC" },
MP139: { monthly: 112, dapLabel: "Check ECC" },
MP169: { monthly: 109, dapLabel: "Check ECC" },
MP199: { monthly: 106, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "iPhone Air",
aliases: ["iphone", "ipair"],
storages: [
{
storage: "256GB",
rrp: 4999,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: 3207, dap: 960, totalUpfront: 4167 },
MP99: { devicePrice: 3159, dap: 960, totalUpfront: 4119 },
MP109: { devicePrice: 3111, dap: 960, totalUpfront: 4071 },
MP139: { devicePrice: 2967, dap: 1080, totalUpfront: 4047 },
MP169: { devicePrice: 2823, dap: 1200, totalUpfront: 4023 },
MP199: { devicePrice: 2679, dap: 1320, totalUpfront: 3999 }
},
zero24: {
MP48: { monthly: 170, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: 151, dapLabel: "Check ECC" },
MP99: { monthly: 151, dapLabel: "Check ECC" },
MP109: { monthly: 151, dapLabel: "Check ECC" },
MP139: { monthly: 137, dapLabel: "Check ECC" },
MP169: { monthly: 134, dapLabel: "Check ECC" },
MP199: { monthly: 131, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 112, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: 100, dapLabel: "Check ECC" },
MP99: { monthly: 100, dapLabel: "Check ECC" },
MP109: { monthly: 100, dapLabel: "Check ECC" },
MP139: { monthly: 86, dapLabel: "Check ECC" },
MP169: { monthly: 83, dapLabel: "Check ECC" },
MP199: { monthly: 80, dapLabel: "Check ECC" }
}
}
}
},
{
storage: "512GB",
rrp: 5999,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: 4116, dap: 960, totalUpfront: 5076 },
MP99: { devicePrice: 4068, dap: 960, totalUpfront: 5028 },
MP109: { devicePrice: 4020, dap: 960, totalUpfront: 4980 },
MP139: { devicePrice: 3876, dap: 1080, totalUpfront: 4956 },
MP169: { devicePrice: 3732, dap: 1200, totalUpfront: 4932 },
MP199: { devicePrice: 3588, dap: 1320, totalUpfront: 4908 }
},
zero24: {
MP48: { monthly: 211, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: 189, dapLabel: "Check ECC" },
MP99: { monthly: 189, dapLabel: "Check ECC" },
MP109: { monthly: 189, dapLabel: "Check ECC" },
MP139: { monthly: 175, dapLabel: "Check ECC" },
MP169: { monthly: 172, dapLabel: "Check ECC" },
MP199: { monthly: 169, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 140, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: 125, dapLabel: "Check ECC" },
MP99: { monthly: 125, dapLabel: "Check ECC" },
MP109: { monthly: 125, dapLabel: "Check ECC" },
MP139: { monthly: 111, dapLabel: "Check ECC" },
MP169: { monthly: 108, dapLabel: "Check ECC" },
MP199: { monthly: 105, dapLabel: "Check ECC" }
}
}
}
},
{
storage: "1TB",
rrp: 6999,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: 5025, dap: 960, totalUpfront: 5985 },
MP99: { devicePrice: 4977, dap: 960, totalUpfront: 5937 },
MP109: { devicePrice: 4929, dap: 960, totalUpfront: 5889 },
MP139: { devicePrice: 4785, dap: 1080, totalUpfront: 5865 },
MP169: { devicePrice: 4641, dap: 1200, totalUpfront: 5841 },
MP199: { devicePrice: 4497, dap: 1320, totalUpfront: 5817 }
},
zero24: {
MP48: { monthly: 253, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: 227, dapLabel: "Check ECC" },
MP99: { monthly: 227, dapLabel: "Check ECC" },
MP109: { monthly: 227, dapLabel: "Check ECC" },
MP139: { monthly: 213, dapLabel: "Check ECC" },
MP169: { monthly: 210, dapLabel: "Check ECC" },
MP199: { monthly: 207, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 168, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: 148, dapLabel: "Check ECC" },
MP99: { monthly: 150, dapLabel: "Check ECC" },
MP109: { monthly: 150, dapLabel: "Check ECC" },
MP139: { monthly: 136, dapLabel: "Check ECC" },
MP169: { monthly: 133, dapLabel: "Check ECC" },
MP199: { monthly: 130, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "iPhone 17 Pro",
aliases: ["iphone", "ip17pro"],
storages: [
{
storage: "256GB",
rrp: 5499,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 4523, dap: 360, totalUpfront: 4883 },
MP109: { devicePrice: 4475, dap: 360, totalUpfront: 4835 },
MP139: { devicePrice: 4331, dap: 480, totalUpfront: 4811 },
MP169: { devicePrice: 4187, dap: 600, totalUpfront: 4787 },
MP199: { devicePrice: 4043, dap: 720, totalUpfront: 4763 }
},
zero24: {
MP48: { monthly: 229, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 208, dapLabel: "Check ECC" },
MP109: { monthly: 208, dapLabel: "Check ECC" },
MP139: { monthly: 194, dapLabel: "Check ECC" },
MP169: { monthly: 191, dapLabel: "Check ECC" },
MP199: { monthly: 188, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 152, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 138, dapLabel: "Check ECC" },
MP109: { monthly: 138, dapLabel: "Check ECC" },
MP139: { monthly: 124, dapLabel: "Check ECC" },
MP169: { monthly: 121, dapLabel: "Check ECC" },
MP199: { monthly: 118, dapLabel: "Check ECC" }
}
}
}
},
{
storage: "512GB",
rrp: 6499,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 5432, dap: 360, totalUpfront: 5792 },
MP109: { devicePrice: 5384, dap: 360, totalUpfront: 5744 },
MP139: { devicePrice: 5240, dap: 480, totalUpfront: 5720 },
MP169: { devicePrice: 5096, dap: 600, totalUpfront: 5696 },
MP199: { devicePrice: 4952, dap: 720, totalUpfront: 5672 }
},
zero24: {
MP48: { monthly: 270, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 246, dapLabel: "Check ECC" },
MP109: { monthly: 246, dapLabel: "Check ECC" },
MP139: { monthly: 232, dapLabel: "Check ECC" },
MP169: { monthly: 229, dapLabel: "Check ECC" },
MP199: { monthly: 226, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 180, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 164, dapLabel: "Check ECC" },
MP109: { monthly: 164, dapLabel: "Check ECC" },
MP139: { monthly: 150, dapLabel: "Check ECC" },
MP169: { monthly: 147, dapLabel: "Check ECC" },
MP199: { monthly: 144, dapLabel: "Check ECC" }
}
}
}
},
{
storage: "1TB",
rrp: 7499,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 6341, dap: 360, totalUpfront: 6701 },
MP109: { devicePrice: 6293, dap: 360, totalUpfront: 6653 },
MP139: { devicePrice: 6149, dap: 480, totalUpfront: 6629 },
MP169: { devicePrice: 6005, dap: 600, totalUpfront: 6605 },
MP199: { devicePrice: 5861, dap: 720, totalUpfront: 6581 }
},
zero24: {
MP48: { monthly: 312, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 284, dapLabel: "Check ECC" },
MP109: { monthly: 284, dapLabel: "Check ECC" },
MP139: { monthly: 270, dapLabel: "Check ECC" },
MP169: { monthly: 267, dapLabel: "Check ECC" },
MP199: { monthly: 264, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 208, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 189, dapLabel: "Check ECC" },
MP109: { monthly: 189, dapLabel: "Check ECC" },
MP139: { monthly: 175, dapLabel: "Check ECC" },
MP169: { monthly: 172, dapLabel: "Check ECC" },
MP199: { monthly: 169, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "iPhone 17 Pro Max",
aliases: ["iphone", "ip17promax"],
storages: [
{
storage: "256GB",
rrp: 5999,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 4978, dap: 360, totalUpfront: 5338 },
MP109: { devicePrice: 4930, dap: 360, totalUpfront: 5290 },
MP139: { devicePrice: 4786, dap: 480, totalUpfront: 5266 },
MP169: { devicePrice: 4642, dap: 600, totalUpfront: 5242 },
MP199: { devicePrice: 4498, dap: 720, totalUpfront: 5218 }
},
zero24: {
MP48: { monthly: 249, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 227, dapLabel: "Check ECC" },
MP109: { monthly: 227, dapLabel: "Check ECC" },
MP139: { monthly: 213, dapLabel: "Check ECC" },
MP169: { monthly: 210, dapLabel: "Check ECC" },
MP199: { monthly: 207, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 166, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 151, dapLabel: "Check ECC" },
MP109: { monthly: 151, dapLabel: "Check ECC" },
MP139: { monthly: 137, dapLabel: "Check ECC" },
MP169: { monthly: 134, dapLabel: "Check ECC" },
MP199: { monthly: 131, dapLabel: "Check ECC" }
}
}
}
},
{
storage: "512GB",
rrp: 6999,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 5887, dap: 360, totalUpfront: 6247 },
MP109: { devicePrice: 5839, dap: 360, totalUpfront: 6199 },
MP139: { devicePrice: 5695, dap: 480, totalUpfront: 6175 },
MP169: { devicePrice: 5551, dap: 600, totalUpfront: 6151 },
MP199: { devicePrice: 5407, dap: 720, totalUpfront: 6127 }
},
zero24: {
MP48: { monthly: 291, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 265, dapLabel: "Check ECC" },
MP109: { monthly: 265, dapLabel: "Check ECC" },
MP139: { monthly: 251, dapLabel: "Check ECC" },
MP169: { monthly: 248, dapLabel: "Check ECC" },
MP199: { monthly: 245, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 194, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 176, dapLabel: "Check ECC" },
MP109: { monthly: 176, dapLabel: "Check ECC" },
MP139: { monthly: 162, dapLabel: "Check ECC" },
MP169: { monthly: 159, dapLabel: "Check ECC" },
MP199: { monthly: 156, dapLabel: "Check ECC" }
}
}
}
},
{
storage: "1TB",
rrp: 7999,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 6796, dap: 360, totalUpfront: 7156 },
MP109: { devicePrice: 6748, dap: 360, totalUpfront: 7108 },
MP139: { devicePrice: 6604, dap: 480, totalUpfront: 7084 },
MP169: { devicePrice: 6460, dap: 600, totalUpfront: 7060 },
MP199: { devicePrice: 6316, dap: 720, totalUpfront: 7036 }
},
zero24: {
MP48: { monthly: 333, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 303, dapLabel: "Check ECC" },
MP109: { monthly: 303, dapLabel: "Check ECC" },
MP139: { monthly: 289, dapLabel: "Check ECC" },
MP169: { monthly: 286, dapLabel: "Check ECC" },
MP199: { monthly: 283, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 222, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 202, dapLabel: "Check ECC" },
MP109: { monthly: 202, dapLabel: "Check ECC" },
MP139: { monthly: 188, dapLabel: "Check ECC" },
MP169: { monthly: 185, dapLabel: "Check ECC" },
MP199: { monthly: 182, dapLabel: "Check ECC" }
}
}
}
},
{
storage: "2TB",
rrp: 9999,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 8614, dap: 360, totalUpfront: 8974 },
MP109: { devicePrice: 8566, dap: 360, totalUpfront: 8926 },
MP139: { devicePrice: 8422, dap: 480, totalUpfront: 8902 },
MP169: { devicePrice: 8278, dap: 600, totalUpfront: 8878 },
MP199: { devicePrice: 8134, dap: 720, totalUpfront: 8854 }
},
zero24: {
MP48: { monthly: 416, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 378, dapLabel: "Check ECC" },
MP109: { monthly: 378, dapLabel: "Check ECC" },
MP139: { monthly: 364, dapLabel: "Check ECC" },
MP169: { monthly: 361, dapLabel: "Check ECC" },
MP199: { monthly: 358, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 277, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 252, dapLabel: "Check ECC" },
MP109: { monthly: 252, dapLabel: "Check ECC" },
MP139: { monthly: 238, dapLabel: "Check ECC" },
MP169: { monthly: 235, dapLabel: "Check ECC" },
MP199: { monthly: 232, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: '11" iPad (11th Gen)',
aliases: ["ipad", "ipad11"],
storages: [
{
storage: "256GB",
rrp: 2699,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 1905, dap: 360, totalUpfront: 2265 },
MP139: { devicePrice: 1761, dap: 480, totalUpfront: 2241 },
MP169: { devicePrice: 1617, dap: 600, totalUpfront: 2217 },
MP199: { devicePrice: 1473, dap: 720, totalUpfront: 2193 }
},
zero24: {
MP48: { monthly: 249, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 101, dapLabel: "Check ECC" },
MP109: { monthly: 101, dapLabel: "Check ECC" },
MP139: { monthly: 87, dapLabel: "Check ECC" },
MP169: { monthly: 84, dapLabel: "Check ECC" },
MP199: { monthly: 81, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 166, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 67, dapLabel: "Check ECC" },
MP109: { monthly: 67, dapLabel: "Check ECC" },
MP139: { monthly: 53, dapLabel: "Check ECC" },
MP169: { monthly: 50, dapLabel: "Check ECC" },
MP199: { monthly: 47, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: '11" iPad Air (5th Gen)',
aliases: ["ipad", "ipadair11-5th"],
storages: [
{
storage: "256GB",
rrp: 3899,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 2985, dap: 240, totalUpfront: 3225 },
MP139: { devicePrice: 2841, dap: 360, totalUpfront: 3201 },
MP169: { devicePrice: 2697, dap: 480, totalUpfront: 3177 },
MP199: { devicePrice: 2553, dap: 600, totalUpfront: 3153 }
},
zero24: {
MP48: { monthly: 249, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 146, dapLabel: "Check ECC" },
MP109: { monthly: 146, dapLabel: "Check ECC" },
MP139: { monthly: 132, dapLabel: "Check ECC" },
MP169: { monthly: 129, dapLabel: "Check ECC" },
MP199: { monthly: 126, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 166, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 97, dapLabel: "Check ECC" },
MP109: { monthly: 97, dapLabel: "Check ECC" },
MP139: { monthly: 83, dapLabel: "Check ECC" },
MP169: { monthly: 80, dapLabel: "Check ECC" },
MP199: { monthly: 77, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: '13" iPad Air (2nd Gen)',
aliases: ["ipad", "ipadair13-2nd"],
storages: [
{
storage: "256GB",
rrp: 4799,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 3795, dap: 240, totalUpfront: 4035 },
MP139: { devicePrice: 3651, dap: 360, totalUpfront: 4011 },
MP169: { devicePrice: 3507, dap: 480, totalUpfront: 3987 },
MP199: { devicePrice: 3363, dap: 600, totalUpfront: 3963 }
},
zero24: {
MP48: { monthly: 249, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 179, dapLabel: "Check ECC" },
MP109: { monthly: 179, dapLabel: "Check ECC" },
MP139: { monthly: 166, dapLabel: "Check ECC" },
MP169: { monthly: 163, dapLabel: "Check ECC" },
MP199: { monthly: 160, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 166, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 119, dapLabel: "Check ECC" },
MP109: { monthly: 119, dapLabel: "Check ECC" },
MP139: { monthly: 106, dapLabel: "Check ECC" },
MP169: { monthly: 103, dapLabel: "Check ECC" },
MP199: { monthly: 100, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: '11" iPad Pro (6th Gen)',
aliases: ["ipad", "ipadpro11-6th"],
storages: [
{
storage: "256GB",
rrp: 5399,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 4335, dap: 360, totalUpfront: 4695 },
MP139: { devicePrice: 4191, dap: 480, totalUpfront: 4671 },
MP169: { devicePrice: 4047, dap: 600, totalUpfront: 4647 },
MP199: { devicePrice: 3903, dap: 720, totalUpfront: 4623 }
},
zero24: {
MP48: { monthly: 249, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 202, dapLabel: "Check ECC" },
MP109: { monthly: 202, dapLabel: "Check ECC" },
MP139: { monthly: 188, dapLabel: "Check ECC" },
MP169: { monthly: 185, dapLabel: "Check ECC" },
MP199: { monthly: 182, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 166, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 134, dapLabel: "Check ECC" },
MP109: { monthly: 134, dapLabel: "Check ECC" },
MP139: { monthly: 121, dapLabel: "Check ECC" },
MP169: { monthly: 118, dapLabel: "Check ECC" },
MP199: { monthly: 115, dapLabel: "Check ECC" }
}
}
}
},
{
storage: "512GB",
rrp: 6299,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 5145, dap: 360, totalUpfront: 5505 },
MP139: { devicePrice: 5001, dap: 480, totalUpfront: 5481 },
MP169: { devicePrice: 4857, dap: 600, totalUpfront: 5457 },
MP199: { devicePrice: 4713, dap: 720, totalUpfront: 5433 }
},
zero24: {
MP48: { monthly: 291, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 236, dapLabel: "Check ECC" },
MP109: { monthly: 236, dapLabel: "Check ECC" },
MP139: { monthly: 222, dapLabel: "Check ECC" },
MP169: { monthly: 219, dapLabel: "Check ECC" },
MP199: { monthly: 216, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 194, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 157, dapLabel: "Check ECC" },
MP109: { monthly: 157, dapLabel: "Check ECC" },
MP139: { monthly: 143, dapLabel: "Check ECC" },
MP169: { monthly: 140, dapLabel: "Check ECC" },
MP199: { monthly: 137, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: '13" iPad Pro (8th Gen)',
aliases: ["ipad", "ipadpro13-8th"],
storages: [
{
storage: "256GB",
rrp: 6699,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 5505, dap: 360, totalUpfront: 5865 },
MP139: { devicePrice: 5361, dap: 480, totalUpfront: 5841 },
MP169: { devicePrice: 5217, dap: 600, totalUpfront: 5817 },
MP199: { devicePrice: 5073, dap: 720, totalUpfront: 5793 }
},
zero24: {
MP48: { monthly: 249, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 251, dapLabel: "Check ECC" },
MP109: { monthly: 251, dapLabel: "Check ECC" },
MP139: { monthly: 237, dapLabel: "Check ECC" },
MP169: { monthly: 234, dapLabel: "Check ECC" },
MP199: { monthly: 231, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 166, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 167, dapLabel: "Check ECC" },
MP109: { monthly: 167, dapLabel: "Check ECC" },
MP139: { monthly: 153, dapLabel: "Check ECC" },
MP169: { monthly: 150, dapLabel: "Check ECC" },
MP199: { monthly: 147, dapLabel: "Check ECC" }
}
}
}
},
{
storage: "512GB",
rrp: 7599,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 6315, dap: 360, totalUpfront: 6675 },
MP139: { devicePrice: 6171, dap: 480, totalUpfront: 6651 },
MP169: { devicePrice: 6027, dap: 600, totalUpfront: 6627 },
MP199: { devicePrice: 5883, dap: 720, totalUpfront: 6603 }
},
zero24: {
MP48: { monthly: 291, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 284, dapLabel: "Check ECC" },
MP109: { monthly: 284, dapLabel: "Check ECC" },
MP139: { monthly: 271, dapLabel: "Check ECC" },
MP169: { monthly: 268, dapLabel: "Check ECC" },
MP199: { monthly: 265, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 194, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 189, dapLabel: "Check ECC" },
MP109: { monthly: 189, dapLabel: "Check ECC" },
MP139: { monthly: 176, dapLabel: "Check ECC" },
MP169: { monthly: 173, dapLabel: "Check ECC" },
MP199: { monthly: 170, dapLabel: "Check ECC" }
}
}
}
}
]
}
]
},
{
brand: "Google",
models: [
{
model: "Google Pixel 9a 5G",
aliases: ["google", "pixel9a"],
storages: [
{
storage: "Default",
rrp: 3199,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 2299, dap: 520, totalUpfront: 2819 },
MP139: { devicePrice: 1999, dap: 820, totalUpfront: 2819 },
MP169: { devicePrice: 1699, dap: 1100, totalUpfront: 2799 },
MP199: { devicePrice: 1399, dap: 1400, totalUpfront: 2799 }
},
zero24: {
MP48: { monthly: 133, dapLabel: "NA" },
MP69: { monthly: 130, dapLabel: "Check ECC" },
MP89: { monthly: 130, dapLabel: "Check ECC" },
MP99: { monthly: 125, dapLabel: "Check ECC" },
MP109: { monthly: 125, dapLabel: "Check ECC" },
MP139: { monthly: 115, dapLabel: "Check ECC" },
MP169: { monthly: 105, dapLabel: "Check ECC" },
MP199: { monthly: 95, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 88, dapLabel: "NA" },
MP69: { monthly: 85, dapLabel: "Check ECC" },
MP89: { monthly: 85, dapLabel: "Check ECC" },
MP99: { monthly: 80, dapLabel: "Check ECC" },
MP109: { monthly: 80, dapLabel: "Check ECC" },
MP139: { monthly: 75, dapLabel: "Check ECC" },
MP169: { monthly: 70, dapLabel: "Check ECC" },
MP199: { monthly: 60, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Google Pixel 10 5G",
aliases: ["google", "pixel10"],
storages: [
{
storage: "256GB",
rrp: 4499,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 3399, dap: 200, totalUpfront: 3599 },
MP139: { devicePrice: 3199, dap: 400, totalUpfront: 3599 },
MP169: { devicePrice: 2999, dap: 600, totalUpfront: 3599 },
MP199: { devicePrice: 2699, dap: 900, totalUpfront: 3599 }
},
zero24: {
MP48: { monthly: 187, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 160, dapLabel: "Check ECC" },
MP109: { monthly: 160, dapLabel: "Check ECC" },
MP139: { monthly: 155, dapLabel: "Check ECC" },
MP169: { monthly: 145, dapLabel: "Check ECC" },
MP199: { monthly: 125, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 124, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 105, dapLabel: "Check ECC" },
MP109: { monthly: 105, dapLabel: "Check ECC" },
MP139: { monthly: 100, dapLabel: "Check ECC" },
MP169: { monthly: 90, dapLabel: "Check ECC" },
MP199: { monthly: 70, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Google Pixel 10a 5G",
aliases: ["google", "pixel10a"],
storages: [
{
storage: "256GB",
rrp: 2799,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 1699, dap: 240, totalUpfront: 1939 },
MP139: { devicePrice: 1399, dap: 540, totalUpfront: 1939 },
MP169: { devicePrice: 999, dap: 940, totalUpfront: 1939 },
MP199: { devicePrice: 399, dap: 1540, totalUpfront: 1939 }
},
zero24: {
MP48: { monthly: 116, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 90, dapLabel: "Check ECC" },
MP109: { monthly: 90, dapLabel: "Check ECC" },
MP139: { monthly: 80, dapLabel: "Check ECC" },
MP169: { monthly: 65, dapLabel: "Check ECC" },
MP199: { monthly: 50, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 77, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 60, dapLabel: "Check ECC" },
MP109: { monthly: 60, dapLabel: "Check ECC" },
MP139: { monthly: 50, dapLabel: "Check ECC" },
MP169: { monthly: 40, dapLabel: "Check ECC" },
MP199: { monthly: 30, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Google Pixel 10 Pro 5G",
aliases: ["google", "pixel10pro"],
storages: [
{
storage: "256GB",
rrp: 5499,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 4399, dap: 120, totalUpfront: 4519 },
MP139: { devicePrice: 4199, dap: 320, totalUpfront: 4519 },
MP169: { devicePrice: 3899, dap: 600, totalUpfront: 4499 },
MP199: { devicePrice: 3599, dap: 900, totalUpfront: 4499 }
},
zero24: {
MP48: { monthly: 229, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 205, dapLabel: "Check ECC" },
MP109: { monthly: 205, dapLabel: "Check ECC" },
MP139: { monthly: 195, dapLabel: "Check ECC" },
MP169: { monthly: 185, dapLabel: "Check ECC" },
MP199: { monthly: 165, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 152, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 135, dapLabel: "Check ECC" },
MP109: { monthly: 135, dapLabel: "Check ECC" },
MP139: { monthly: 130, dapLabel: "Check ECC" },
MP169: { monthly: 120, dapLabel: "Check ECC" },
MP199: { monthly: 100, dapLabel: "Check ECC" }
}
}
}
},
{
storage: "512GB",
rrp: 6099,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 4899, dap: 160, totalUpfront: 5059 },
MP139: { devicePrice: 4699, dap: 360, totalUpfront: 5059 },
MP169: { devicePrice: 4399, dap: 640, totalUpfront: 5039 },
MP199: { devicePrice: 4099, dap: 940, totalUpfront: 5039 }
},
zero24: {
MP48: { monthly: 254, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 225, dapLabel: "Check ECC" },
MP109: { monthly: 225, dapLabel: "Check ECC" },
MP139: { monthly: 215, dapLabel: "Check ECC" },
MP169: { monthly: 200, dapLabel: "Check ECC" },
MP199: { monthly: 185, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 169, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 150, dapLabel: "Check ECC" },
MP109: { monthly: 150, dapLabel: "Check ECC" },
MP139: { monthly: 140, dapLabel: "Check ECC" },
MP169: { monthly: 130, dapLabel: "Check ECC" },
MP199: { monthly: 115, dapLabel: "Check ECC" }
}
}
}
},
{
storage: "1TB",
rrp: 7299,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 5999, dap: 240, totalUpfront: 6239 },
MP139: { devicePrice: 5799, dap: 420, totalUpfront: 6219 },
MP169: { devicePrice: 5599, dap: 600, totalUpfront: 6199 },
MP199: { devicePrice: 5299, dap: 900, totalUpfront: 6199 }
},
zero24: {
MP48: { monthly: 304, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 250, dapLabel: "Check ECC" },
MP109: { monthly: 250, dapLabel: "Check ECC" },
MP139: { monthly: 240, dapLabel: "Check ECC" },
MP169: { monthly: 220, dapLabel: "Check ECC" },
MP199: { monthly: 210, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 202, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 165, dapLabel: "Check ECC" },
MP109: { monthly: 165, dapLabel: "Check ECC" },
MP139: { monthly: 155, dapLabel: "Check ECC" },
MP169: { monthly: 145, dapLabel: "Check ECC" },
MP199: { monthly: 130, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Google Pixel 10 Pro XL 5G",
aliases: ["google", "pixel10proxl"],
storages: [
{
storage: "256GB",
rrp: 5999,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 4699, dap: 120, totalUpfront: 4819 },
MP139: { devicePrice: 4499, dap: 320, totalUpfront: 4819 },
MP169: { devicePrice: 4199, dap: 600, totalUpfront: 4799 },
MP199: { devicePrice: 3899, dap: 900, totalUpfront: 4799 }
},
zero24: {
MP48: { monthly: 249, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 225, dapLabel: "Check ECC" },
MP109: { monthly: 225, dapLabel: "Check ECC" },
MP139: { monthly: 215, dapLabel: "Check ECC" },
MP169: { monthly: 200, dapLabel: "Check ECC" },
MP199: { monthly: 185, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 166, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 155, dapLabel: "Check ECC" },
MP109: { monthly: 155, dapLabel: "Check ECC" },
MP139: { monthly: 145, dapLabel: "Check ECC" },
MP169: { monthly: 135, dapLabel: "Check ECC" },
MP199: { monthly: 115, dapLabel: "Check ECC" }
}
}
}
},
{
storage: "512GB",
rrp: 6599,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 5399, dap: 120, totalUpfront: 5519 },
MP139: { devicePrice: 5199, dap: 320, totalUpfront: 5519 },
MP169: { devicePrice: 4899, dap: 600, totalUpfront: 5499 },
MP199: { devicePrice: 4599, dap: 900, totalUpfront: 5499 }
},
zero24: {
MP48: { monthly: 274, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 245, dapLabel: "Check ECC" },
MP109: { monthly: 245, dapLabel: "Check ECC" },
MP139: { monthly: 230, dapLabel: "Check ECC" },
MP169: { monthly: 215, dapLabel: "Check ECC" },
MP199: { monthly: 200, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 183, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 160, dapLabel: "Check ECC" },
MP109: { monthly: 160, dapLabel: "Check ECC" },
MP139: { monthly: 150, dapLabel: "Check ECC" },
MP169: { monthly: 140, dapLabel: "Check ECC" },
MP199: { monthly: 125, dapLabel: "Check ECC" }
}
}
}
},
{
storage: "1TB",
rrp: 7799,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 6399, dap: 120, totalUpfront: 6519 },
MP139: { devicePrice: 6199, dap: 320, totalUpfront: 6519 },
MP169: { devicePrice: 5899, dap: 620, totalUpfront: 6519 },
MP199: { devicePrice: 5599, dap: 920, totalUpfront: 6519 }
},
zero24: {
MP48: { monthly: 324, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 270, dapLabel: "Check ECC" },
MP109: { monthly: 270, dapLabel: "Check ECC" },
MP139: { monthly: 260, dapLabel: "Check ECC" },
MP169: { monthly: 250, dapLabel: "Check ECC" },
MP199: { monthly: 230, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 216, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 180, dapLabel: "Check ECC" },
MP109: { monthly: 180, dapLabel: "Check ECC" },
MP139: { monthly: 170, dapLabel: "Check ECC" },
MP169: { monthly: 160, dapLabel: "Check ECC" },
MP199: { monthly: 145, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Google Pixel 10 Pro Fold 5G",
aliases: ["google", "pixel10profold"],
storages: [
{
storage: "512GB",
rrp: 8599,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 6899, dap: 120, totalUpfront: 7019 },
MP139: { devicePrice: 6699, dap: 320, totalUpfront: 7019 },
MP169: { devicePrice: 6399, dap: 600, totalUpfront: 6999 },
MP199: { devicePrice: 6099, dap: 900, totalUpfront: 6999 }
},
zero24: {
MP48: { monthly: 358, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 315, dapLabel: "Check ECC" },
MP109: { monthly: 315, dapLabel: "Check ECC" },
MP139: { monthly: 300, dapLabel: "Check ECC" },
MP169: { monthly: 290, dapLabel: "Check ECC" },
MP199: { monthly: 280, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 238, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 215, dapLabel: "Check ECC" },
MP109: { monthly: 215, dapLabel: "Check ECC" },
MP139: { monthly: 205, dapLabel: "Check ECC" },
MP169: { monthly: 195, dapLabel: "Check ECC" },
MP199: { monthly: 185, dapLabel: "Check ECC" }
}
}
}
}
]
}
]
},
{
brand: "Honor",
models: [
{
model: "Honor 400 Lite 5G",
aliases: ["honor", "honor400lite"],
storages: [
{
storage: "Default",
rrp: 1299,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: 269, dap: 240, totalUpfront: 509 },
MP89: { devicePrice: 269, dap: 240, totalUpfront: 509 },
MP99: { devicePrice: 0, dap: 500, totalUpfront: 500 },
MP109: { devicePrice: 0, dap: 500, totalUpfront: 500 },
MP139: { devicePrice: 0, dap: 500, totalUpfront: 500 },
MP169: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP199: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" }
},
zero24: {
MP48: { monthly: 54, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: "NA", dapLabel: "Check ECC" },
MP109: { monthly: "NA", dapLabel: "Check ECC" },
MP139: { monthly: "NA", dapLabel: "Check ECC" },
MP169: { monthly: "NA", dapLabel: "Check ECC" },
MP199: { monthly: "NA", dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: "NA", dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: "NA", dapLabel: "Check ECC" },
MP109: { monthly: "NA", dapLabel: "Check ECC" },
MP139: { monthly: "NA", dapLabel: "Check ECC" },
MP169: { monthly: "NA", dapLabel: "Check ECC" },
MP199: { monthly: "NA", dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Honor 600 Lite 5G",
aliases: ["honor", "honor600lite"],
storages: [
{
storage: "256GB",
rrp: 1399,
      promo: "Price down — RM299 with MP89. Free on MP139.",
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: 399, dap: 60, totalUpfront: 459 },
MP89: { devicePrice: 299, dap: 160, totalUpfront: 459 },
MP99: { devicePrice: 99, dap: 360, totalUpfront: 459 },
MP109: { devicePrice: 99, dap: 360, totalUpfront: 459 },
MP139: { devicePrice: 0, dap: 460, totalUpfront: 460 },
MP169: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP199: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" }
},
zero24: {
MP48: { monthly: 58, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: "NA", dapLabel: "Check ECC" },
MP109: { monthly: "NA", dapLabel: "Check ECC" },
MP139: { monthly: "NA", dapLabel: "Check ECC" },
MP169: { monthly: "NA", dapLabel: "Check ECC" },
MP199: { monthly: "NA", dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: "NA", dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: "NA", dapLabel: "Check ECC" },
MP109: { monthly: "NA", dapLabel: "Check ECC" },
MP139: { monthly: "NA", dapLabel: "Check ECC" },
MP169: { monthly: "NA", dapLabel: "Check ECC" },
MP199: { monthly: "NA", dapLabel: "Check ECC" }
}
},
HOTLINK: {
hotlink12: {
HP75: { devicePrice: 699, dap: 0, totalUpfront: 699, monthly: 75 }
},
hotlink24: {
HP75: { devicePrice: 399, dap: 60, totalUpfront: 459, monthly: 72.50 }
}
}
}
}
]
},
{
model: "Honor 400 5G",
aliases: ["honor", "honor400"],
storages: [
{
storage: "512GB",
rrp: 1799,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 799, dap: 480, totalUpfront: 1279 },
MP109: { devicePrice: 799, dap: 480, totalUpfront: 1279 },
MP139: { devicePrice: 299, dap: 960, totalUpfront: 1259 },
MP169: { devicePrice: 0, dap: 1250, totalUpfront: 1250 },
MP199: { devicePrice: 0, dap: 1250, totalUpfront: 1250 }
},
zero24: {
MP48: { monthly: "NA", dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 70, dapLabel: "Check ECC" },
MP109: { monthly: 70, dapLabel: "Check ECC" },
MP139: { monthly: 60, dapLabel: "Check ECC" },
MP169: { monthly: 45, dapLabel: "Check ECC" },
MP199: { monthly: 30, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 49, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 45, dapLabel: "Check ECC" },
MP109: { monthly: 45, dapLabel: "Check ECC" },
MP139: { monthly: 35, dapLabel: "Check ECC" },
MP169: { monthly: 30, dapLabel: "Check ECC" },
MP199: { monthly: 20, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Honor 400 Pro 5G",
aliases: ["honor", "honor400pro"],
storages: [
{
storage: "512GB",
rrp: 2399,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 1199, dap: 420, totalUpfront: 1619 },
MP109: { devicePrice: 1199, dap: 420, totalUpfront: 1619 },
MP139: { devicePrice: 699, dap: 900, totalUpfront: 1599 },
MP169: { devicePrice: 199, dap: 1400, totalUpfront: 1599 },
MP199: { devicePrice: 0, dap: 1600, totalUpfront: 1600 }
},
zero24: {
MP48: { monthly: 99, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 90, dapLabel: "Check ECC" },
MP109: { monthly: 90, dapLabel: "Check ECC" },
MP139: { monthly: 80, dapLabel: "Check ECC" },
MP169: { monthly: 70, dapLabel: "Check ECC" },
MP199: { monthly: 50, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 66, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 60, dapLabel: "Check ECC" },
MP109: { monthly: 60, dapLabel: "Check ECC" },
MP139: { monthly: 55, dapLabel: "Check ECC" },
MP169: { monthly: 45, dapLabel: "Check ECC" },
MP199: { monthly: 30, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Honor Magic V5 5G",
aliases: ["honor", "magicv5"],
storages: [
{
storage: "Default",
rrp: 5999,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 4899, dap: 160, totalUpfront: 5059 },
MP139: { devicePrice: 4699, dap: 360, totalUpfront: 5059 },
MP169: { devicePrice: 4499, dap: 540, totalUpfront: 5039 },
MP199: { devicePrice: 4199, dap: 840, totalUpfront: 5039 }
},
zero24: {
MP48: { monthly: 249, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 240, dapLabel: "Check ECC" },
MP109: { monthly: 240, dapLabel: "Check ECC" },
MP139: { monthly: 225, dapLabel: "Check ECC" },
MP169: { monthly: 210, dapLabel: "Check ECC" },
MP199: { monthly: 195, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 166, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 160, dapLabel: "Check ECC" },
MP109: { monthly: 160, dapLabel: "Check ECC" },
MP139: { monthly: 150, dapLabel: "Check ECC" },
MP169: { monthly: 140, dapLabel: "Check ECC" },
MP199: { monthly: 120, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Honor Magic7 Pro 5G",
aliases: ["honor", "magic7pro"],
storages: [
{
storage: "Default",
rrp: 5199,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 2899, dap: 640, totalUpfront: 3539 },
MP139: { devicePrice: 2699, dap: 840, totalUpfront: 3539 },
MP169: { devicePrice: 2499, dap: 1040, totalUpfront: 3539 },
MP199: { devicePrice: 2199, dap: 1340, totalUpfront: 3539 }
},
zero24: {
MP48: { monthly: "NA", dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: "NA", dapLabel: "Check ECC" },
MP109: { monthly: "NA", dapLabel: "Check ECC" },
MP139: { monthly: "NA", dapLabel: "Check ECC" },
MP169: { monthly: "NA", dapLabel: "Check ECC" },
MP199: { monthly: "NA", dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: "NA", dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: "NA", dapLabel: "Check ECC" },
MP109: { monthly: "NA", dapLabel: "Check ECC" },
MP139: { monthly: "NA", dapLabel: "Check ECC" },
MP169: { monthly: "NA", dapLabel: "Check ECC" },
MP199: { monthly: "NA", dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Honor Magic8 Pro 5G",
aliases: ["honor", "magic8pro"],
storages: [
{
storage: "Default",
rrp: 5199,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 3399, dap: 160, totalUpfront: 3559 },
MP139: { devicePrice: 3199, dap: 360, totalUpfront: 3559 },
MP169: { devicePrice: 2899, dap: 660, totalUpfront: 3559 },
MP199: { devicePrice: 2599, dap: 960, totalUpfront: 3559 }
},
zero24: {
MP48: { monthly: 216, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 160, dapLabel: "Check ECC" },
MP109: { monthly: 160, dapLabel: "Check ECC" },
MP139: { monthly: 150, dapLabel: "Check ECC" },
MP169: { monthly: 140, dapLabel: "Check ECC" },
MP199: { monthly: 125, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 144, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 110, dapLabel: "Check ECC" },
MP109: { monthly: 110, dapLabel: "Check ECC" },
MP139: { monthly: 100, dapLabel: "Check ECC" },
MP169: { monthly: 90, dapLabel: "Check ECC" },
MP199: { monthly: 75, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Honor X9d 5G",
aliases: ["honor", "x9d"],
storages: [
{
storage: "512GB",
rrp: 1699,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 199, dap: 360, totalUpfront: 559 },
MP109: { devicePrice: 199, dap: 360, totalUpfront: 559 },
MP139: { devicePrice: 0, dap: 520, totalUpfront: 520 },
MP169: { devicePrice: 0, dap: 520, totalUpfront: 520 },
MP199: { devicePrice: 0, dap: 520, totalUpfront: 520 }
},
zero24: {
MP48: { monthly: 70, dapLabel: "NA" },
MP69: { monthly: 60, dapLabel: "Check ECC" },
MP89: { monthly: 60, dapLabel: "Check ECC" },
MP99: { monthly: 50, dapLabel: "Check ECC" },
MP109: { monthly: 50, dapLabel: "Check ECC" },
MP139: { monthly: 40, dapLabel: "Check ECC" },
MP169: { monthly: 30, dapLabel: "Check ECC" },
MP199: { monthly: 10, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 47, dapLabel: "NA" },
MP69: { monthly: 40, dapLabel: "Check ECC" },
MP89: { monthly: 40, dapLabel: "Check ECC" },
MP99: { monthly: 35, dapLabel: "Check ECC" },
MP109: { monthly: 35, dapLabel: "Check ECC" },
MP139: { monthly: 25, dapLabel: "Check ECC" },
MP169: { monthly: 20, dapLabel: "Check ECC" },
MP199: { monthly: 5, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Honor Pad 10 5G",
aliases: ["honor", "pad10"],
storages: [
{
storage: "Default",
rrp: 1799,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 699, dap: 540, totalUpfront: 1239 },
MP109: { devicePrice: 699, dap: 540, totalUpfront: 1239 },
MP139: { devicePrice: 399, dap: 840, totalUpfront: 1239 },
MP169: { devicePrice: 0, dap: 1200, totalUpfront: 1200 },
MP199: { devicePrice: 0, dap: 1200, totalUpfront: 1200 }
},
zero24: {
MP48: { monthly: 74, dapLabel: "NA" },
MP69: { monthly: 70, dapLabel: "Check ECC" },
MP89: { monthly: 70, dapLabel: "Check ECC" },
MP99: { monthly: 65, dapLabel: "Check ECC" },
MP109: { monthly: 65, dapLabel: "Check ECC" },
MP139: { monthly: 60, dapLabel: "Check ECC" },
MP169: { monthly: 50, dapLabel: "Check ECC" },
MP199: { monthly: 30, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 49, dapLabel: "NA" },
MP69: { monthly: 45, dapLabel: "Check ECC" },
MP89: { monthly: 45, dapLabel: "Check ECC" },
MP99: { monthly: 40, dapLabel: "Check ECC" },
MP109: { monthly: 40, dapLabel: "Check ECC" },
MP139: { monthly: 35, dapLabel: "Check ECC" },
MP169: { monthly: 30, dapLabel: "Check ECC" },
MP199: { monthly: 15, dapLabel: "Check ECC" }
}
}
}
}
]
}
]
},
{
brand: "Huawei",
models: [
{
model: "Huawei Pura 80 Pro",
aliases: ["huawei", "pura80pro"],
storages: [
{
storage: "Default",
rrp: 4599,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 2899, dap: 240, totalUpfront: 3139 },
MP139: { devicePrice: 2699, dap: 440, totalUpfront: 3139 },
MP169: { devicePrice: 2499, dap: 600, totalUpfront: 3099 },
MP199: { devicePrice: 2199, dap: 900, totalUpfront: 3099 }
},
zero24: {
MP48: { monthly: 191, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: "NA", dapLabel: "Check ECC" },
MP109: { monthly: 145, dapLabel: "Check ECC" },
MP139: { monthly: 145, dapLabel: "Check ECC" },
MP169: { monthly: 120, dapLabel: "Check ECC" },
MP199: { monthly: 100, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 127, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: "NA", dapLabel: "Check ECC" },
MP109: { monthly: 100, dapLabel: "Check ECC" },
MP139: { monthly: 90, dapLabel: "Check ECC" },
MP169: { monthly: 80, dapLabel: "Check ECC" },
MP199: { monthly: 60, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Huawei Mate 80 Pro",
aliases: ["huawei", "mate80pro"],
storages: [
{
storage: "Default",
rrp: 3999,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 2699, dap: 120, totalUpfront: 2819 },
MP139: { devicePrice: 2499, dap: 320, totalUpfront: 2819 },
MP169: { devicePrice: 2199, dap: 620, totalUpfront: 2819 },
MP199: { devicePrice: 1999, dap: 820, totalUpfront: 2819 }
},
zero24: {
MP48: { monthly: 166, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: "NA", dapLabel: "Check ECC" },
MP109: { monthly: 130, dapLabel: "Check ECC" },
MP139: { monthly: 130, dapLabel: "Check ECC" },
MP169: { monthly: 110, dapLabel: "Check ECC" },
MP199: { monthly: 90, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 111, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: "NA", dapLabel: "Check ECC" },
MP109: { monthly: 90, dapLabel: "Check ECC" },
MP139: { monthly: 80, dapLabel: "Check ECC" },
MP169: { monthly: 70, dapLabel: "Check ECC" },
MP199: { monthly: 55, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Huawei Mate X7",
aliases: ["huawei", "matex7"],
storages: [
{
storage: "Default",
rrp: 8688,
promo: "Gift: Freebuds 7i worth RM329 (while stocks last). Use Bundle B ID.",
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 6399, dap: 200, totalUpfront: 6599 },
MP139: { devicePrice: 6199, dap: 400, totalUpfront: 6599 },
MP169: { devicePrice: 5999, dap: 600, totalUpfront: 6599 },
MP199: { devicePrice: 5699, dap: 900, totalUpfront: 6599 }
},
zero24: {
MP48: { monthly: 362, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: "NA", dapLabel: "Check ECC" },
MP109: { monthly: 305, dapLabel: "Check ECC" },
MP139: { monthly: 295, dapLabel: "Check ECC" },
MP169: { monthly: 280, dapLabel: "Check ECC" },
MP199: { monthly: 260, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 241, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: "NA", dapLabel: "Check ECC" },
MP109: { monthly: 210, dapLabel: "Check ECC" },
MP139: { monthly: 200, dapLabel: "Check ECC" },
MP169: { monthly: 190, dapLabel: "Check ECC" },
MP199: { monthly: 170, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Huawei Mate XT",
aliases: ["huawei", "matext"],
storages: [
{
storage: "Default",
rrp: 14999,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 11499, dap: 180, totalUpfront: 11679 },
MP139: { devicePrice: 11299, dap: 360, totalUpfront: 11659 },
MP169: { devicePrice: 10999, dap: 660, totalUpfront: 11659 },
MP199: { devicePrice: 10699, dap: 960, totalUpfront: 11659 }
},
zero24: {
MP48: { monthly: 624, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: "NA", dapLabel: "Check ECC" },
MP109: { monthly: 569, dapLabel: "Check ECC" },
MP139: { monthly: 569, dapLabel: "Check ECC" },
MP169: { monthly: 549, dapLabel: "Check ECC" },
MP199: { monthly: 529, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 416, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: "NA", dapLabel: "Check ECC" },
MP109: { monthly: 409, dapLabel: "Check ECC" },
MP139: { monthly: 399, dapLabel: "Check ECC" },
MP169: { monthly: 389, dapLabel: "Check ECC" },
MP199: { monthly: 369, dapLabel: "Check ECC" }
}
}
}
}
]
}
]
},
{
brand: "Nubia",
models: [
{
model: "Nubia Neo 3 GT 5G",
aliases: ["nubia", "neo3gt"],
storages: [
{
storage: "Default",
rrp: 1199,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: 299, dap: 100, totalUpfront: 399 },
MP89: { devicePrice: 299, dap: 100, totalUpfront: 399 },
MP99: { devicePrice: 0, dap: 360, totalUpfront: 360 },
MP109: { devicePrice: 0, dap: 360, totalUpfront: 360 },
MP139: { devicePrice: 0, dap: 360, totalUpfront: 360 },
MP169: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP199: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" }
},
zero24: {
MP48: { monthly: 49, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "NA" },
MP89: { monthly: "NA", dapLabel: "NA" },
MP99: { monthly: "NA", dapLabel: "NA" },
MP109: { monthly: "NA", dapLabel: "NA" },
MP139: { monthly: "NA", dapLabel: "NA" },
MP169: { monthly: "NA", dapLabel: "NA" },
MP199: { monthly: "NA", dapLabel: "NA" }
},
zero36: {
MP48: { monthly: "NA", dapLabel: "NA" },
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
}
]
}
]
},
{
brand: "Oppo",
models: [
{
model: "Oppo A6t 5G",
aliases: ["oppo", "a6t"],
storages: [{
storage: "4+256GB",
rrp: 1099,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: 99, dap: 180, totalUpfront: 279 },
MP89: { devicePrice: 49, dap: 200, totalUpfront: 249 },
MP99: { devicePrice: 0, dap: 240, totalUpfront: 240 },
MP109: { devicePrice: 0, dap: 240, totalUpfront: 240 },
MP139: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP169: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP199: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" }
},
zero24: {
MP48: { monthly: 45, dapLabel: "NA" },
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
{
model: "Oppo Reno 15F 5G",
aliases: ["oppo", "reno15f"],
storages: [
{
storage: "Default",
rrp: 1599,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 499, dap: 240, totalUpfront: 739 },
MP109: { devicePrice: 499, dap: 240, totalUpfront: 739 },
MP139: { devicePrice: 0, dap: 720, totalUpfront: 720 },
MP169: { devicePrice: 0, dap: 720, totalUpfront: 720 },
MP199: { devicePrice: 0, dap: 720, totalUpfront: 720 }
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
}
]
},
{
model: "Oppo Reno 15 5G",
aliases: ["oppo", "reno15"],
storages: [
{
storage: "Default",
rrp: 2399,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 1099, dap: 320, totalUpfront: 1419 },
MP109: { devicePrice: 1099, dap: 320, totalUpfront: 1419 },
MP139: { devicePrice: 599, dap: 820, totalUpfront: 1419 },
MP169: { devicePrice: 199, dap: 1220, totalUpfront: 1419 },
MP199: { devicePrice: 0, dap: 1400, totalUpfront: 1400 }
},
zero24: {
MP48: { monthly: 99, dapLabel: "NA" },
MP69: { monthly: 85, dapLabel: "Check ECC" },
MP89: { monthly: 85, dapLabel: "Check ECC" },
MP99: { monthly: 75, dapLabel: "Check ECC" },
MP109: { monthly: 75, dapLabel: "Check ECC" },
MP139: { monthly: 65, dapLabel: "Check ECC" },
MP169: { monthly: 55, dapLabel: "Check ECC" },
MP199: { monthly: 40, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 66, dapLabel: "NA" },
MP69: { monthly: 55, dapLabel: "Check ECC" },
MP89: { monthly: 55, dapLabel: "Check ECC" },
MP99: { monthly: 50, dapLabel: "Check ECC" },
MP109: { monthly: 50, dapLabel: "Check ECC" },
MP139: { monthly: 45, dapLabel: "Check ECC" },
MP169: { monthly: 35, dapLabel: "Check ECC" },
MP199: { monthly: 25, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Oppo Reno 15 Pro 5G",
aliases: ["oppo", "reno15pro"],
storages: [
{
storage: "Default",
rrp: 2999,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 1599, dap: 300, totalUpfront: 1899 },
MP109: { devicePrice: 1599, dap: 300, totalUpfront: 1899 },
MP139: { devicePrice: 1099, dap: 800, totalUpfront: 1899 },
MP169: { devicePrice: 699, dap: 1200, totalUpfront: 1899 },
MP199: { devicePrice: 199, dap: 1700, totalUpfront: 1899 }
},
zero24: {
MP48: { monthly: 124, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 90, dapLabel: "Check ECC" },
MP109: { monthly: 90, dapLabel: "Check ECC" },
MP139: { monthly: 80, dapLabel: "Check ECC" },
MP169: { monthly: 70, dapLabel: "Check ECC" },
MP199: { monthly: 55, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 83, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 60, dapLabel: "Check ECC" },
MP109: { monthly: 60, dapLabel: "Check ECC" },
MP139: { monthly: 55, dapLabel: "Check ECC" },
MP169: { monthly: 45, dapLabel: "Check ECC" },
MP199: { monthly: 35, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Oppo Find N6 5G",
aliases: ["oppo", "findn6"],
storages: [
{
storage: "Default",
rrp: 8699,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 6999, dap: 0, totalUpfront: 6999 },
MP139: { devicePrice: 6799, dap: 120, totalUpfront: 6919 },
MP169: { devicePrice: 6499, dap: 420, totalUpfront: 6919 },
MP199: { devicePrice: 6199, dap: 720, totalUpfront: 6919 }
},
zero24: {
MP48: { monthly: 362, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 330, dapLabel: "Check ECC" },
MP109: { monthly: 330, dapLabel: "Check ECC" },
MP139: { monthly: 320, dapLabel: "Check ECC" },
MP169: { monthly: 310, dapLabel: "Check ECC" },
MP199: { monthly: 290, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 241, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 230, dapLabel: "Check ECC" },
MP109: { monthly: 230, dapLabel: "Check ECC" },
MP139: { monthly: 220, dapLabel: "Check ECC" },
MP169: { monthly: 210, dapLabel: "Check ECC" },
MP199: { monthly: 190, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Oppo Find X9 5G",
aliases: ["oppo", "findx9"],
storages: [
{
storage: "Default",
rrp: 3699,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 2699, dap: 0, totalUpfront: 2699 },
MP109: { devicePrice: 2699, dap: 0, totalUpfront: 2699 },
MP139: { devicePrice: 1899, dap: 720, totalUpfront: 2619 },
MP169: { devicePrice: 1399, dap: 1220, totalUpfront: 2619 },
MP199: { devicePrice: 999, dap: 1620, totalUpfront: 2619 }
},
zero24: {
MP48: { monthly: 154, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 135, dapLabel: "Check ECC" },
MP109: { monthly: 135, dapLabel: "Check ECC" },
MP139: { monthly: 120, dapLabel: "Check ECC" },
MP169: { monthly: 110, dapLabel: "Check ECC" },
MP199: { monthly: 90, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 102, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 90, dapLabel: "Check ECC" },
MP109: { monthly: 90, dapLabel: "Check ECC" },
MP139: { monthly: 80, dapLabel: "Check ECC" },
MP169: { monthly: 70, dapLabel: "Check ECC" },
MP199: { monthly: 55, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Oppo Find X9 Pro 5G",
aliases: ["oppo", "findx9pro"],
storages: [
{
storage: "Default",
rrp: 5099,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 3599, dap: 0, totalUpfront: 3599 },
MP139: { devicePrice: 3399, dap: 180, totalUpfront: 3579 },
MP169: { devicePrice: 3199, dap: 360, totalUpfront: 3559 },
MP199: { devicePrice: 2899, dap: 640, totalUpfront: 3539 }
},
zero24: {
MP48: { monthly: 212, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 175, dapLabel: "Check ECC" },
MP109: { monthly: 175, dapLabel: "Check ECC" },
MP139: { monthly: 165, dapLabel: "Check ECC" },
MP169: { monthly: 150, dapLabel: "Check ECC" },
MP199: { monthly: 130, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 141, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 120, dapLabel: "Check ECC" },
MP109: { monthly: 120, dapLabel: "Check ECC" },
MP139: { monthly: 110, dapLabel: "Check ECC" },
MP169: { monthly: 100, dapLabel: "Check ECC" },
MP199: { monthly: 80, dapLabel: "Check ECC" }
}
}
}
}
]
}
]
},
{
brand: "Realme",
models: [
{
model: "Realme 14 5G",
aliases: ["realme", "14"],
storages: [
{
storage: "Default",
rrp: 1199,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: 0, dap: 0, totalUpfront: 0 },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP139: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP169: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP199: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" }
},
zero24: {
MP48: { monthly: 49, dapLabel: "NA" },
MP69: { monthly: 49, dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "NA" },
MP99: { monthly: 7, dapLabel: "Check ECC" },
MP109: { monthly: "NA", dapLabel: "NA" },
MP139: { monthly: "NA", dapLabel: "NA" },
MP169: { monthly: "NA", dapLabel: "NA" },
MP199: { monthly: "NA", dapLabel: "NA" }
},
zero36: {
MP48: { monthly: "NA", dapLabel: "NA" },
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
}
]
},
{
model: "Realme 15 Pro 5G",
aliases: ["realme", "15pro"],
storages: [
{
storage: "Default",
rrp: 2099,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 799, dap: 180, totalUpfront: 979 },
MP109: { devicePrice: 799, dap: 180, totalUpfront: 979 },
MP139: { devicePrice: 199, dap: 780, totalUpfront: 979 },
MP169: { devicePrice: 0, dap: 960, totalUpfront: 960 },
MP199: { devicePrice: 0, dap: 960, totalUpfront: 960 }
},
zero24: {
MP48: { monthly: 87, dapLabel: "NA" },
MP69: { monthly: 80, dapLabel: "Check ECC" },
MP89: { monthly: 80, dapLabel: "Check ECC" },
MP99: { monthly: 75, dapLabel: "Check ECC" },
MP109: { monthly: 75, dapLabel: "Check ECC" },
MP139: { monthly: 65, dapLabel: "Check ECC" },
MP169: { monthly: 55, dapLabel: "Check ECC" },
MP199: { monthly: 35, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 58, dapLabel: "NA" },
MP69: { monthly: 55, dapLabel: "Check ECC" },
MP89: { monthly: 55, dapLabel: "Check ECC" },
MP99: { monthly: 50, dapLabel: "Check ECC" },
MP109: { monthly: 50, dapLabel: "Check ECC" },
MP139: { monthly: 45, dapLabel: "Check ECC" },
MP169: { monthly: 35, dapLabel: "Check ECC" },
MP199: { monthly: 20, dapLabel: "Check ECC" }
}
}
}
}
]
}
]
},
{
brand: "Redmagic",
models: [
{
model: "Redmagic 10 Pro 5G",
aliases: ["redmagic", "10pro"],
storages: [
{
storage: "Default",
rrp: 3899,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 2799, dap: 120, totalUpfront: 2919 },
MP139: { devicePrice: 2599, dap: 300, totalUpfront: 2899 },
MP169: { devicePrice: 2299, dap: 600, totalUpfront: 2899 },
MP199: { devicePrice: 1999, dap: 900, totalUpfront: 2899 }
},
zero24: {
MP48: { monthly: "NA", dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "NA" },
MP89: { monthly: "NA", dapLabel: "NA" },
MP99: { monthly: "NA", dapLabel: "NA" },
MP109: { monthly: "NA", dapLabel: "NA" },
MP139: { monthly: "NA", dapLabel: "NA" },
MP169: { monthly: "NA", dapLabel: "NA" },
MP199: { monthly: "NA", dapLabel: "NA" }
},
zero36: {
MP48: { monthly: "NA", dapLabel: "NA" },
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
}
]
}
]
},
{
brand: "Samsung",
models: [
{
model: "Samsung Galaxy A07 5G",
aliases: ["samsung", "a07", "a075g"],
storages: [{
storage: "8+256GB",
rrp: 949,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: 0, dap: 200, totalUpfront: 200 },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP139: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP169: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP199: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" }
}
}
}
}]
},
{
model: "Galaxy A26 5G",
aliases: ["samsung", "a26"],
storages: [
{
storage: "Default",
rrp: 1399,
      promo: "RM199 with MP89. Free from MP99.",
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: 299, dap: 60, totalUpfront: 359 },
MP89: { devicePrice: 199, dap: 160, totalUpfront: 359 },
MP99: { devicePrice: 0, dap: 360, totalUpfront: 360 },
MP109: { devicePrice: 0, dap: 360, totalUpfront: 360 },
MP139: { devicePrice: 0, dap: 360, totalUpfront: 360 },
MP169: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP199: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" }
},
zero24: {
MP48: { monthly: 58, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: "NA", dapLabel: "Check ECC" },
MP109: { monthly: "NA", dapLabel: "Check ECC" },
MP139: { monthly: "NA", dapLabel: "Check ECC" },
MP169: { monthly: "NA", dapLabel: "Check ECC" },
MP199: { monthly: "NA", dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: "NA", dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: "NA", dapLabel: "Check ECC" },
MP109: { monthly: "NA", dapLabel: "Check ECC" },
MP139: { monthly: "NA", dapLabel: "Check ECC" },
MP169: { monthly: "NA", dapLabel: "Check ECC" },
MP199: { monthly: "NA", dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Galaxy A56 5G",
aliases: ["samsung", "a56"],
storages: [
{
storage: "Default",
rrp: 2199,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 599, dap: 320, totalUpfront: 919 },
MP109: { devicePrice: 599, dap: 320, totalUpfront: 919 },
MP139: { devicePrice: 99, dap: 800, totalUpfront: 899 },
MP169: { devicePrice: 0, dap: 900, totalUpfront: 900 },
MP199: { devicePrice: 0, dap: 900, totalUpfront: 900 }
},
zero24: {
MP48: { monthly: 91, dapLabel: "NA" },
MP69: { monthly: 70, dapLabel: "Check ECC" },
MP89: { monthly: 70, dapLabel: "Check ECC" },
MP99: { monthly: 60, dapLabel: "Check ECC" },
MP109: { monthly: 60, dapLabel: "Check ECC" },
MP139: { monthly: 50, dapLabel: "Check ECC" },
MP169: { monthly: 40, dapLabel: "Check ECC" },
MP199: { monthly: 25, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 61, dapLabel: "NA" },
MP69: { monthly: 45, dapLabel: "Check ECC" },
MP89: { monthly: 45, dapLabel: "Check ECC" },
MP99: { monthly: 40, dapLabel: "Check ECC" },
MP109: { monthly: 40, dapLabel: "Check ECC" },
MP139: { monthly: 35, dapLabel: "Check ECC" },
MP169: { monthly: 25, dapLabel: "Check ECC" },
MP199: { monthly: 15, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Galaxy S25 FE 5G",
aliases: ["samsung", "s25fe"],
storages: [
{
storage: "Default",
rrp: 3099,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 1199, dap: 240, totalUpfront: 1439 },
MP109: { devicePrice: 1199, dap: 240, totalUpfront: 1439 },
MP139: { devicePrice: 699, dap: 740, totalUpfront: 1439 },
MP169: { devicePrice: 199, dap: 1240, totalUpfront: 1439 },
MP199: { devicePrice: 0, dap: 1440, totalUpfront: 1440 }
},
zero24: {
MP48: { monthly: 129, dapLabel: "NA" },
MP69: { monthly: 90, dapLabel: "Check ECC" },
MP89: { monthly: 90, dapLabel: "Check ECC" },
MP99: { monthly: 80, dapLabel: "Check ECC" },
MP109: { monthly: 80, dapLabel: "Check ECC" },
MP139: { monthly: 70, dapLabel: "Check ECC" },
MP169: { monthly: 55, dapLabel: "Check ECC" },
MP199: { monthly: 40, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 86, dapLabel: "NA" },
MP69: { monthly: 65, dapLabel: "Check ECC" },
MP89: { monthly: 65, dapLabel: "Check ECC" },
MP99: { monthly: 55, dapLabel: "Check ECC" },
MP109: { monthly: 55, dapLabel: "Check ECC" },
MP139: { monthly: 45, dapLabel: "Check ECC" },
MP169: { monthly: 35, dapLabel: "Check ECC" },
MP199: { monthly: 20, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Galaxy S26",
aliases: ["samsung", "s26"],
storages: [
{
storage: "512GB",
rrp: 5199,
      promo: "RM104/mth on MP139 (Zero36). 0% interest. Free DAP from MP109.",
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 3699, dap: 0, totalUpfront: 3699 },
MP139: { devicePrice: 3499, dap: 100, totalUpfront: 3599 },
MP169: { devicePrice: 3199, dap: 360, totalUpfront: 3559 },
MP199: { devicePrice: 2999, dap: 560, totalUpfront: 3559 }
},
zero24: {
MP48: { monthly: 216, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 174, dapLabel: "Check ECC" },
MP109: { monthly: 174, dapLabel: "Check ECC" },
MP139: { monthly: 155, dapLabel: "Check ECC" },
MP169: { monthly: 144, dapLabel: "Check ECC" },
MP199: { monthly: 130, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 144, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 115, dapLabel: "Check ECC" },
MP109: { monthly: 115, dapLabel: "Check ECC" },
MP139: { monthly: 104, dapLabel: "Check ECC" },
MP169: { monthly: 95, dapLabel: "Check ECC" },
MP199: { monthly: 80, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Galaxy S26+",
aliases: ["samsung", "s26plus"],
storages: [
{
storage: "512GB",
rrp: 6199,
      promo: "RM142/mth on MP99 (Zero36). 0% interest. Free DAP from MP109.",
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 4599, dap: 0, totalUpfront: 4599 },
MP139: { devicePrice: 4399, dap: 100, totalUpfront: 4499 },
MP169: { devicePrice: 4199, dap: 300, totalUpfront: 4499 },
MP199: { devicePrice: 3899, dap: 600, totalUpfront: 4499 }
},
zero24: {
MP48: { monthly: 258, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 212, dapLabel: "Check ECC" },
MP109: { monthly: 212, dapLabel: "Check ECC" },
MP139: { monthly: 193, dapLabel: "Check ECC" },
MP169: { monthly: 181, dapLabel: "Check ECC" },
MP199: { monthly: 170, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 172, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 142, dapLabel: "Check ECC" },
MP109: { monthly: 142, dapLabel: "Check ECC" },
MP139: { monthly: 129, dapLabel: "Check ECC" },
MP169: { monthly: 121, dapLabel: "Check ECC" },
MP199: { monthly: 105, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Galaxy S26 Ultra",
aliases: ["samsung", "s26ultra"],
storages: [
{
storage: "512GB",
rrp: 6799,
      promo: "RM154/mth on MP99 (Zero36). 0% interest. Free DAP from MP109.",
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 5199, dap: 0, totalUpfront: 5199 },
MP139: { devicePrice: 4999, dap: 0, totalUpfront: 4999 },
MP169: { devicePrice: 4699, dap: 300, totalUpfront: 4999 },
MP199: { devicePrice: 4399, dap: 600, totalUpfront: 4999 }
},
zero24: {
MP48: { monthly: 283, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 231, dapLabel: "Check ECC" },
MP109: { monthly: 231, dapLabel: "Check ECC" },
MP139: { monthly: 211, dapLabel: "Check ECC" },
MP169: { monthly: 200, dapLabel: "Check ECC" },
MP199: { monthly: 191, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 188, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 154, dapLabel: "Check ECC" },
MP109: { monthly: 154, dapLabel: "Check ECC" },
MP139: { monthly: 141, dapLabel: "Check ECC" },
MP169: { monthly: 133, dapLabel: "Check ECC" },
MP199: { monthly: 125, dapLabel: "Check ECC" }
}
}
}
},
{
storage: "1TB",
rrp: 7999,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 6299, dap: 0, totalUpfront: 6299 },
MP139: { devicePrice: 6099, dap: 0, totalUpfront: 6099 },
MP169: { devicePrice: 5799, dap: 300, totalUpfront: 6099 },
MP199: { devicePrice: 5499, dap: 600, totalUpfront: 6099 }
},
zero24: {
MP48: { monthly: 333, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 285, dapLabel: "Check ECC" },
MP109: { monthly: 285, dapLabel: "Check ECC" },
MP139: { monthly: 275, dapLabel: "Check ECC" },
MP169: { monthly: 265, dapLabel: "Check ECC" },
MP199: { monthly: 245, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 222, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 195, dapLabel: "Check ECC" },
MP109: { monthly: 195, dapLabel: "Check ECC" },
MP139: { monthly: 185, dapLabel: "Check ECC" },
MP169: { monthly: 175, dapLabel: "Check ECC" },
MP199: { monthly: 155, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Galaxy Tab S10 Lite 5G",
aliases: ["samsung", "tabs10lite"],
storages: [
{
storage: "Default",
rrp: 1799,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 699, dap: 360, totalUpfront: 1059 },
MP109: { devicePrice: 699, dap: 360, totalUpfront: 1059 },
MP139: { devicePrice: 399, dap: 660, totalUpfront: 1059 },
MP169: { devicePrice: 0, dap: 1040, totalUpfront: 1040 },
MP199: { devicePrice: 0, dap: 1040, totalUpfront: 1040 }
},
zero24: {
MP48: { monthly: 74, dapLabel: "NA" },
MP69: { monthly: 70, dapLabel: "Check ECC" },
MP89: { monthly: 70, dapLabel: "Check ECC" },
MP99: { monthly: 65, dapLabel: "Check ECC" },
MP109: { monthly: 65, dapLabel: "Check ECC" },
MP139: { monthly: 60, dapLabel: "Check ECC" },
MP169: { monthly: 50, dapLabel: "Check ECC" },
MP199: { monthly: 30, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 49, dapLabel: "NA" },
MP69: { monthly: 45, dapLabel: "Check ECC" },
MP89: { monthly: 45, dapLabel: "Check ECC" },
MP99: { monthly: 40, dapLabel: "Check ECC" },
MP109: { monthly: 40, dapLabel: "Check ECC" },
MP139: { monthly: 35, dapLabel: "Check ECC" },
MP169: { monthly: 30, dapLabel: "Check ECC" },
MP199: { monthly: 15, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Galaxy Tab S11 5G",
aliases: ["samsung", "tabs11"],
storages: [
{
storage: "Default",
rrp: 4399,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 3299, dap: 0, totalUpfront: 3299 },
MP139: { devicePrice: 3099, dap: 180, totalUpfront: 3279 },
MP169: { devicePrice: 2799, dap: 480, totalUpfront: 3279 },
MP199: { devicePrice: 2599, dap: 680, totalUpfront: 3279 }
},
zero24: {
MP48: { monthly: "NA", dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: "NA", dapLabel: "Check ECC" },
MP109: { monthly: "NA", dapLabel: "Check ECC" },
MP139: { monthly: "NA", dapLabel: "Check ECC" },
MP169: { monthly: "NA", dapLabel: "Check ECC" },
MP199: { monthly: "NA", dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 122, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 105, dapLabel: "Check ECC" },
MP109: { monthly: 105, dapLabel: "Check ECC" },
MP139: { monthly: 100, dapLabel: "Check ECC" },
MP169: { monthly: 90, dapLabel: "Check ECC" },
MP199: { monthly: 70, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Galaxy Tab S11 Ultra 5G",
aliases: ["samsung", "tabs11ultra"],
storages: [
{
storage: "Default",
rrp: 6499,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 5099, dap: 0, totalUpfront: 5099 },
MP139: { devicePrice: 4899, dap: 120, totalUpfront: 5019 },
MP169: { devicePrice: 4599, dap: 420, totalUpfront: 5019 },
MP199: { devicePrice: 4299, dap: 720, totalUpfront: 5019 }
},
zero24: {
MP48: { monthly: "NA", dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: "NA", dapLabel: "Check ECC" },
MP109: { monthly: "NA", dapLabel: "Check ECC" },
MP139: { monthly: "NA", dapLabel: "Check ECC" },
MP169: { monthly: "NA", dapLabel: "Check ECC" },
MP199: { monthly: "NA", dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 180, dapLabel: "NA" },
MP69: { monthly: "NA", dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "Check ECC" },
MP99: { monthly: 160, dapLabel: "Check ECC" },
MP109: { monthly: 160, dapLabel: "Check ECC" },
MP139: { monthly: 155, dapLabel: "Check ECC" },
MP169: { monthly: 145, dapLabel: "Check ECC" },
MP199: { monthly: 125, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Galaxy Flip7",
aliases: ["samsung", "flip7"],
storages: [
{
storage: "256GB",
rrp: 4999,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 3099, dap: 0, totalUpfront: 3099 },
MP139: { devicePrice: 2899, dap: 120, totalUpfront: 3019 },
MP169: { devicePrice: 2599, dap: 420, totalUpfront: 3019 },
MP199: { devicePrice: 2299, dap: 720, totalUpfront: 3019 }
},
zero24: {
MP48: { monthly: 208, dapLabel: "NA" },
MP69: { monthly: 165, dapLabel: "Check ECC" },
MP89: { monthly: 165, dapLabel: "Check ECC" },
MP99: { monthly: 155, dapLabel: "Check ECC" },
MP109: { monthly: 155, dapLabel: "Check ECC" },
MP139: { monthly: 140, dapLabel: "Check ECC" },
MP169: { monthly: 125, dapLabel: "Check ECC" },
MP199: { monthly: 110, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 138, dapLabel: "NA" },
MP69: { monthly: 110, dapLabel: "Check ECC" },
MP89: { monthly: 110, dapLabel: "Check ECC" },
MP99: { monthly: 100, dapLabel: "Check ECC" },
MP109: { monthly: 100, dapLabel: "Check ECC" },
MP139: { monthly: 90, dapLabel: "Check ECC" },
MP169: { monthly: 80, dapLabel: "Check ECC" },
MP199: { monthly: 60, dapLabel: "Check ECC" }
}
}
}
},
{
storage: "512GB",
rrp: 5599,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 3699, dap: 0, totalUpfront: 3699 },
MP139: { devicePrice: 3399, dap: 120, totalUpfront: 3519 },
MP169: { devicePrice: 3199, dap: 420, totalUpfront: 3619 },
MP199: { devicePrice: 2899, dap: 720, totalUpfront: 3619 }
},
zero24: {
MP48: { monthly: 233, dapLabel: "NA" },
MP69: { monthly: 190, dapLabel: "Check ECC" },
MP89: { monthly: 190, dapLabel: "Check ECC" },
MP99: { monthly: 180, dapLabel: "Check ECC" },
MP109: { monthly: 180, dapLabel: "Check ECC" },
MP139: { monthly: 170, dapLabel: "Check ECC" },
MP169: { monthly: 155, dapLabel: "Check ECC" },
MP199: { monthly: 135, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 155, dapLabel: "NA" },
MP69: { monthly: 130, dapLabel: "Check ECC" },
MP89: { monthly: 130, dapLabel: "Check ECC" },
MP99: { monthly: 120, dapLabel: "Check ECC" },
MP109: { monthly: 120, dapLabel: "Check ECC" },
MP139: { monthly: 110, dapLabel: "Check ECC" },
MP169: { monthly: 100, dapLabel: "Check ECC" },
MP199: { monthly: 85, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Galaxy Fold7",
aliases: ["samsung", "fold7"],
storages: [
{
storage: "256GB",
rrp: 7799,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 5499, dap: 0, totalUpfront: 5499 },
MP139: { devicePrice: 5299, dap: 120, totalUpfront: 5419 },
MP169: { devicePrice: 5099, dap: 320, totalUpfront: 5419 },
MP199: { devicePrice: 4799, dap: 620, totalUpfront: 5419 }
},
zero24: {
MP48: { monthly: 324, dapLabel: "NA" },
MP69: { monthly: 275, dapLabel: "Check ECC" },
MP89: { monthly: 275, dapLabel: "Check ECC" },
MP99: { monthly: 265, dapLabel: "Check ECC" },
MP109: { monthly: 265, dapLabel: "Check ECC" },
MP139: { monthly: 255, dapLabel: "Check ECC" },
MP169: { monthly: 245, dapLabel: "Check ECC" },
MP199: { monthly: 225, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 216, dapLabel: "NA" },
MP69: { monthly: 190, dapLabel: "Check ECC" },
MP89: { monthly: 190, dapLabel: "Check ECC" },
MP99: { monthly: 180, dapLabel: "Check ECC" },
MP109: { monthly: 180, dapLabel: "Check ECC" },
MP139: { monthly: 170, dapLabel: "Check ECC" },
MP169: { monthly: 160, dapLabel: "Check ECC" },
MP199: { monthly: 145, dapLabel: "Check ECC" }
}
}
}
},
{
storage: "512GB",
rrp: 8399,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 6099, dap: 0, totalUpfront: 6099 },
MP139: { devicePrice: 5899, dap: 120, totalUpfront: 6019 },
MP169: { devicePrice: 5599, dap: 420, totalUpfront: 6019 },
MP199: { devicePrice: 5299, dap: 720, totalUpfront: 6019 }
},
zero24: {
MP48: { monthly: 349, dapLabel: "NA" },
MP69: { monthly: 300, dapLabel: "Check ECC" },
MP89: { monthly: 300, dapLabel: "Check ECC" },
MP99: { monthly: 290, dapLabel: "Check ECC" },
MP109: { monthly: 290, dapLabel: "Check ECC" },
MP139: { monthly: 280, dapLabel: "Check ECC" },
MP169: { monthly: 270, dapLabel: "Check ECC" },
MP199: { monthly: 250, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 233, dapLabel: "NA" },
MP69: { monthly: 205, dapLabel: "Check ECC" },
MP89: { monthly: 205, dapLabel: "Check ECC" },
MP99: { monthly: 195, dapLabel: "Check ECC" },
MP109: { monthly: 195, dapLabel: "Check ECC" },
MP139: { monthly: 185, dapLabel: "Check ECC" },
MP169: { monthly: 175, dapLabel: "Check ECC" },
MP199: { monthly: 155, dapLabel: "Check ECC" }
}
}
}
},
{
storage: "1TB",
rrp: 9899,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 7499, dap: 0, totalUpfront: 7499 },
MP139: { devicePrice: 7299, dap: 120, totalUpfront: 7419 },
MP169: { devicePrice: 6999, dap: 420, totalUpfront: 7419 },
MP199: { devicePrice: 6699, dap: 720, totalUpfront: 7419 }
},
zero24: {
MP48: { monthly: 412, dapLabel: "NA" },
MP69: { monthly: 365, dapLabel: "Check ECC" },
MP89: { monthly: 365, dapLabel: "Check ECC" },
MP99: { monthly: 355, dapLabel: "Check ECC" },
MP109: { monthly: 355, dapLabel: "Check ECC" },
MP139: { monthly: 345, dapLabel: "Check ECC" },
MP169: { monthly: 335, dapLabel: "Check ECC" },
MP199: { monthly: 310, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 274, dapLabel: "NA" },
MP69: { monthly: 250, dapLabel: "Check ECC" },
MP89: { monthly: 250, dapLabel: "Check ECC" },
MP99: { monthly: 240, dapLabel: "Check ECC" },
MP109: { monthly: 240, dapLabel: "Check ECC" },
MP139: { monthly: 230, dapLabel: "Check ECC" },
MP169: { monthly: 220, dapLabel: "Check ECC" },
MP199: { monthly: 205, dapLabel: "Check ECC" }
}
}
}
}
]
}
]
},
{
brand: "Vivo",
models: [
{
model: "Vivo Y11 5G",
aliases: ["vivo", "y11"],
storages: [{
storage: "4+256GB",
rrp: 1099,
promo: "FREE 180-day Extended Warranty (worth RM99)",
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: 99, dap: 180, totalUpfront: 279 },
MP89: { devicePrice: 49, dap: 200, totalUpfront: 249 },
MP99: { devicePrice: 0, dap: 240, totalUpfront: 240 },
MP109: { devicePrice: 0, dap: 240, totalUpfront: 240 },
MP139: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP169: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP199: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" }
},
zero24: {
MP48: { monthly: 45, dapLabel: "NA" },
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
{
model: "Vivo Y21 5G",
aliases: ["vivo", "y21"],
storages: [{
storage: "4+256GB",
rrp: 1599,
promo: "FREE 180-day Extended Warranty (worth RM99)",
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 399, dap: 240, totalUpfront: 639 },
MP109: { devicePrice: 399, dap: 240, totalUpfront: 639 },
MP139: { devicePrice: 0, dap: 640, totalUpfront: 640 },
MP169: { devicePrice: 0, dap: 640, totalUpfront: 640 },
MP199: { devicePrice: 0, dap: 640, totalUpfront: 640 }
},
zero24: {
MP48: { monthly: 66, dapLabel: "NA" },
MP69: { monthly: 60, dapLabel: "Check ECC" },
MP89: { monthly: 60, dapLabel: "Check ECC" },
MP99: { monthly: 55, dapLabel: "Check ECC" },
MP109: { monthly: 55, dapLabel: "Check ECC" },
MP139: { monthly: 45, dapLabel: "Check ECC" },
MP169: { monthly: 30, dapLabel: "Check ECC" },
MP199: { monthly: 10, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 44, dapLabel: "NA" },
MP69: { monthly: 40, dapLabel: "Check ECC" },
MP89: { monthly: 40, dapLabel: "Check ECC" },
MP99: { monthly: 35, dapLabel: "Check ECC" },
MP109: { monthly: 35, dapLabel: "Check ECC" },
MP139: { monthly: 30, dapLabel: "Check ECC" },
MP169: { monthly: 20, dapLabel: "Check ECC" },
MP199: { monthly: 0, dapLabel: "Check ECC" }
}
}
}
}]
},

{
model: "Vivo V70 FE 5G",
aliases: ["v70fe", "v70 fe"],
storages: [
{
storage: "8GB+512GB",
rrp: 1999,
promo: "Free with MP169 & up. Gift: Popmart phone pouch (while stocks last).",
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
},
{
model: "Vivo V70 5G",
aliases: ["vivo", "v70"],
storages: [
{
storage: "Default",
rrp: 2599,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 1199, dap: 240, totalUpfront: 1439 },
MP139: { devicePrice: 699, dap: 720, totalUpfront: 1419 },
MP169: { devicePrice: 199, dap: 1220, totalUpfront: 1419 },
MP199: { devicePrice: 0, dap: 1420, totalUpfront: 1420 }
},
zero24: {
MP48: { monthly: 108, dapLabel: "NA" },
MP69: { monthly: 108, dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "NA" },
MP99: { monthly: 80, dapLabel: "Check ECC" },
MP109: { monthly: 80, dapLabel: "Check ECC" },
MP139: { monthly: 70, dapLabel: "Check ECC" },
MP169: { monthly: 55, dapLabel: "Check ECC" },
MP199: { monthly: 40, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 72, dapLabel: "NA" },
MP69: { monthly: 72, dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "NA" },
MP99: { monthly: 55, dapLabel: "Check ECC" },
MP109: { monthly: 55, dapLabel: "Check ECC" },
MP139: { monthly: 45, dapLabel: "Check ECC" },
MP169: { monthly: 35, dapLabel: "Check ECC" },
MP199: { monthly: 25, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Vivo V60 Lite 5G",
aliases: ["vivo", "v60lite"],
storages: [
{
storage: "Default",
rrp: 1799,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 199, dap: 300, totalUpfront: 499 },
MP109: { devicePrice: 199, dap: 300, totalUpfront: 499 },
MP139: { devicePrice: 0, dap: 480, totalUpfront: 480 },
MP169: { devicePrice: 0, dap: 480, totalUpfront: 480 },
MP199: { devicePrice: 0, dap: 480, totalUpfront: 480 }
},
zero24: {
MP48: { monthly: 74, dapLabel: "NA" },
MP69: { monthly: 74, dapLabel: "Check ECC" },
MP89: { monthly: 65, dapLabel: "Check ECC" },
MP99: { monthly: 55, dapLabel: "Check ECC" },
MP109: { monthly: 55, dapLabel: "Check ECC" },
MP139: { monthly: 45, dapLabel: "Check ECC" },
MP169: { monthly: 30, dapLabel: "Check ECC" },
MP199: { monthly: 15, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 49, dapLabel: "NA" },
MP69: { monthly: 49, dapLabel: "Check ECC" },
MP89: { monthly: 45, dapLabel: "Check ECC" },
MP99: { monthly: 35, dapLabel: "Check ECC" },
MP109: { monthly: 35, dapLabel: "Check ECC" },
MP139: { monthly: 30, dapLabel: "Check ECC" },
MP169: { monthly: 20, dapLabel: "Check ECC" },
MP199: { monthly: 0, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Vivo X200 FE 5G",
aliases: ["vivo", "x200fe"],
storages: [
{
storage: "Default",
rrp: 3199,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 1599, dap: 120, totalUpfront: 1719 },
MP109: { devicePrice: 1599, dap: 120, totalUpfront: 1719 },
MP139: { devicePrice: 899, dap: 800, totalUpfront: 1699 },
MP169: { devicePrice: 499, dap: 1200, totalUpfront: 1699 },
MP199: { devicePrice: 0, dap: 1680, totalUpfront: 1680 }
},
zero24: {
MP48: { monthly: 133, dapLabel: "NA" },
MP69: { monthly: 133, dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "NA" },
MP99: { monthly: 109, dapLabel: "Check ECC" },
MP109: { monthly: 109, dapLabel: "Check ECC" },
MP139: { monthly: 99, dapLabel: "Check ECC" },
MP169: { monthly: 89, dapLabel: "Check ECC" },
MP199: { monthly: 69, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 88, dapLabel: "NA" },
MP69: { monthly: 88, dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "NA" },
MP99: { monthly: 79, dapLabel: "Check ECC" },
MP109: { monthly: 79, dapLabel: "Check ECC" },
MP139: { monthly: 69, dapLabel: "Check ECC" },
MP169: { monthly: 59, dapLabel: "Check ECC" },
MP199: { monthly: 45, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Vivo X300 5G",
aliases: ["vivo", "x300"],
storages: [
{
storage: "Default",
rrp: 3899,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 2699, dap: 720, totalUpfront: 3419 },
MP109: { devicePrice: 2699, dap: 720, totalUpfront: 3419 },
MP139: { devicePrice: 1799, dap: 1400, totalUpfront: 3199 },
MP169: { devicePrice: 1399, dap: 2100, totalUpfront: 3499 },
MP199: { devicePrice: 999, dap: 2600, totalUpfront: 3599 }
},
zero24: {
MP48: { monthly: 162, dapLabel: "NA" },
MP69: { monthly: 162, dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "NA" },
MP99: { monthly: 135, dapLabel: "Check ECC" },
MP109: { monthly: 135, dapLabel: "Check ECC" },
MP139: { monthly: 125, dapLabel: "Check ECC" },
MP169: { monthly: 110, dapLabel: "Check ECC" },
MP199: { monthly: 90, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 108, dapLabel: "NA" },
MP69: { monthly: 108, dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "NA" },
MP99: { monthly: 90, dapLabel: "Check ECC" },
MP109: { monthly: 90, dapLabel: "Check ECC" },
MP139: { monthly: 80, dapLabel: "Check ECC" },
MP169: { monthly: 70, dapLabel: "Check ECC" },
MP199: { monthly: 55, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Vivo X300 Pro 5G",
aliases: ["vivo", "x300pro"],
storages: [
{
storage: "Default",
rrp: 4699,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 3199, dap: 0, totalUpfront: 3199 },
MP139: { devicePrice: 2999, dap: 120, totalUpfront: 3119 },
MP169: { devicePrice: 2699, dap: 420, totalUpfront: 3119 },
MP199: { devicePrice: 2399, dap: 720, totalUpfront: 3119 }
},
zero24: {
MP48: { monthly: 195, dapLabel: "NA" },
MP69: { monthly: 195, dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "NA" },
MP99: { monthly: 155, dapLabel: "Check ECC" },
MP109: { monthly: 155, dapLabel: "Check ECC" },
MP139: { monthly: 145, dapLabel: "Check ECC" },
MP169: { monthly: 130, dapLabel: "Check ECC" },
MP199: { monthly: 110, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 130, dapLabel: "NA" },
MP69: { monthly: 130, dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "NA" },
MP99: { monthly: 105, dapLabel: "Check ECC" },
MP109: { monthly: 105, dapLabel: "Check ECC" },
MP139: { monthly: 95, dapLabel: "Check ECC" },
MP169: { monthly: 85, dapLabel: "Check ECC" },
MP199: { monthly: 70, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Vivo X Fold 5 5G",
aliases: ["vivo", "xfold5"],
storages: [
{
storage: "Default",
rrp: 6999,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 5399, dap: 0, totalUpfront: 5399 },
MP139: { devicePrice: 5199, dap: 180, totalUpfront: 5379 },
MP169: { devicePrice: 4999, dap: 360, totalUpfront: 5359 },
MP199: { devicePrice: 4699, dap: 660, totalUpfront: 5359 }
},
zero24: {
MP48: { monthly: 291, dapLabel: "NA" },
MP69: { monthly: 291, dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "NA" },
MP99: { monthly: 260, dapLabel: "Check ECC" },
MP109: { monthly: 260, dapLabel: "Check ECC" },
MP139: { monthly: 245, dapLabel: "Check ECC" },
MP169: { monthly: 235, dapLabel: "Check ECC" },
MP199: { monthly: 215, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 194, dapLabel: "NA" },
MP69: { monthly: 194, dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "NA" },
MP99: { monthly: 178, dapLabel: "Check ECC" },
MP109: { monthly: 178, dapLabel: "Check ECC" },
MP139: { monthly: 168, dapLabel: "Check ECC" },
MP169: { monthly: 155, dapLabel: "Check ECC" },
MP199: { monthly: 135, dapLabel: "Check ECC" }
}
}
}
}
]
}
]
},
{
brand: "Xiaomi",
models: [
{
model: "Redmi Note 15 Pro 5G",
aliases: ["xiaomi", "redminote15pro"],
storages: [
{
storage: "Default",
rrp: 1699,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 199, dap: 480, totalUpfront: 679 },
MP109: { devicePrice: 199, dap: 480, totalUpfront: 679 },
MP139: { devicePrice: 0, dap: 680, totalUpfront: 680 },
MP169: { devicePrice: 0, dap: 680, totalUpfront: 680 },
MP199: { devicePrice: 0, dap: 680, totalUpfront: 680 }
},
zero24: {
MP48: { monthly: 70, dapLabel: "NA" },
MP69: { monthly: 70, dapLabel: "Check ECC" },
MP89: { monthly: 60, dapLabel: "Check ECC" },
MP99: { monthly: 50, dapLabel: "Check ECC" },
MP109: { monthly: 50, dapLabel: "Check ECC" },
MP139: { monthly: 40, dapLabel: "Check ECC" },
MP169: { monthly: 30, dapLabel: "Check ECC" },
MP199: { monthly: 10, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 47, dapLabel: "NA" },
MP69: { monthly: 47, dapLabel: "Check ECC" },
MP89: { monthly: 40, dapLabel: "Check ECC" },
MP99: { monthly: 35, dapLabel: "Check ECC" },
MP109: { monthly: 35, dapLabel: "Check ECC" },
MP139: { monthly: 25, dapLabel: "Check ECC" },
MP169: { monthly: 20, dapLabel: "Check ECC" },
MP199: { monthly: 0, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Xiaomi 15T 5G",
aliases: ["xiaomi", "15t"],
storages: [
{
storage: "Default",
rrp: 2199,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 799, dap: 480, totalUpfront: 1279 },
MP109: { devicePrice: 799, dap: 480, totalUpfront: 1279 },
MP139: { devicePrice: 299, dap: 980, totalUpfront: 1279 },
MP169: { devicePrice: 0, dap: 1280, totalUpfront: 1280 },
MP199: { devicePrice: 0, dap: 1280, totalUpfront: 1280 }
},
zero24: {
MP48: { monthly: 91, dapLabel: "NA" },
MP69: { monthly: 91, dapLabel: "Check ECC" },
MP89: { monthly: 80, dapLabel: "Check ECC" },
MP99: { monthly: 75, dapLabel: "Check ECC" },
MP109: { monthly: 75, dapLabel: "Check ECC" },
MP139: { monthly: 65, dapLabel: "Check ECC" },
MP169: { monthly: 55, dapLabel: "Check ECC" },
MP199: { monthly: 35, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 61, dapLabel: "NA" },
MP69: { monthly: 61, dapLabel: "Check ECC" },
MP89: { monthly: 55, dapLabel: "Check ECC" },
MP99: { monthly: 50, dapLabel: "Check ECC" },
MP109: { monthly: 50, dapLabel: "Check ECC" },
MP139: { monthly: 45, dapLabel: "Check ECC" },
MP169: { monthly: 35, dapLabel: "Check ECC" },
MP199: { monthly: 20, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Xiaomi 15T Pro 5G",
aliases: ["xiaomi", "15tpro"],
storages: [
{
storage: "Default",
rrp: 2999,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: 1599, dap: 420, totalUpfront: 2019 },
MP109: { devicePrice: 1599, dap: 420, totalUpfront: 2019 },
MP139: { devicePrice: 1099, dap: 920, totalUpfront: 2019 },
MP169: { devicePrice: 599, dap: 1400, totalUpfront: 1999 },
MP199: { devicePrice: 0, dap: 2000, totalUpfront: 2000 }
},
zero24: {
MP48: { monthly: 124, dapLabel: "NA" },
MP69: { monthly: 124, dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "NA" },
MP99: { monthly: 95, dapLabel: "Check ECC" },
MP109: { monthly: 95, dapLabel: "Check ECC" },
MP139: { monthly: 85, dapLabel: "Check ECC" },
MP169: { monthly: 70, dapLabel: "Check ECC" },
MP199: { monthly: 55, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 83, dapLabel: "NA" },
MP69: { monthly: 83, dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "NA" },
MP99: { monthly: 65, dapLabel: "Check ECC" },
MP109: { monthly: 65, dapLabel: "Check ECC" },
MP139: { monthly: 55, dapLabel: "Check ECC" },
MP169: { monthly: 45, dapLabel: "Check ECC" },
MP199: { monthly: 30, dapLabel: "Check ECC" }
}
}
}
}
]
},
{
model: "Xiaomi 17 Ultra 5G",
aliases: ["xiaomi", "17ultra"],
storages: [
{
storage: "Default",
rrp: 5499,
regions: {
ECEM: {
upfront: {
MP69: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP89: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP99: { devicePrice: "NA", dap: "NA", totalUpfront: "NA" },
MP109: { devicePrice: 4199, dap: 120, totalUpfront: 4319 },
MP139: { devicePrice: 3999, dap: 320, totalUpfront: 4319 },
MP169: { devicePrice: 3699, dap: 620, totalUpfront: 4319 },
MP199: { devicePrice: 3499, dap: 820, totalUpfront: 4319 }
},
zero24: {
MP48: { monthly: 229, dapLabel: "NA" },
MP69: { monthly: 229, dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "NA" },
MP99: { monthly: 200, dapLabel: "Check ECC" },
MP109: { monthly: 200, dapLabel: "Check ECC" },
MP139: { monthly: 190, dapLabel: "Check ECC" },
MP169: { monthly: 175, dapLabel: "Check ECC" },
MP199: { monthly: 155, dapLabel: "Check ECC" }
},
zero36: {
MP48: { monthly: 152, dapLabel: "NA" },
MP69: { monthly: 152, dapLabel: "Check ECC" },
MP89: { monthly: "NA", dapLabel: "NA" },
MP99: { monthly: 135, dapLabel: "Check ECC" },
MP109: { monthly: 135, dapLabel: "Check ECC" },
MP139: { monthly: 125, dapLabel: "Check ECC" },
MP169: { monthly: 115, dapLabel: "Check ECC" },
MP199: { monthly: 95, dapLabel: "Check ECC" }
}
}
}
}
]
}
]
},
];
