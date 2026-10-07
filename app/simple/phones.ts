// Data layer for the Simple screen (/simple).
//
// catalog.ts files the same phone twice: once under its real brand (Maxis
// "ECEM" prices) and once under a "Hotlink" pseudo-brand (Hotlink prices).
// Staff think of a phone, not a channel, so here each phone appears once and
// Hotlink becomes just another way to pay.
import {
  catalog,
  type CatalogStorage,
  type StoragePricing,
} from "../../data/catalog";

export type PayType = "upfront" | "zero" | "hotlink";
export type Term = 12 | 24 | 36;

export type PhoneStorage = {
  label: string; // "256GB", "8+256GB" or "" when the catalog only says "Default"
  rrp: number;
  promo?: string;
  ecem?: StoragePricing;
  hotlink?: StoragePricing;
};

export type Phone = {
  id: string;
  brand: string;
  name: string;
  haystack: string;
  eol: boolean;
  storages: PhoneStorage[];
};

type Row = {
  devicePrice?: number | string;
  dap?: number | string;
  totalUpfront?: number | string;
  monthly?: number | string;
  dapLabel?: string;
};
type Table = Record<string, Row>;

const BRAND_PREFIX = /^(samsung|apple|google|honor|huawei|nubia|oppo|realme|redmagic|vivo|xiaomi)\s+/i;

// "Samsung Galaxy A26 5G" and "Galaxy A26 5G" are the same phone.
function phoneKey(brand: string, name: string) {
  const core = name
    .toLowerCase()
    .replace(BRAND_PREFIX, "")
    .replace(/\b5g\b/g, "")
    .replace(/[^a-z0-9+]/g, "");
  return `${brand.toLowerCase()}:${core}`;
}

// Hotlink entries carry no real brand; take it from the model name.
function brandOfHotlinkModel(name: string) {
  const first = name.split(/\s+/)[0].toLowerCase();
  if (first === "redmi") return "Xiaomi";
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function parseStorage(label: string): { ram?: number; rom?: number } {
  const m = label.toUpperCase().replace(/\s/g, "").match(/^(?:(\d+)(?:GB)?\+)?(\d+)(GB|TB)$/);
  if (!m) return {};
  return { ram: m[1] ? Number(m[1]) : undefined, rom: Number(m[2]) * (m[3] === "TB" ? 1024 : 1) };
}

function cleanLabel(label: string) {
  return /^default$/i.test(label.trim()) ? "" : label.trim();
}

// Which existing storage a Hotlink storage is: same label, or same ROM where only one side
// states the RAM ("12+256GB" vs "256GB"), or the phone's only storage when one side says "Default".
function matchStorage(phone: Phone, label: string): PhoneStorage | undefined {
  const exact = phone.storages.find((s) => s.label === cleanLabel(label));
  if (exact) return exact;
  const a = parseStorage(label);
  const hits = phone.storages.filter((s) => {
    const b = parseStorage(s.label);
    if (a.rom === undefined || b.rom === undefined) return phone.storages.length === 1;
    return a.rom === b.rom && (a.ram === undefined || b.ram === undefined || a.ram === b.ram);
  });
  return hits.length === 1 ? hits[0] : undefined;
}

function toStorage(s: CatalogStorage): PhoneStorage {
  return {
    label: cleanLabel(s.storage),
    rrp: s.rrp,
    promo: s.promo,
    ecem: s.regions.ECEM,
    hotlink: s.regions.HOTLINK,
  };
}

function buildPhones(): Phone[] {
  const byId = new Map<string, Phone>();
  const order: Phone[] = [];
  const hotlinkBlocks = catalog.filter((b) => b.brand === "Hotlink");

  for (const b of catalog) {
    if (b.brand === "Hotlink") continue;
    for (const m of b.models) {
      const id = phoneKey(b.brand, m.model);
      let phone = byId.get(id);
      if (!phone) {
        phone = { id, brand: b.brand, name: m.model, haystack: "", eol: !!m.eol, storages: [] };
        byId.set(id, phone);
        order.push(phone);
      }
      for (const s of m.storages) phone.storages.push(toStorage(s));
      phone.haystack += ` ${b.brand} ${m.model} ${(m.aliases || []).join(" ")}`;
    }
  }

  for (const b of hotlinkBlocks) {
    for (const m of b.models) {
      const brand = brandOfHotlinkModel(m.model);
      const id = phoneKey(brand, m.model);
      let phone = byId.get(id);
      // Ended on Hotlink but still sold on Maxis plans: offer only the Maxis prices.
      if (phone && m.eol) continue;
      if (!phone) {
        phone = { id, brand, name: m.model, haystack: "", eol: !!m.eol, storages: [] };
        byId.set(id, phone);
        order.push(phone);
      }
      for (const s of m.storages) {
        const hit = matchStorage(phone, s.storage);
        if (hit) {
          // The Hotlink block is the copy kept in line with the Hotlink price list, so
          // it wins over any Hotlink rows the brand entry also carries.
          hit.hotlink = s.regions.HOTLINK;
          if (!hit.label) hit.label = cleanLabel(s.storage);
          if (!hit.promo && s.promo) hit.promo = s.promo;
        } else {
          phone.storages.push(toStorage(s));
        }
      }
      phone.haystack += ` ${brand} ${m.model} hotlink ${(m.aliases || []).join(" ")}`;
    }
  }

  for (const p of order) {
    p.haystack = `${p.haystack} ${p.storages.map((s) => s.label).join(" ")}`.toLowerCase();
  }
  return order;
}

export const PHONES: Phone[] = buildPhones();
export const PHONE_BY_ID = new Map(PHONES.map((p) => [p.id, p]));
export const BRANDS: string[] = Array.from(new Set(PHONES.map((p) => p.brand)));

export function hasHotlink(p: Phone) {
  return p.storages.some((s) => s.hotlink?.hotlink12 || s.hotlink?.hotlink24);
}

export function searchPhones(query: string): Phone[] {
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  const hits = PHONES.filter((p) => tokens.every((t) => p.haystack.includes(t)));
  const q = query.toLowerCase().trim();
  const score = (p: Phone) => {
    const n = p.name.toLowerCase();
    if (n === q) return 0;
    if (n.startsWith(q) || n.replace(BRAND_PREFIX, "").startsWith(q)) return 1;
    if (n.includes(q)) return 2;
    return 3;
  };
  return hits.sort((a, b) => score(a) - score(b) || Number(a.eol) - Number(b.eol) || a.name.length - b.name.length);
}

// ── Pricing ─────────────────────────────────────────────────────────────────

export function num(v: number | string | undefined | null): number | null {
  if (v === undefined || v === null || v === "" || v === "NA") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function planFee(plan: string) {
  const n = parseInt(plan.replace(/^(MFP|MP|HP)/, ""), 10);
  return Number.isNaN(n) ? 0 : n;
}

export function tableFor(st: PhoneStorage, type: PayType, term: Term): Table | undefined {
  if (type === "upfront") return (term === 36 ? st.ecem?.upfront36 : st.ecem?.upfront) as Table | undefined;
  if (type === "zero") return (term === 36 ? st.ecem?.zero36 : st.ecem?.zero24) as Table | undefined;
  return (term === 12 ? st.hotlink?.hotlink12 : st.hotlink?.hotlink24) as Table | undefined;
}

const TERMS: Record<PayType, Term[]> = { upfront: [24, 36], zero: [24, 36], hotlink: [12, 24] };

// MP69 device prices are left over from older GTMs: the decks stopped listing MP69 in
// Aug 2026, so those figures cannot be checked against anything current. Not shown here.
const UNVERIFIED_PLANS = new Set(["MP69"]);

export function plansFor(st: PhoneStorage, type: PayType, term: Term): string[] {
  const t = tableFor(st, type, term);
  if (!t) return [];
  const key = type === "zero" ? "monthly" : "devicePrice";
  return Object.keys(t)
    .filter((p) => !UNVERIFIED_PLANS.has(p) && num(t[p][key]) !== null)
    // MP48 is the share-line plan: real, but never the first thing to offer
    .sort((a, b) => (a === "MP48" ? 1 : 0) - (b === "MP48" ? 1 : 0) || planFee(a) - planFee(b));
}

export function termsFor(st: PhoneStorage, type: PayType): Term[] {
  return TERMS[type].filter((term) => plansFor(st, type, term).length > 0);
}

export function typesFor(st: PhoneStorage): PayType[] {
  return (["upfront", "zero", "hotlink"] as PayType[]).filter((t) => termsFor(st, t).length > 0);
}

export type Quote = {
  type: PayType;
  term: Term;
  plan: string;
  phone: number; // device price (upfront / Hotlink) or monthly instalment (Zerolution)
  deposit: number | null; // DAP, refunded through the bill
  today: number | null; // cash at the counter; null for Zerolution
  monthly: number; // what the customer pays every month
  free: boolean;
  ecc: "none" | "check" | "share";
};

export function quote(st: PhoneStorage, type: PayType, term: Term, plan: string): Quote | null {
  const row = tableFor(st, type, term)?.[plan];
  if (!row) return null;
  if (type === "zero") {
    const inst = num(row.monthly);
    if (inst === null) return null;
    const ecc = plan === "MP48" ? "share" : row.dapLabel && row.dapLabel !== "NA" ? "check" : "none";
    return { type, term, plan, phone: inst, deposit: null, today: null, monthly: planFee(plan) + inst, free: inst === 0, ecc };
  }
  const phone = num(row.devicePrice);
  if (phone === null) return null;
  const deposit = num(row.dap);
  const today = num(row.totalUpfront) ?? phone + (deposit ?? 0);
  const monthly = type === "hotlink" ? num(row.monthly) ?? planFee(plan) : planFee(plan);
  return { type, term, plan, phone, deposit, today, monthly, free: phone === 0, ecc: "none" };
}

// The lowest plan above `plan` (same way to pay) where the phone becomes free.
export function freeUpgrade(st: PhoneStorage, type: PayType, term: Term, plan: string): string | null {
  const here = quote(st, type, term, plan);
  if (!here || here.free) return null;
  for (const p of plansFor(st, type, term)) {
    if (p === "MP48" || planFee(p) <= planFee(plan)) continue;
    if (quote(st, type, term, p)?.free) return p;
  }
  return null;
}

// ── Formatting ──────────────────────────────────────────────────────────────

function groupThousands(n: number) {
  const neg = n < 0;
  const [i, f] = Math.abs(n).toFixed(Number.isInteger(n) ? 0 : 2).split(".");
  return `${neg ? "-" : ""}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${f ? `.${f}` : ""}`;
}

export function rm(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return `RM${groupThousands(n)}`;
}

export const TYPE_LABEL: Record<PayType, string> = {
  upfront: "Pay upfront",
  zero: "Zerolution",
  hotlink: "Hotlink",
};

export function termLabel(term: Term) {
  return `${term} months`;
}

export function storageText(phone: Phone, st: PhoneStorage) {
  return st.label ? `${phone.name} (${st.label})` : phone.name;
}

// One message format: the same lines staff already send, in plain words.
// The catalog's promo notes are left out on purpose: several are expired ("until
// 8 May", "9 Jul - 31 Aug") or internal ("pricing per PDF p.32"), and others name a
// different plan ("FREE with MP199") than the one being quoted. Staff see them on
// screen and mention a gift themselves.
export function whatsappText(phone: Phone, st: PhoneStorage, q: Quote, priceDate: string) {
  const lines: string[] = [`🔥 ${storageText(phone, st)}`, ""];
  if (q.type === "zero") {
    lines.push(`📱 Plan: ${q.plan} · Zerolution ${q.term} months`);
    lines.push(
      q.free
        ? `✅ Phone FREE — you only pay the ${q.plan} plan: RM${planFee(q.plan)}/month`
        : `💰 ${rm(q.monthly)}/month (RM${planFee(q.plan)} plan + ${rm(q.phone)} phone)`
    );
    lines.push(q.ecc === "share" ? "📋 Share line — no credit check" : "📋 Subject to credit check (ECC)");
  } else {
    lines.push(`📱 Plan: ${q.plan} · ${q.type === "hotlink" ? "Hotlink" : "Upfront"} ${q.term} months`);
    lines.push(q.free ? "📦 Phone: FREE 🎉" : `📦 Phone: ${rm(q.phone)}`);
    if (q.deposit) lines.push(`💳 Deposit: ${rm(q.deposit)} (returned in your monthly bill)`);
    lines.push(`🧾 Pay today: ${rm(q.today)}`);
    lines.push(`💰 Monthly: ${rm(q.monthly)}/month`);
  }
  lines.push("", "⚠️ Subject to stock & verification", `📅 Prices valid as of ${priceDate}`, "", "👉 Reply YES to proceed");
  return lines.join("\n");
}
