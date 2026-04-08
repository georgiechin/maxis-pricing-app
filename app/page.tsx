"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  catalog,
  CATALOG_SOURCE,
  type CatalogBrand,
  type CatalogModel,
  type CatalogStorage,
  type PricingMode,
} from "../data/catalog";

const pricingTabs: { key: PricingMode; label: string; short: string }[] = [
  { key: "upfront", label: "Upfront", short: "Upfront" },
  { key: "zero24", label: "Zerolution 24M", short: "Zero 24M" },
  { key: "zero36", label: "Zerolution 36M", short: "Zero 36M" },
];

const mpOrder = ["MP69", "MP89", "MP99", "MP109", "MP139", "MP169", "MP199"];
const mpOrderZero = ["MP48", "MP69", "MP89", "MP99", "MP109", "MP139", "MP169", "MP199"];

function formatMoney(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "" || value === "NA") {
    return "NA";
  }
  if (Number(value) === 0 || Number(value) === 1) return "FREE";
  return `RM ${Number(value).toLocaleString()}`;
}

function moneyPlain(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "" || value === "NA") {
    return "NA";
  }
  if (Number(value) === 0 || Number(value) === 1) return "FREE";
  return `RM${Number(value).toLocaleString()}`;
}

// Extract numeric fee from plan name: "MP139" → 139
function planFee(plan: string): number {
  const n = parseInt(plan.replace("MP", ""), 10);
  return isNaN(n) ? 0 : n;
}

type EccStatus = "none" | "required" | "high";

function getEccStatus(tab: PricingMode, plan: string, row: unknown): EccStatus {
  if (tab === "upfront") return "none";
  if (plan === "MP48") return "none";
  const dapLabel = (row as { dapLabel?: string }).dapLabel;
  if (!dapLabel || dapLabel === "NA") return "none";
  const monthly = Number((row as { monthly?: number | string }).monthly);
  if (!isNaN(monthly) && monthly >= 200) return "high";
  return "required";
}

type CopyMode = "basic" | "recommended" | "aggressive";

type BudgetResult = {
  brand: string;
  model: CatalogModel;
  storage: CatalogStorage;
  bestPlan: string;
  bestMonthly: number;
  stretch: boolean; // true = slightly above budget (upsell)
};

type SimilarResult = {
  brand: string;
  model: CatalogModel;
  storage: CatalogStorage;
  price: number;
};

export default function Page() {
  const [selectedBrand, setSelectedBrand] = useState<CatalogBrand["brand"]>(catalog[0].brand);
  const [selectedModel, setSelectedModel] = useState<CatalogModel>(catalog[0].models[0]);
  const [selectedStorage, setSelectedStorage] = useState(
    catalog[0].models[0].storages[0].storage
  );
  const [selectedTab, setSelectedTab] = useState<PricingMode>("upfront");
  const [selectedPlan, setSelectedPlan] = useState("MP99");
  const [toast, setToast] = useState("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const planSectionRef = useRef<HTMLDivElement>(null);

  // Budget filter state
  const [budgetMode, setBudgetMode] = useState(false);
  const [budgetMax, setBudgetMax] = useState("");
  const [budgetTab, setBudgetTab] = useState<"upfront" | "zero24" | "zero36">("zero24");

  // Free Device filter state
  const [freeDeviceMode, setFreeDeviceMode] = useState(false);
  const [freeDevicePlan, setFreeDevicePlan] = useState("MP169");

  // Copy mode
  const [copyMode, setCopyMode] = useState<CopyMode>("recommended");

  // Sidebar collapse state
  const [brandExpanded, setBrandExpanded] = useState(true);
  const [modelExpanded, setModelExpanded] = useState(true);
  const [pricingExpanded, setPricingExpanded] = useState(true);

  const activeBrand = useMemo(
    () => catalog.find((b) => b.brand === selectedBrand) || catalog[0],
    [selectedBrand]
  );

  const activeStorage = useMemo(
    () =>
      selectedModel.storages.find((s) => s.storage === selectedStorage) ||
      selectedModel.storages[0],
    [selectedModel, selectedStorage]
  );

  const regionPricing = activeStorage.regions.ECEM || null;
  const currentTable = regionPricing ? regionPricing[selectedTab] : null;
  const selectedRow = currentTable?.[selectedPlan];

  const getBestDefaultPlan = (
    model: CatalogModel,
    storageName: string,
    mode: PricingMode
  ) => {
    const storage =
      model.storages.find((s) => s.storage === storageName) || model.storages[0];
    const table = storage.regions.ECEM?.[mode];

    if (!table) return "MP99";

    const preferredOrder = ["MP139", "MP109", "MP99", "MP89", "MP69", "MP169", "MP199"];

    for (const plan of preferredOrder) {
      const row = table[plan];
      if (!row) continue;

      if (mode === "upfront") {
        const price = (row as { devicePrice?: number | string }).devicePrice;
        if (price !== undefined && price !== "NA") return plan;
      } else {
        const monthly = (row as { monthly?: number | string }).monthly;
        if (monthly !== undefined && monthly !== "NA") return plan;
      }
    }

    return "MP99";
  };

  // ── Search results ──────────────────────────────────────────────────────────
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    const results: { brand: string; model: CatalogModel }[] = [];
    for (const brand of catalog) {
      for (const model of brand.models) {
        if (
          model.model.toLowerCase().includes(q) ||
          (model.aliases && model.aliases.some((a) => a.toLowerCase().includes(q)))
        ) {
          results.push({ brand: brand.brand, model });
          if (results.length >= 8) return results;
        }
      }
    }
    return results;
  }, [searchQuery]);

  // ── Budget filter results ───────────────────────────────────────────────────
  const budgetResults = useMemo((): BudgetResult[] => {
    const max = Number(budgetMax);
    if (!budgetMode || isNaN(max) || max <= 0) return [];
    const stretchMax = max * 1.25; // +25% upsell range

    const results: BudgetResult[] = [];

    for (const brand of catalog) {
      for (const model of brand.models) {
        for (const storage of model.storages) {
          const table = storage.regions.ECEM?.[budgetTab];
          if (!table) continue;

          let withinPlan = "";
          let withinPrice = Infinity;
          let stretchPlan = "";
          let stretchPrice = Infinity;

          for (const [plan, row] of Object.entries(table)) {
            let price: number;
            if (budgetTab === "upfront") {
              const total = (row as { totalUpfront?: number | string }).totalUpfront;
              if (total === undefined || total === "NA") continue;
              price = Number(total);
            } else {
              const monthly = (row as { monthly?: number | string }).monthly;
              if (monthly === undefined || monthly === "NA") continue;
              price = Number(monthly);
            }
            if (isNaN(price) || price <= 0) continue;

            if (price <= max && price < withinPrice) {
              withinPlan = plan;
              withinPrice = price;
            } else if (price > max && price <= stretchMax && price < stretchPrice) {
              stretchPlan = plan;
              stretchPrice = price;
            }
          }

          if (withinPlan) {
            results.push({ brand: brand.brand, model, storage, bestPlan: withinPlan, bestMonthly: withinPrice, stretch: false });
          } else if (stretchPlan) {
            results.push({ brand: brand.brand, model, storage, bestPlan: stretchPlan, bestMonthly: stretchPrice, stretch: true });
          }
        }
      }
    }

    // Within budget: best phone first (RRP desc)
    // Stretch: cheapest first (least extra money needed)
    const within = results
      .filter((r) => !r.stretch)
      .sort((a, b) => (b.storage.rrp || 0) - (a.storage.rrp || 0));
    const stretch = results
      .filter((r) => r.stretch)
      .sort((a, b) => a.bestMonthly - b.bestMonthly);

    return [...within, ...stretch];
  }, [budgetMode, budgetMax, budgetTab]);

  // ── Free Device phones ──────────────────────────────────────────────────────
  const freeDeviceResults = useMemo((): { brand: string; model: CatalogModel; storage: CatalogStorage }[] => {
    if (!freeDeviceMode) return [];
    const results: { brand: string; model: CatalogModel; storage: CatalogStorage }[] = [];
    for (const brand of catalog) {
      for (const model of brand.models) {
        for (const storage of model.storages) {
          const table = storage.regions.ECEM?.upfront;
          if (!table) continue;
          const row = table[freeDevicePlan];
          if (row && Number(row.devicePrice) === 0) {
            results.push({ brand: brand.brand, model, storage });
          }
        }
      }
    }
    return results;
  }, [freeDeviceMode, freeDevicePlan]);

  // ── ECC status for selected row ─────────────────────────────────────────────
  const eccStatus = useMemo((): EccStatus => {
    if (!selectedRow) return "none";
    return getEccStatus(selectedTab, selectedPlan, selectedRow);
  }, [selectedRow, selectedTab, selectedPlan]);

  // ── Hot deal detection ──────────────────────────────────────────────────────
  const isHotDeal = useMemo(() => {
    if (activeStorage.promo) return true;
    if (selectedTab === "upfront" && selectedRow) {
      const d = (selectedRow as { devicePrice?: number | string }).devicePrice;
      if (d !== undefined && d !== "NA" && Number(d) === 0) return true;
    }
    return false;
  }, [activeStorage.promo, selectedTab, selectedRow]);

  // ── Plan recommender ────────────────────────────────────────────────────────
  const planRecommendations = useMemo((): { tag: string; plan: string; emoji: string; reason: string }[] => {
    if (!currentTable) return [];

    const plans = selectedTab === "upfront" ? mpOrder : mpOrderZero;
    let cheapestPlan = "";
    let cheapestPrice = Infinity;
    let freePlan = "";
    let easyPlan = "";

    for (const plan of plans) {
      const row = currentTable[plan];
      if (!row) continue;

      if (selectedTab === "upfront") {
        const d = (row as { devicePrice?: number | string }).devicePrice;
        if (d === undefined || d === "NA") continue;
        const price = Number(d);
        if (isNaN(price)) continue;
        if (price < cheapestPrice) { cheapestPrice = price; cheapestPlan = plan; }
        if (price === 0 && !freePlan) freePlan = plan;
      } else {
        const m = (row as { monthly?: number | string }).monthly;
        if (m === undefined || m === "NA") continue;
        const price = Number(m);
        if (isNaN(price)) continue;
        if (price < cheapestPrice) { cheapestPrice = price; cheapestPlan = plan; }
      }

      if (!easyPlan && (plan === "MP89" || plan === "MP99")) easyPlan = plan;
    }

    if (!easyPlan) {
      for (const p of ["MP109", "MP89", "MP139", "MP69"]) {
        if (currentTable[p]) { easyPlan = p; break; }
      }
    }

    const bestValuePlan = freePlan || cheapestPlan;
    const seen = new Set<string>();
    const recs: { tag: string; plan: string; emoji: string; reason: string }[] = [];

    if (bestValuePlan) {
      seen.add(bestValuePlan);
      recs.push({ tag: "best-value", plan: bestValuePlan, emoji: "⭐", reason: freePlan ? "Free device" : "Best deal" });
    }
    if (cheapestPlan && !seen.has(cheapestPlan)) {
      seen.add(cheapestPlan);
      recs.push({ tag: "cheapest", plan: cheapestPlan, emoji: "💸", reason: "Cheapest entry" });
    }
    if (easyPlan && !seen.has(easyPlan)) {
      seen.add(easyPlan);
      recs.push({ tag: "easy", plan: easyPlan, emoji: "⚡", reason: "Easy approval" });
    }

    return recs.slice(0, 3);
  }, [currentTable, selectedTab]);

  // ── Upgrade ladder (upfront mode only) ─────────────────────────────────────
  type LadderRow = { plan: string; planCost: number; devicePrice: number; isFree: boolean };
  const upgradeLadder = useMemo((): LadderRow[] => {
    if (!currentTable || selectedTab !== "upfront") return [];
    const rows: LadderRow[] = [];
    for (const plan of mpOrder) {
      const row = currentTable[plan];
      if (!row) continue;
      const dp = (row as { devicePrice?: number | string }).devicePrice;
      if (dp === undefined || dp === "NA") continue;
      const price = Number(dp);
      if (isNaN(price)) continue;
      rows.push({ plan, planCost: planFee(plan), devicePrice: price, isFree: price === 0 });
    }
    return rows;
  }, [currentTable, selectedTab]);

  // Best plain-English tip from current selected plan
  const valueTip = useMemo((): { plan: string; message: string; extraPerMonth: number } | null => {
    if (upgradeLadder.length < 2) return null;
    const currentIdx = upgradeLadder.findIndex((r) => r.plan === selectedPlan);
    if (currentIdx < 0) return null;
    const current = upgradeLadder[currentIdx];
    for (let i = currentIdx + 1; i < upgradeLadder.length; i++) {
      const next = upgradeLadder[i];
      const extraPerMonth = next.planCost - current.planCost;
      const deviceSaving = current.devicePrice - next.devicePrice;
      if (deviceSaving <= 0) continue;
      if (next.isFree) {
        return {
          plan: next.plan,
          extraPerMonth,
          message: `${next.plan} — phone is FREE. Customer pays RM${extraPerMonth} more per month, saves RM${current.devicePrice} on device today.`,
        };
      }
      const breakEven = extraPerMonth > 0 ? Math.ceil(deviceSaving / extraPerMonth) : 99;
      if (breakEven <= 12) {
        return {
          plan: next.plan,
          extraPerMonth,
          message: `${next.plan} — saves RM${deviceSaving} on device. Only RM${extraPerMonth} more per month. Worth it after ${breakEven} months.`,
        };
      }
    }
    return null;
  }, [upgradeLadder, selectedPlan]);

  // ── Similar price phones ────────────────────────────────────────────────────
  const similarPhones = useMemo((): SimilarResult[] => {
    if (!selectedRow) return [];

    let refPrice: number;
    if (selectedTab === "upfront") {
      const p = (selectedRow as { devicePrice?: number | string }).devicePrice;
      if (p === undefined || p === "NA") return [];
      refPrice = Number(p);
    } else {
      const p = (selectedRow as { monthly?: number | string }).monthly;
      if (p === undefined || p === "NA") return [];
      refPrice = Number(p);
    }

    if (isNaN(refPrice) || refPrice <= 0) return [];

    const margin = Math.max(refPrice * 0.25, 15);
    const results: SimilarResult[] = [];

    for (const brand of catalog) {
      for (const model of brand.models) {
        if (model.model === selectedModel.model) continue;
        for (const storage of model.storages) {
          const table = storage.regions.ECEM?.[selectedTab];
          if (!table) continue;
          const row = table[selectedPlan];
          if (!row) continue;

          let price: number;
          if (selectedTab === "upfront") {
            const p = (row as { devicePrice?: number | string }).devicePrice;
            if (p === undefined || p === "NA") continue;
            price = Number(p);
          } else {
            const p = (row as { monthly?: number | string }).monthly;
            if (p === undefined || p === "NA") continue;
            price = Number(p);
          }

          if (isNaN(price) || price <= 0) continue;
          if (Math.abs(price - refPrice) <= margin) {
            results.push({ brand: brand.brand, model, storage, price });
          }
        }
      }
    }

    return results
      .sort((a, b) => Math.abs(a.price - refPrice) - Math.abs(b.price - refPrice))
      .slice(0, 4);
  }, [selectedRow, selectedTab, selectedPlan, selectedModel]);

  // ── Navigation helpers ──────────────────────────────────────────────────────
  const navigateToDevice = (
    brand: string,
    model: CatalogModel,
    storageName?: string,
    tab?: PricingMode
  ) => {
    const targetStorage = storageName || model.storages[0].storage;
    const targetTab = tab || selectedTab;
    setSelectedBrand(brand);
    setSelectedModel(model);
    setSelectedStorage(targetStorage);
    setSelectedTab(targetTab);
    setSelectedPlan(getBestDefaultPlan(model, targetStorage, targetTab));
    setSearchQuery("");
    setBudgetMode(false);
    setBrandExpanded(false);
    setModelExpanded(false);
    setPricingExpanded(true);   // let staff pick a plan on arrival
  };

  const chooseBrand = (brand: CatalogBrand["brand"]) => {
    const nextBrand = catalog.find((b) => b.brand === brand) || catalog[0];
    const nextModel = nextBrand.models[0];
    const nextStorage = nextModel.storages[0].storage;

    setSelectedBrand(nextBrand.brand);
    setSelectedModel(nextModel);
    setSelectedStorage(nextStorage);
    setSelectedTab("upfront");
    setSelectedPlan(getBestDefaultPlan(nextModel, nextStorage, "upfront"));
    setSearchQuery("");
    setBudgetMode(false);
    setBrandExpanded(false);
    setModelExpanded(true);
    setPricingExpanded(true);
  };

  const chooseModel = (model: CatalogModel) => {
    const nextStorage = model.storages[0].storage;

    setSelectedModel(model);
    setSelectedStorage(nextStorage);
    setSelectedTab("upfront");
    setSelectedPlan(getBestDefaultPlan(model, nextStorage, "upfront"));
    setSearchQuery("");
    setModelExpanded(false);
    setPricingExpanded(true);
  };

  const resetAll = () => {
    const firstBrand = catalog[0];
    const firstModel = firstBrand.models[0];
    const firstStorage = firstModel.storages[0].storage;

    setSelectedBrand(firstBrand.brand);
    setSelectedModel(firstModel);
    setSelectedStorage(firstStorage);
    setSelectedTab("upfront");
    setSelectedPlan(getBestDefaultPlan(firstModel, firstStorage, "upfront"));
    setSearchQuery("");
    setBudgetMode(false);
    setBudgetMax("");
    setBrandExpanded(true);
    setModelExpanded(true);
    setPricingExpanded(true);
  };

  const quoteText = useMemo(() => {
    if (!regionPricing || !selectedRow) return "";

    const deviceName = selectedModel.model;
    const promo = activeStorage.promo || "";
    const modeLabel =
      selectedTab === "upfront" ? "Upfront" : selectedTab === "zero24" ? "Zerolution 24M" : "Zerolution 36M";

    if (selectedTab === "upfront") {
      const row = selectedRow as {
        devicePrice?: number | string;
        dap?: number | string;
        dapLabel?: string;
        totalUpfront?: number | string;
      };
      if (row.devicePrice === undefined || row.devicePrice === "NA") return "";
      const isFree = Number(row.devicePrice) === 0;
      const dapText = row.dapLabel ? row.dapLabel : moneyPlain(row.dap);

      if (copyMode === "basic") {
        return `🔥 ${deviceName}
📦 Storage: ${activeStorage.storage}
📍 Region: ECEM
📱 Plan: ${selectedPlan}

💰 Device Price: ${moneyPlain(row.devicePrice)}
📉 DAP: ${dapText}
🧾 Total Upfront: ${moneyPlain(row.totalUpfront)}`;
      }

      if (copyMode === "recommended") {
        return [
          `🔥 ${deviceName}`,
          ``,
          `📱 Plan: ${selectedPlan} (${modeLabel})`,
          `📦 Device: ${moneyPlain(row.devicePrice)}`,
          `💳 DAP: ${dapText}`,
          `🧾 Total upfront: ${moneyPlain(row.totalUpfront)}`,
          isFree ? `✅ FREE device promo!` : ``,
          promo ? `🎁 ${promo}` : ``,
          ``,
          `⚠️ Subject to stock & verification`,
          ``,
          `👉 Reply YES to proceed`,
          `👉 I guide you step by step`,
        ].filter((l, i, arr) => !(l === "" && arr[i - 1] === "")).join("\n").trim();
      }

      // aggressive
      const strongest = isFree
        ? `✅ FREE device — zero device cost!`
        : `📦 Device at ${moneyPlain(row.devicePrice)} only`;
      return [
        `🔥 BEST DEAL — ${deviceName}`,
        ``,
        strongest,
        `💳 DAP: ${dapText}`,
        `📱 Plan: ${selectedPlan} | ${modeLabel}`,
        promo ? `🎁 ${promo}` : ``,
        ``,
        `⚡ Fast approval for eligible customers`,
        ``,
        `👉 Grab it — limited stocks`,
        `👉 Reply YES and I handle everything`,
      ].filter((l, i, arr) => !(l === "" && arr[i - 1] === "")).join("\n").trim();
    }

    // Zero modes
    const row = selectedRow as { monthly?: number | string; dapLabel?: string };
    if (row.monthly === undefined || row.monthly === "NA") return "";
    const monthly = Number(row.monthly);
    const fee = planFee(selectedPlan);
    const effectiveTotal = fee + monthly;
    const isFreeDevice = monthly === 0;
    const eccNote =
      selectedPlan === "MP48"
        ? "No ECC — Shareline"
        : row.dapLabel && row.dapLabel !== "NA"
        ? row.dapLabel
        : "Check ECC";

    if (copyMode === "basic") {
      return `🔥 ${deviceName}
📦 Storage: ${activeStorage.storage}
📍 Region: ECEM
📱 Plan: ${selectedPlan}${selectedPlan === "MP48" ? " (Shareline)" : ""}
🗓 Mode: ${modeLabel}

📆 Monthly: ${moneyPlain(row.monthly)}
📝 Note: ${eccNote}`;
    }

    if (copyMode === "recommended") {
      return [
        `🔥 ${deviceName}`,
        ``,
        `📱 Plan: ${selectedPlan} (${modeLabel})`,
        `💰 Device installment: RM${monthly}/mo`,
        `📊 Total/month: RM${fee} plan + RM${monthly} = RM${effectiveTotal}`,
        isFreeDevice ? `✅ FREE device — RM0 installment!` : ``,
        promo ? `🎁 ${promo}` : ``,
        ``,
        `📋 ${eccNote}`,
        `⚠️ Subject to verification`,
        ``,
        `👉 Reply YES to proceed`,
        `👉 I guide you step by step`,
      ].filter((l, i, arr) => !(l === "" && arr[i - 1] === "")).join("\n").trim();
    }

    // aggressive
    const strongest = isFreeDevice
      ? `✅ FREE device on ${selectedPlan}!`
      : `💥 Only RM${monthly}/mo device installment`;
    return [
      `🔥 BEST DEAL — ${deviceName}`,
      ``,
      strongest,
      `📱 Plan: ${selectedPlan} | ${modeLabel}`,
      `📊 RM${fee} plan + RM${monthly} device = RM${effectiveTotal}/mo`,
      promo ? `🎁 ${promo}` : ``,
      ``,
      `⚡ Fast approval for eligible customers`,
      ``,
      `👉 Grab it — limited promo`,
      `👉 Reply YES and I handle everything`,
    ].filter((l, i, arr) => !(l === "" && arr[i - 1] === "")).join("\n").trim();
  }, [regionPricing, selectedRow, selectedModel, activeStorage, selectedPlan, selectedTab, copyMode]);

  const copyQuote = async () => {
    if (!quoteText) return;
    await navigator.clipboard.writeText(quoteText);
    setToast("Copied");
  };

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Scroll plan section into view when table collapses
  useEffect(() => {
    if (!pricingExpanded && planSectionRef.current) {
      planSectionRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [pricingExpanded]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    if (!searchQuery) return;
    const handler = (e: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node) &&
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(e.target as Node)
      ) {
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchQuery]);

  return (
    <main className="min-h-screen bg-[#0a0d0f] text-[#f0f2f4]">
      <div className="min-h-screen lg:grid lg:grid-cols-[220px_minmax(0,1fr)_320px] lg:grid-rows-[auto_1fr]">

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <header className="relative border-b border-white/8 bg-[#111417] px-4 py-4 lg:col-span-3 lg:px-5">
          {/* Row 1: logo + badges (always) */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00D46A] text-sm font-bold text-black">
                M
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Device Price Check</div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="text-[#00D46A]/70">ECEM</span>
                  <span>·</span>
                  <span>{CATALOG_SOURCE}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search — desktop only inline */}
              <div className="relative hidden sm:block">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="🔍 Search model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && setSearchQuery("")}
                  className="w-44 rounded-xl border border-white/10 bg-[#1e2225] px-3 py-2 text-xs text-white placeholder-slate-500 transition focus:border-[#00D46A]/50 focus:outline-none"
                />
                {searchResults.length > 0 && (
                  <div
                    ref={searchDropdownRef}
                    className="absolute right-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-xl border border-white/10 bg-[#1a1e22] shadow-2xl"
                  >
                    {searchResults.map(({ brand, model }) => (
                      <button
                        key={`${brand}-${model.model}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          navigateToDevice(brand, model);
                        }}
                        className="w-full border-b border-white/5 px-4 py-3 text-left transition last:border-b-0 hover:bg-[#262b2f]"
                      >
                        <div className="text-sm font-medium text-white">{model.model}</div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {brand} · {model.storages.map((s) => s.storage).join(" / ")}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={resetAll}
                className="rounded-xl border border-white/10 bg-[#1e2225] px-3 py-2 text-xs font-medium text-slate-300 transition hover:text-white"
              >
                ↺ Reset
              </button>
            </div>
          </div>

          {/* Row 2: search — mobile only, full width */}
          <div className="relative mt-3 sm:hidden">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setSearchQuery("")}
              className="w-full rounded-xl border border-white/10 bg-[#1e2225] py-2.5 pl-9 pr-9 text-sm text-white placeholder-slate-500 transition focus:border-[#00D46A]/50 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
              >
                ✕
              </button>
            )}
            {/* Mobile dropdown — full width, never off-screen */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-white/10 bg-[#1a1e22] shadow-2xl">
                {searchResults.map(({ brand, model }) => (
                  <button
                    key={`${brand}-${model.model}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      navigateToDevice(brand, model);
                    }}
                    className="w-full border-b border-white/5 px-4 py-3.5 text-left transition last:border-b-0 active:bg-[#262b2f]"
                  >
                    <div className="text-sm font-medium text-white">{model.model}</div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {brand} · {model.storages.map((s) => s.storage).join(" / ")}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* ── LEFT SIDEBAR ────────────────────────────────────────────────── */}
        <aside className="border-b border-white/8 bg-[#111417] p-3 lg:row-start-2 lg:border-b-0 lg:border-r lg:p-4">
          {freeDeviceMode ? (
            /* Free Device Filter Mode */
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#00D46A]">
                  🎁 Free Device
                </div>
                <button
                  onClick={() => setFreeDeviceMode(false)}
                  className="text-xs text-slate-500 transition hover:text-white"
                >
                  ✕ Close
                </button>
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-slate-400">Select plan</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {["MP89", "MP99", "MP109", "MP139", "MP169", "MP199"].map((plan) => (
                    <button
                      key={plan}
                      onClick={() => setFreeDevicePlan(plan)}
                      className={`rounded-xl border px-1 py-2 text-[10px] font-medium transition ${
                        freeDevicePlan === plan
                          ? "border-[#00D46A] bg-[#00D46A] text-black"
                          : "border-white/8 bg-transparent text-slate-400 hover:text-white"
                      }`}
                    >
                      {plan}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-slate-500">
                {freeDeviceResults.length} free device{freeDeviceResults.length !== 1 ? "s" : ""} on {freeDevicePlan}
              </div>

              <div className="max-h-[calc(100vh-300px)] space-y-2 overflow-y-auto pr-1">
                {freeDeviceResults.map(({ brand, model, storage }, i) => (
                  <button
                    key={`free-${brand}-${model.model}-${storage.storage}-${i}`}
                    onClick={() => navigateToDevice(brand, model, storage.storage, "upfront")}
                    className="w-full rounded-xl border border-white/8 bg-[#181c1f] p-3 text-left transition hover:border-white/15 hover:bg-[#1e2225]"
                  >
                    <div className="text-xs font-semibold text-white">{model.model}</div>
                    <div className="mt-0.5 text-[10px] text-slate-500">{brand} · {storage.storage}</div>
                    {storage.promo && (
                      <div className="mt-1 text-[10px] text-amber-400/80">{storage.promo}</div>
                    )}
                  </button>
                ))}
                {freeDeviceResults.length === 0 && (
                  <div className="rounded-xl border border-white/8 p-4 text-center text-sm text-slate-500">
                    No free devices on {freeDevicePlan}
                  </div>
                )}
              </div>
            </div>
          ) : budgetMode ? (
            /* Budget Filter Mode */
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#00D46A]">
                  💰 Budget Filter
                </div>
                <button
                  onClick={() => { setBudgetMode(false); setBudgetMax(""); }}
                  className="text-xs text-slate-500 transition hover:text-white"
                >
                  ✕ Close
                </button>
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-slate-400">
                  {budgetTab === "upfront" ? "Max total upfront (RM)" : "Max monthly (RM)"}
                </label>
                <input
                  type="number"
                  placeholder={budgetTab === "upfront" ? "e.g. 500" : "e.g. 100"}
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  autoFocus
                  className="w-full rounded-xl border border-white/10 bg-[#1e2225] px-3 py-2 text-sm text-white placeholder-slate-600 transition focus:border-[#00D46A]/50 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {(["upfront", "zero24", "zero36"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setBudgetTab(tab); setBudgetMax(""); }}
                    className={`rounded-xl border px-1.5 py-2 text-[10px] font-medium transition ${
                      budgetTab === tab
                        ? "border-[#00D46A] bg-[#00D46A] text-black"
                        : "border-white/8 bg-transparent text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab === "upfront" ? "Upfront" : tab === "zero24" ? "Zero 24M" : "Zero 36M"}
                  </button>
                ))}
              </div>

              {budgetMax && Number(budgetMax) > 0 && (
                <div className="text-xs text-slate-500">
                  {budgetResults.filter((r) => !r.stretch).length} within ·{" "}
                  {budgetResults.filter((r) => r.stretch).length} stretch
                </div>
              )}

              <div className="max-h-[calc(100vh-300px)] space-y-2 overflow-y-auto pr-1">
                {/* Within budget phones */}
                {budgetResults.filter((r) => !r.stretch).map((result, i) => (
                  <BudgetCard
                    key={`within-${result.brand}-${result.model.model}-${result.storage.storage}-${i}`}
                    result={result}
                    budgetTab={budgetTab}
                    onSelect={() =>
                      navigateToDevice(result.brand, result.model, result.storage.storage, budgetTab)
                    }
                  />
                ))}

                {/* Stretch upsell phones */}
                {budgetResults.some((r) => r.stretch) && (
                  <>
                    <div className="flex items-center gap-2 pt-1">
                      <div className="h-px flex-1 bg-white/8" />
                      <span className="text-[10px] font-medium text-amber-400/80">
                        ✨ Stretch a little
                      </span>
                      <div className="h-px flex-1 bg-white/8" />
                    </div>
                    {budgetResults.filter((r) => r.stretch).map((result, i) => (
                      <BudgetCard
                        key={`stretch-${result.brand}-${result.model.model}-${result.storage.storage}-${i}`}
                        result={result}
                        budgetTab={budgetTab}
                        onSelect={() =>
                          navigateToDevice(result.brand, result.model, result.storage.storage, budgetTab)
                        }
                      />
                    ))}
                  </>
                )}

                {budgetMax && Number(budgetMax) > 0 && budgetResults.length === 0 && (
                  <div className="rounded-xl border border-white/8 p-4 text-center text-sm text-slate-500">
                    No phones found near RM{budgetMax}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Normal Brand/Model Mode */
            <>
              {/* ── Brand section ─────────────────────────────────────── */}
              {brandExpanded ? (
                <section className="mb-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      ① Brand
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setFreeDeviceMode(true)}
                        className="rounded-lg border border-white/10 bg-[#1e2225] px-2 py-1 text-[10px] font-medium text-slate-400 transition hover:border-[#00D46A]/30 hover:text-[#00D46A]"
                      >
                        🎁 Free Device
                      </button>
                      <button
                        onClick={() => setBudgetMode(true)}
                        className="rounded-lg border border-white/10 bg-[#1e2225] px-2 py-1 text-[10px] font-medium text-slate-400 transition hover:border-[#00D46A]/30 hover:text-[#00D46A]"
                      >
                        💰 Budget
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                    {catalog.map((brand) => {
                      const active = brand.brand === selectedBrand;
                      return (
                        <button
                          key={brand.brand}
                          onClick={() => chooseBrand(brand.brand)}
                          className={`rounded-xl border px-3 py-3 text-left transition ${
                            active
                              ? "border-[#00D46A] bg-[#00D46A] text-black"
                              : "border-white/8 bg-transparent text-slate-300 hover:border-white/15 hover:bg-[#181c1f] hover:text-white"
                          }`}
                        >
                          <div className="truncate text-sm font-semibold">{brand.brand}</div>
                          <div className={`mt-1 text-xs ${active ? "text-black/70" : "text-slate-500"}`}>
                            {brand.models.length} models
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : (
                <section className="mb-3">
                  <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-600">
                    ① Brand
                  </div>
                  <button
                    onClick={() => setBrandExpanded(true)}
                    className="flex w-full items-center justify-between rounded-xl border border-[#00D46A]/30 bg-[#00D46A]/8 px-3 py-2.5 transition hover:border-[#00D46A]/50 hover:bg-[#00D46A]/12"
                  >
                    <span className="text-sm font-semibold text-white">{selectedBrand}</span>
                    <span className="text-[10px] font-medium text-[#00D46A]/70">change ↕</span>
                  </button>
                </section>
              )}

              {/* ── Model section ─────────────────────────────────────── */}
              {modelExpanded ? (
                <section>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      ② Model
                    </div>
                    <div className="text-xs text-slate-500">{activeBrand.models.length}</div>
                  </div>

                  <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                    {activeBrand.models.map((model) => {
                      const active = model.model === selectedModel.model;
                      return (
                        <button
                          key={model.model}
                          onClick={() => chooseModel(model)}
                          className={`block w-full rounded-xl border px-3 py-3 text-left transition ${
                            active
                              ? "border-[#00D46A]/40 bg-[#00D46A]/10"
                              : "border-white/8 bg-transparent hover:border-white/15 hover:bg-[#181c1f]"
                          }`}
                        >
                          <div className="text-sm font-medium text-white">{model.model}</div>
                          <div className="mt-1 text-xs text-slate-500">
                            {model.storages.map((s) => s.storage).join(" · ")}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : (
                <section>
                  <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-600">
                    ② Model
                  </div>
                  <button
                    onClick={() => setModelExpanded(true)}
                    className="flex w-full items-center justify-between rounded-xl border border-[#00D46A]/30 bg-[#00D46A]/8 px-3 py-2.5 transition hover:border-[#00D46A]/50 hover:bg-[#00D46A]/12"
                  >
                    <div className="min-w-0 flex-1 text-left">
                      <div className="truncate text-sm font-semibold text-white">
                        {selectedModel.model}
                      </div>
                      <div className="mt-0.5 text-xs text-[#00D46A]/60">
                        {activeStorage.storage}
                      </div>
                    </div>
                    <span className="ml-3 flex-shrink-0 text-[10px] font-medium text-[#00D46A]/70">
                      change ↕
                    </span>
                  </button>
                </section>
              )}
            </>
          )}
        </aside>

        {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
        <section className="space-y-4 p-3 pb-32 lg:row-start-2 lg:p-5 lg:pb-5">
          <div className="rounded-2xl border border-white/8 bg-[#111417] p-5">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
              {selectedBrand}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {selectedModel.model}
            </h1>

            <div className="mt-4 flex flex-wrap gap-2">
              <InfoChip text={`Storage: ${activeStorage.storage}`} />
              <InfoChip text={`RRP: ${formatMoney(activeStorage.rrp)}`} />
              <InfoChip text="Region: ECEM" />
              {isHotDeal && (
                <span className="rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1.5 text-sm font-bold text-red-400">
                  🔥 HOT DEAL
                </span>
              )}
            </div>
            {activeStorage.promo && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-400/20 bg-amber-400/8 px-3 py-2">
                <span className="mt-0.5 text-sm">🔥</span>
                <p className="text-xs font-medium text-amber-300">{activeStorage.promo}</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#111417] p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Storage
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedModel.storages.map((storage) => {
                const active = storage.storage === selectedStorage;
                return (
                  <button
                    key={storage.storage}
                    onClick={() => {
                      setSelectedStorage(storage.storage);
                      setSelectedPlan(getBestDefaultPlan(selectedModel, storage.storage, selectedTab));
                      setPricingExpanded(true);
                    }}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "border-[#00D46A] bg-[#00D46A] text-black"
                        : "border-white/8 bg-[#181c1f] text-slate-300 hover:border-white/15 hover:text-white"
                    }`}
                  >
                    {storage.storage}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl border-l-4 border-[#00D46A] bg-[#181c1f] px-4 py-3 text-sm text-slate-300">
              {activeStorage.notes || "Use ECEM pricing shown below."}
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#111417] p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Pricing mode
            </div>

            <div className="grid grid-cols-3 gap-2">
              {pricingTabs.map((tab) => {
                const active = tab.key === selectedTab;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setSelectedTab(tab.key);
                      setSelectedPlan(getBestDefaultPlan(selectedModel, selectedStorage, tab.key));
                      setPricingExpanded(true);
                    }}
                    className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                      active
                        ? "border-[#00D46A] bg-[#00D46A] text-black"
                        : "border-white/8 bg-[#181c1f] text-slate-300 hover:border-white/15 hover:text-white"
                    }`}
                  >
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.short}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Plan section (collapsible) ──────────────────────────────── */}
          <div ref={planSectionRef}>

          {/* Collapsed plan view */}
          {!pricingExpanded && selectedRow && (
            <button
              onClick={() => setPricingExpanded(true)}
              className="flex w-full items-center justify-between rounded-2xl border border-[#00D46A]/30 bg-[#00D46A]/8 px-5 py-4 text-left transition hover:border-[#00D46A]/50 hover:bg-[#00D46A]/12"
            >
              <div>
                <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-600">
                  ③ Plan
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xl font-bold text-white">{selectedPlan}</span>
                  {selectedPlan === "MP48" && (
                    <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
                      Shareline
                    </span>
                  )}
                  <span className="text-xs text-slate-500">·</span>
                  <span className="text-sm text-slate-400">
                    {pricingTabs.find((t) => t.key === selectedTab)?.label}
                  </span>
                </div>
                <div className="mt-1.5 text-base font-bold text-[#00D46A]">
                  {selectedTab === "upfront"
                    ? (() => {
                        const r = selectedRow as {
                          devicePrice?: number | string;
                          totalUpfront?: number | string;
                        };
                        return r.devicePrice !== "NA"
                          ? `${formatMoney(r.devicePrice)} device · ${formatMoney(r.totalUpfront)} total`
                          : "NA";
                      })()
                    : (() => {
                        const r = selectedRow as { monthly?: number | string };
                        if (r.monthly === "NA" || r.monthly === undefined) return "NA";
                        const m = Number(r.monthly);
                        const total = planFee(selectedPlan) + m;
                        return `RM${m}/mo device · RM${total}/mo total`;
                      })()}
                </div>
              </div>
              <span className="ml-4 flex-shrink-0 text-[10px] font-medium text-[#00D46A]/70">
                change ↕
              </span>
            </button>
          )}

          {/* ── Expanded plan pricing table ──────────────────────────────── */}
          {pricingExpanded && (
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#111417]">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
              <div className="text-sm font-semibold text-white">③ Plan pricing</div>
              <div className="text-xs text-slate-500">Tap row to select</div>
            </div>

            {regionPricing ? (
              <>
                <div className="grid gap-3 p-3 md:hidden">
                  {(selectedTab === "upfront" ? mpOrder : mpOrderZero).map((mp) => {
                    const row = currentTable?.[mp];
                    const active = mp === selectedPlan;

                    const isUpfront =
                      selectedTab === "upfront" &&
                      row &&
                      (row as { devicePrice?: number | string }).devicePrice !== undefined &&
                      (row as { devicePrice?: number | string }).devicePrice !== "NA";

                    const isMonthly =
                      selectedTab !== "upfront" &&
                      row &&
                      (row as { monthly?: number | string }).monthly !== undefined &&
                      (row as { monthly?: number | string }).monthly !== "NA";

                    return (
                      <button
                        key={mp}
                        onClick={() => { setSelectedPlan(mp); setPricingExpanded(false); }}
                        className={`rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-[#00D46A]/40 bg-[#00D46A]/10"
                            : "border-white/8 bg-[#111417]"
                        }`}
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="text-2xl font-bold text-white">{mp}</div>
                            {mp === "MP48" && (
                              <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">Shareline</span>
                            )}
                            {selectedTab === "upfront" && row && Number((row as { devicePrice?: number | string }).devicePrice) === 0 && (
                              <span className="rounded-full bg-red-400/15 px-2 py-0.5 text-xs font-bold text-red-400">🔥 FREE</span>
                            )}
                            {selectedTab !== "upfront" && row && Number((row as { monthly?: number | string }).monthly) === 0 && (
                              <span className="rounded-full bg-red-400/15 px-2 py-0.5 text-xs font-bold text-red-400">🔥 FREE</span>
                            )}
                          </div>
                          {active && (
                            <span className="rounded-full bg-[#00D46A] px-3 py-1 text-xs font-bold text-black">
                              Selected
                            </span>
                          )}
                        </div>

                        {selectedTab === "upfront" ? (
                          <div className="space-y-3">
                            <StackValue
                              label="Device Price / Upfront"
                              value={
                                isUpfront
                                  ? formatMoney(
                                      (row as { devicePrice?: number | string }).devicePrice
                                    )
                                  : "NA"
                              }
                            />
                            <StackValue
                              label="DAP / ECC"
                              value={
                                isUpfront
                                  ? "dapLabel" in (row || {}) &&
                                    (row as { dapLabel?: string }).dapLabel
                                    ? (row as { dapLabel?: string }).dapLabel || "NA"
                                    : formatMoney((row as { dap?: number | string }).dap)
                                  : "NA"
                              }
                            />
                            <StackValue
                              label="Total Upfront"
                              value={
                                isUpfront
                                  ? formatMoney(
                                      (row as { totalUpfront?: number | string }).totalUpfront
                                    )
                                  : "NA"
                              }
                            />
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <StackValue
                              label="Monthly"
                              value={
                                isMonthly
                                  ? formatMoney((row as { monthly?: number | string }).monthly)
                                  : "NA"
                              }
                            />
                            <StackValue
                              label="DAP / ECC"
                              value={
                                isMonthly
                                  ? "dapLabel" in (row || {}) &&
                                    (row as { dapLabel?: string }).dapLabel
                                    ? (row as { dapLabel?: string }).dapLabel || "NA"
                                    : "Check ECC"
                                  : "NA"
                              }
                            />
                            {isMonthly && (
                              <div className="rounded-xl border border-[#00D46A]/20 bg-[#00D46A]/8 px-4 py-3">
                                <div className="text-sm text-slate-400">Total / month</div>
                                <div className="mt-1 text-lg font-bold text-[#00D46A]">
                                  RM{planFee(mp) + Number((row as { monthly?: number | string }).monthly)}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  RM{planFee(mp)} plan + RM{(row as { monthly?: number | string }).monthly} device
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="hidden overflow-x-auto md:block">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-[#181c1f] text-left">
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                          Plan
                        </th>
                        {selectedTab === "upfront" ? (
                          <>
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                              Device Price
                            </th>
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                              DAP / ECC
                            </th>
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                              Total Upfront
                            </th>
                          </>
                        ) : (
                          <>
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                              Monthly
                            </th>
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                              DAP / ECC
                            </th>
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                              Total / mo
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedTab === "upfront" ? mpOrder : mpOrderZero).map((mp) => {
                        const row = currentTable?.[mp];
                        const active = mp === selectedPlan;

                        const upfrontMissing =
                          !row ||
                          (row as { devicePrice?: number | string }).devicePrice === undefined ||
                          (row as { devicePrice?: number | string }).devicePrice === "NA";

                        const monthlyMissing =
                          !row ||
                          (row as { monthly?: number | string }).monthly === undefined ||
                          (row as { monthly?: number | string }).monthly === "NA";

                        return (
                          <tr
                            key={mp}
                            onClick={() => { setSelectedPlan(mp); setPricingExpanded(false); }}
                            className={`cursor-pointer border-t border-white/8 transition ${
                              active ? "bg-[#00D46A]/10" : "hover:bg-[#181c1f]"
                            }`}
                          >
                            <td className="px-4 py-3 text-sm font-bold text-white">
                              <span>{mp}</span>
                              {mp === "MP48" && (
                                <span className="ml-2 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-normal text-blue-300">Shareline</span>
                              )}
                            </td>

                            {selectedTab === "upfront" ? (
                              <>
                                <td className="px-4 py-3 text-sm">
                                  {upfrontMissing ? (
                                    <span className="text-slate-500">NA</span>
                                  ) : Number((row as { devicePrice?: number | string }).devicePrice) === 0 ? (
                                    <span className="font-bold text-red-400">🔥 FREE</span>
                                  ) : (
                                    <span className="font-semibold text-[#00D46A]">
                                      {formatMoney((row as { devicePrice?: number | string }).devicePrice)}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-300">
                                  {upfrontMissing
                                    ? "NA"
                                    : "dapLabel" in (row || {}) &&
                                      (row as { dapLabel?: string }).dapLabel
                                    ? (row as { dapLabel?: string }).dapLabel || "NA"
                                    : formatMoney((row as { dap?: number | string }).dap)}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-300">
                                  {upfrontMissing
                                    ? "NA"
                                    : formatMoney(
                                        (row as { totalUpfront?: number | string }).totalUpfront
                                      )}
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-4 py-3 text-sm">
                                  {monthlyMissing ? (
                                    <span className="text-slate-500">NA</span>
                                  ) : Number((row as { monthly?: number | string }).monthly) === 0 ? (
                                    <span className="font-bold text-red-400">🔥 FREE</span>
                                  ) : (
                                    <span className="font-semibold text-[#00D46A]">
                                      {formatMoney((row as { monthly?: number | string }).monthly)}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-300">
                                  {monthlyMissing
                                    ? "NA"
                                    : "dapLabel" in (row || {}) &&
                                      (row as { dapLabel?: string }).dapLabel
                                    ? (row as { dapLabel?: string }).dapLabel || "NA"
                                    : "Check ECC"}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-400">
                                  {monthlyMissing
                                    ? "NA"
                                    : `RM${planFee(mp) + Number((row as { monthly?: number | string }).monthly)}`}
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="p-4 text-sm text-amber-300">
                No ECEM pricing available for this configuration.
              </div>
            )}
          </div>
          )}

          </div>{/* end plan section */}

          {/* ── Upgrade Ladder ──────────────────────────────────────────── */}
          {upgradeLadder.length > 1 && (
            <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#111417]">
              <div className="border-b border-white/8 px-4 py-3">
                <div className="text-sm font-semibold text-white">📊 Is it worth going higher?</div>
                <div className="mt-0.5 text-xs text-slate-500">
                  Compare all plans for {selectedModel.model} · cheapest plan is the baseline
                </div>
              </div>
              <div className="divide-y divide-white/5">
                {upgradeLadder.map((row, i) => {
                  const isSelected = row.plan === selectedPlan;
                  const baseline = upgradeLadder[0];
                  const extraVsBase = row.planCost - baseline.planCost;
                  const savedVsBase = baseline.devicePrice - row.devicePrice;
                  const breakEven =
                    extraVsBase > 0 && savedVsBase > 0
                      ? Math.ceil(savedVsBase / extraVsBase)
                      : null;

                  return (
                    <button
                      key={row.plan}
                      onClick={() => { setSelectedPlan(row.plan); setPricingExpanded(false); }}
                      className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition ${
                        isSelected ? "bg-[#00D46A]/8" : "hover:bg-[#181c1f]"
                      }`}
                    >
                      {/* Plan name */}
                      <div className="w-14 flex-shrink-0">
                        <div className={`text-sm font-bold ${isSelected ? "text-[#00D46A]" : "text-white"}`}>
                          {row.plan}
                        </div>
                        {isSelected && (
                          <div className="mt-0.5 text-[9px] font-medium text-[#00D46A]/70">selected</div>
                        )}
                      </div>

                      {/* Device price */}
                      <div className="w-20 flex-shrink-0">
                        {row.isFree ? (
                          <span className="text-sm font-bold text-red-400">FREE</span>
                        ) : (
                          <span className="text-sm font-semibold text-white">RM{row.devicePrice}</span>
                        )}
                        <div className="text-[10px] text-slate-500">device</div>
                      </div>

                      {/* Value insight */}
                      <div className="min-w-0 flex-1">
                        {i === 0 ? (
                          <div className="text-[11px] text-slate-500">baseline</div>
                        ) : savedVsBase > 0 ? (
                          <div className="space-y-0.5">
                            <div className="text-[11px] font-medium text-emerald-400">
                              Save RM{savedVsBase} on device
                            </div>
                            <div className="text-[10px] text-slate-500">
                              +RM{extraVsBase}/mth more than {baseline.plan}
                              {breakEven && breakEven <= 24
                                ? ` · worth it in ${breakEven} months`
                                : ""}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500">
                            +RM{extraVsBase}/mth · same device price
                          </div>
                        )}
                      </div>

                      {/* Badge */}
                      <div className="flex-shrink-0">
                        {row.isFree && savedVsBase > 0 && breakEven && breakEven <= 12 ? (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                            ⭐ Best
                          </span>
                        ) : row.isFree ? (
                          <span className="rounded-full bg-red-400/15 px-2 py-0.5 text-[10px] font-bold text-red-400">
                            🔥 Free
                          </span>
                        ) : breakEven && breakEven <= 8 ? (
                          <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-medium text-blue-300">
                            Good deal
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-white/5 px-4 py-2.5 text-[10px] text-slate-600">
                Tap any row to switch to that plan
              </div>
            </div>
          )}

        </section>

        {/* ── RIGHT SIDEBAR ───────────────────────────────────────────────── */}
        <aside className="space-y-4 border-t border-white/8 bg-[#111417] p-3 pb-28 lg:row-start-2 lg:border-l lg:border-t-0 lg:p-4 lg:pb-4">
          <section>
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Current Selection
            </div>

            <div className="rounded-xl border border-white/8 bg-[#181c1f] p-4">
              <SelectionRow label="Brand" value={selectedBrand} />
              <SelectionRow label="Model" value={selectedModel.model} />
              <SelectionRow label="Storage" value={activeStorage.storage} />
              <SelectionRow
                label="Mode"
                value={pricingTabs.find((t) => t.key === selectedTab)?.label || selectedTab}
              />
              <SelectionRow label="Plan" value={selectedPlan} />
            </div>
          </section>

          {/* Value Tip */}
          {valueTip && (
            <section>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                💡 Better Deal
              </div>
              <div className="rounded-xl border border-blue-400/25 bg-blue-400/8 p-3">
                <p className="text-xs leading-5 text-blue-200">{valueTip.message}</p>
                <button
                  onClick={() => { setSelectedPlan(valueTip.plan); setPricingExpanded(false); }}
                  className="mt-2 w-full rounded-lg bg-blue-500/20 px-3 py-1.5 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/30"
                >
                  Show me {valueTip.plan} pricing →
                </button>
              </div>
            </section>
          )}

          <section>
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Quick Quote
            </div>

            {/* ECC Status */}
            {selectedRow && (
              <div className={`mb-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${
                eccStatus === "none"
                  ? "border-emerald-500/20 bg-emerald-500/8 text-emerald-400"
                  : eccStatus === "high"
                  ? "border-red-500/20 bg-red-500/8 text-red-400"
                  : "border-amber-400/20 bg-amber-400/8 text-amber-300"
              }`}>
                <span>{eccStatus === "none" ? "✅" : eccStatus === "high" ? "🔴" : "⚠️"}</span>
                <span>
                  {eccStatus === "none"
                    ? selectedTab === "upfront"
                      ? "Upfront — no monthly ECC"
                      : "No ECC required"
                    : eccStatus === "high"
                    ? "High ECC — verify carefully"
                    : "ECC required — check eligibility"}
                </span>
              </div>
            )}

            {/* Copy mode picker */}
            <div className="mb-2 grid grid-cols-3 gap-1.5">
              {(["basic", "recommended", "aggressive"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setCopyMode(mode)}
                  className={`rounded-xl border py-2 text-[10px] font-medium transition ${
                    copyMode === mode
                      ? mode === "aggressive"
                        ? "border-red-400/50 bg-red-400/15 text-red-300"
                        : mode === "recommended"
                        ? "border-[#00D46A] bg-[#00D46A] text-black"
                        : "border-white/20 bg-[#2a2f33] text-white"
                      : "border-white/8 bg-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {mode === "basic" ? "Basic" : mode === "recommended" ? "⭐ Smart" : "🔥 Closing"}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-white/8 bg-[#181c1f] p-4">
              <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-slate-300">
                {quoteText || "Select a valid plan to generate quote."}
              </pre>
            </div>

            <button
              onClick={copyQuote}
              disabled={!quoteText}
              className="mt-3 w-full rounded-xl bg-[#00D46A] px-4 py-3 text-sm font-bold text-black transition hover:bg-[#00b85c] disabled:cursor-not-allowed disabled:bg-[#1e2225] disabled:text-slate-500"
            >
              {copyMode === "aggressive" ? "🔥 Copy Closing Message" : copyMode === "recommended" ? "⭐ Copy Smart Quote" : "Copy Quote"}
            </button>
          </section>

          {/* Plan Recommender */}
          {planRecommendations.length > 0 && (
            <section>
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Smart Picks
              </div>
              <div className="space-y-2">
                {planRecommendations.map(({ plan, emoji, reason }) => {
                  const isActive = plan === selectedPlan;
                  return (
                    <button
                      key={plan}
                      onClick={() => { setSelectedPlan(plan); setPricingExpanded(false); }}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition ${
                        isActive
                          ? "border-[#00D46A]/40 bg-[#00D46A]/10"
                          : "border-white/8 bg-[#181c1f] hover:border-white/15 hover:bg-[#1e2225]"
                      }`}
                    >
                      <div>
                        <span className="text-xs font-semibold text-white">{emoji} {plan}</span>
                        <span className="ml-2 text-[10px] text-slate-500">{reason}</span>
                      </div>
                      {isActive && (
                        <span className="text-[10px] font-medium text-[#00D46A]">selected</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Similar Price Phones */}
          {similarPhones.length > 0 && (
            <section>
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Similar Price · {selectedPlan}
              </div>

              <div className="space-y-2">
                {similarPhones.map((phone, i) => {
                  const refPrice =
                    selectedTab === "upfront"
                      ? Number(
                          (selectedRow as { devicePrice?: number | string } | undefined)
                            ?.devicePrice
                        )
                      : Number(
                          (selectedRow as { monthly?: number | string } | undefined)?.monthly
                        );
                  const diff = phone.price - refPrice;
                  const diffLabel =
                    diff === 0
                      ? "Same"
                      : diff > 0
                      ? `+RM${diff}`
                      : `-RM${Math.abs(diff)}`;
                  const diffColor =
                    diff === 0
                      ? "text-slate-400"
                      : diff > 0
                      ? "text-red-400"
                      : "text-emerald-400";

                  return (
                    <button
                      key={`${phone.brand}-${phone.model.model}-${phone.storage.storage}-${i}`}
                      onClick={() =>
                        navigateToDevice(phone.brand, phone.model, phone.storage.storage)
                      }
                      className="block w-full rounded-xl border border-white/8 bg-[#181c1f] px-3 py-3 text-left transition hover:border-white/15 hover:bg-[#1e2225]"
                    >
                      <div className="truncate text-sm font-medium text-white">
                        {phone.model.model}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {phone.storage.storage} · {phone.brand}
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-[#00D46A]">
                          {selectedTab === "upfront"
                            ? `RM${phone.price}`
                            : `RM${phone.price}/mo`}
                        </span>
                        <span className={`text-xs font-medium ${diffColor}`}>{diffLabel}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <section className="rounded-xl border border-white/8 bg-[#181c1f] p-4">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Flow
            </div>
            <div className="space-y-2 text-sm text-slate-300">
              <div>① Choose brand</div>
              <div>② Tap model</div>
              <div>③ Select storage</div>
              <div>④ Pick pricing mode</div>
              <div>⑤ Click plan → Copy</div>
            </div>
          </section>
        </aside>
      </div>

      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/90 px-3 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">
              {selectedModel.model} · {selectedPlan}
            </div>
            <div className="truncate text-xs text-slate-400">
              {activeStorage.storage} · {pricingTabs.find((t) => t.key === selectedTab)?.short}
            </div>
          </div>

          <button
            onClick={copyQuote}
            disabled={!quoteText}
            className={`rounded-2xl px-4 py-3 text-sm font-bold text-black disabled:opacity-50 ${
              copyMode === "aggressive" ? "bg-red-400" : "bg-[#00D46A]"
            }`}
          >
            {copyMode === "aggressive" ? "🔥 Copy" : copyMode === "recommended" ? "⭐ Copy" : "Copy"}
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed right-4 top-4 z-50 rounded-xl border border-[#00D46A]/30 bg-[#00D46A]/15 px-4 py-3 text-sm font-semibold text-[#00D46A] shadow-2xl">
          {toast} ✓
        </div>
      )}
    </main>
  );
}

function BudgetCard({
  result,
  budgetTab,
  onSelect,
}: {
  result: BudgetResult;
  budgetTab: "upfront" | "zero24" | "zero36";
  onSelect: () => void;
}) {
  const priceLabel =
    budgetTab === "upfront"
      ? `RM${result.bestMonthly} total`
      : `RM${result.bestMonthly}/mo`;

  return (
    <button
      onClick={onSelect}
      className={`block w-full rounded-xl border px-3 py-3 text-left transition hover:bg-[#181c1f] ${
        result.stretch
          ? "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/30"
          : "border-white/8 bg-transparent hover:border-white/15"
      }`}
    >
      <div className="truncate text-sm font-medium text-white">{result.model.model}</div>
      <div className="mt-0.5 text-xs text-slate-500">
        {result.storage.storage} · {result.brand}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-slate-400">{result.bestPlan}</span>
        <span className={`text-sm font-bold ${result.stretch ? "text-amber-400" : "text-[#00D46A]"}`}>
          {priceLabel}
        </span>
      </div>
    </button>
  );
}

function InfoChip({ text }: { text: string }) {
  return (
    <span className="rounded-full border border-white/8 bg-[#181c1f] px-3 py-1.5 text-sm text-slate-300">
      {text}
    </span>
  );
}

function StackValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-[#181c1f] px-4 py-3">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function SelectionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/8 py-2 last:border-b-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-right text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
