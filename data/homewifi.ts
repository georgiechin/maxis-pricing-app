// ─────────────────────────────────────────────────────────────────────────────
// Maxis 5G Home WiFi — Plans, Routers & Promos
// Source: GTM Brief MEP 5G Home WiFi (Last updated 29 May 2026)
// NOTE: This is separate from the phone device catalog (data/catalog.ts).
// ─────────────────────────────────────────────────────────────────────────────

export const HOMEWIFI_SOURCE = "5G Home WiFi GTM 29 May 2026";
export const HOMEWIFI_DATE = "2026-05-29";

export type WifiPlan = {
  plan: string;        // display name, e.g. "5G Home WiFi 99"
  short: string;       // short label, e.g. "WiFi 99"
  monthly: number;     // RM/month
  data: string;        // data quota
  speed: string;       // speed cap
  rebate: string;      // promo rebate text
  freeTng: boolean;    // FREE TNG credit included
  highlight?: string;  // optional badge note
};

export type WifiRouter = {
  name: string;
  rrp: number;
  speed: string;       // max 5G speed
  coverage: string;    // wifi coverage
  devices: string;     // no. of devices
  // 24-month contract (main offer)
  free24: boolean;     // router FREE on 24M
  dap24: number;       // refundable deposit on 24M
  // 12-month contract (being phased out from 11 Jun for some plans)
  upfront12: number | "NA"; // device upfront on 12M
  dap12: number | "NA";
  isCombo?: boolean;   // router + mesh combo
  isNew?: boolean;     // newly introduced
  eol?: boolean;       // being discontinued
  note?: string;
};

// ── Plans ────────────────────────────────────────────────────────────────────
export const WIFI_PLANS: WifiPlan[] = [
  {
    plan: "5G Home WiFi 69",
    short: "WiFi 69",
    monthly: 69,
    data: "150GB 5G / 4G",
    speed: "Uncapped speed",
    rebate: "No rebate",
    freeTng: false,
    highlight: "⚠️ 12M router discontinued 11 Jun → SIM-only plan",
  },
  {
    plan: "5G Home WiFi 99",
    short: "WiFi 99",
    monthly: 99,
    data: "Unlimited 5G / 4G",
    speed: "Up to 100Mbps",
    rebate: "Rebate RM20 × 12M/24M + FREE TNG",
    freeTng: true,
  },
  {
    plan: "5G Home WiFi 139",
    short: "WiFi 139",
    monthly: 139,
    data: "Unlimited 5G / 4G",
    speed: "Uncapped speed",
    rebate: "Rebate RM30 × 12M/24M + FREE TNG",
    freeTng: true,
    highlight: "Now with Router + Mesh combo (24M)",
  },
  {
    plan: "5G Plus Home WiFi 159",
    short: "WiFi 159",
    monthly: 159,
    data: "Unlimited 5G / 4G",
    speed: "Uncapped speed",
    rebate: "Rebate RM30 × 24M + FREE TNG",
    freeTng: true,
    highlight: "Now with Tozed Router + Mesh combo (24M)",
  },
];

// ── Routers & Mesh ───────────────────────────────────────────────────────────
export const WIFI_ROUTERS: WifiRouter[] = [
  {
    name: "ZTE G5TS",
    rrp: 699,
    speed: "Up to 150Mbps",
    coverage: "Up to 950 sq ft",
    devices: "64 devices",
    free24: true,
    dap24: 96,
    upfront12: 59,
    dap12: 96,
    note: "Light browsing",
  },
  {
    name: "Green Packet C5",
    rrp: 1199,
    speed: "Up to 200Mbps",
    coverage: "Up to 950 sq ft",
    devices: "64 devices",
    free24: true,
    dap24: 96,
    upfront12: 99,
    dap12: 96,
    note: "Light browsing + USB portability",
  },
  {
    name: "Huawei Brovi H153",
    rrp: 799,
    speed: "Up to 300Mbps",
    coverage: "Up to 950 sq ft",
    devices: "128 devices",
    free24: true,
    dap24: 96,
    upfront12: 49,
    dap12: 96,
    note: "Multiple users & devices",
  },
  {
    name: "Tozed S200 + Mesh W304M",
    rrp: 1299,
    speed: "Up to 300Mbps",
    coverage: "Up to 1,600 sq ft",
    devices: "64 + 64 devices",
    free24: true,
    dap24: 132,
    upfront12: "NA",
    dap12: "NA",
    isCombo: true,
    isNew: true,
    note: "Combo — DD opens 5 Jun. Medium to large homes",
  },
  {
    name: "Huawei Brovi H153 + Mesh 3+",
    rrp: 1298,
    speed: "Up to 300Mbps",
    coverage: "Up to 1,600 sq ft",
    devices: "128 + 128 devices",
    free24: true,
    dap24: 132,
    upfront12: "NA",
    dap12: "NA",
    isCombo: true,
    isNew: true,
    note: "Combo — Medium to large homes",
  },
];

// ── Key changes effective 11 Jun 2026 ────────────────────────────────────────
export const WIFI_CHANGES: string[] = [
  "WiFi 69 → SIM-only (12M router option removed)",
  "WiFi 139 & 159 → now Router + Mesh combo (24M)",
  "Tozed S200 + Mesh combo → Dealer Direct opens 5 Jun",
  "Bundle rebate + FREE TNG extended to 30 Jun 2026",
];
