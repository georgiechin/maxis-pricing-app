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

const hotlinkTabs: { key: PricingMode; label: string; short: string }[] = [
  { key: "hotlink12", label: "12 months", short: "12M" },
  { key: "hotlink24", label: "24 months", short: "24M" },
];

const mpOrder = ["MP69", "MP89", "MP99", "MP109", "MP139", "MP169", "MP199"];
const mpOrderZero = ["MP48", "MP69", "MP89", "MP99", "MP109", "MP139", "MP169", "MP199"];
const hpOrder = ["HP45", "HP65", "HP75"];

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

type CopyMode = "recommended" | "aggressive";

type BudgetResult = {
  brand: string;
  model: CatalogModel;
  storage: CatalogStorage;
  bestPlan: string;
  bestMonthly: number;
  stretch: boolean; // true = slightly above budget (upsell)
};

type UpsellItem = { brand: string; model: CatalogModel; storage: CatalogStorage; devicePrice: number; isFree: boolean };
type UpsellTier = {
  plan: string;
  extraMonthly: number;
  newFree: UpsellItem[];
  newOther: UpsellItem[];
  savingsHighlight: { item: UpsellItem; saving: number; wasPrice: number }[];
};


export default function Page() {
  const [selectedBrand, setSelectedBrand] = useState<CatalogBrand["brand"]>(catalog[0].brand);
  const [selectedModel, setSelectedModel] = useState<CatalogModel>(catalog[0].models[0]);
  const [selectedStorage, setSelectedStorage] = useState(
    catalog[0].models[0].storages[0].storage
  );
  const [selectedRegion, setSelectedRegion] = useState<"ECEM" | "HOTLINK">("ECEM");
  const [selectedTab, setSelectedTab] = useState<PricingMode>("upfront");
  const [selectedPlan, setSelectedPlan] = useState("MP69");
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

  // Favourites (persisted to localStorage)
  const [favourites, setFavourites] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("maxis-favs") || "[]"); } catch { return []; }
  });
  const toggleFavourite = (modelName: string) => {
    setFavourites((prev) => {
      const next = prev.includes(modelName) ? prev.filter((m) => m !== modelName) : [...prev, modelName];
      localStorage.setItem("maxis-favs", JSON.stringify(next));
      return next;
    });
  };

  // By Plan filter
  const [byPlanMode, setByPlanMode] = useState(false);
  const [byPlanSelected, setByPlanSelected] = useState("MP99");

  // Upsell Advisor
  const [upsellMode, setUpsellMode] = useState(false);
  const [upsellBasePlan, setUpsellBasePlan] = useState("MP99");
  const [expandedUpsellTier, setExpandedUpsellTier] = useState<string | null>(null);

  // Context breadcrumb — tracks where user navigated from so main area can show context
  const [lastModeContext, setLastModeContext] = useState<{ mode: string; plan: string; label: string } | null>(null);

  // Compare mode
  type CompareDevice = { brand: string; model: CatalogModel; storage: CatalogStorage };
  const [compareA, setCompareA] = useState<CompareDevice | null>(null);
  const [compareB, setCompareB] = useState<CompareDevice | null>(null);
  const [showCompare, setShowCompare] = useState(false);

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

  const hasECEM = !!activeStorage.regions.ECEM;
  const hasHotlink = !!activeStorage.regions.HOTLINK;
  const isHotlink = selectedRegion === "HOTLINK";
  const regionPricing = (isHotlink ? activeStorage.regions.HOTLINK : activeStorage.regions.ECEM) || null;
  const activeTabs = isHotlink ? hotlinkTabs : pricingTabs;
  const activePlanOrder = isHotlink ? hpOrder : (selectedTab === "upfront" ? mpOrder : mpOrderZero);
  const currentTable = regionPricing ? regionPricing[selectedTab] : null;
  const selectedRow = currentTable?.[selectedPlan];

  const getBestDefaultPlan = (
    model: CatalogModel,
    storageName: string,
    mode: PricingMode,
    region: "ECEM" | "HOTLINK" = "ECEM"
  ) => {
    const storage = model.storages.find((s) => s.storage === storageName) || model.storages[0];
    const table = (region === "HOTLINK" ? storage.regions.HOTLINK : storage.regions.ECEM)?.[mode];
    if (!table) return region === "HOTLINK" ? "HP75" : "MP69";
    const preferredOrder = region === "HOTLINK" ? ["HP75", "HP65", "HP45"] : ["MP69", "MP89", "MP99", "MP109", "MP139", "MP169", "MP199"];
    for (const plan of preferredOrder) {
      const row = table[plan];
      if (!row) continue;
      if (mode === "upfront" || mode === "hotlink12" || mode === "hotlink24") {
        const price = (row as { devicePrice?: number | string }).devicePrice;
        if (price !== undefined && price !== "NA") return plan;
      } else {
        const monthly = (row as { monthly?: number | string }).monthly;
        if (monthly !== undefined && monthly !== "NA") return plan;
      }
    }
    return region === "HOTLINK" ? "HP75" : "MP69";
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
  const freeDeviceResults = useMemo((): { brand: string; model: CatalogModel; storage: CatalogStorage; isHotlink?: boolean; contractTerm?: string; hotlinkTab?: PricingMode }[] => {
    if (!freeDeviceMode) return [];
    const results: { brand: string; model: CatalogModel; storage: CatalogStorage; isHotlink?: boolean; contractTerm?: string; hotlinkTab?: PricingMode }[] = [];
    const isHotlinkPlan = freeDevicePlan.startsWith("HP");
    for (const brand of catalog) {
      for (const model of brand.models) {
        for (const storage of model.storages) {
          if (isHotlinkPlan) {
            // Search both hotlink12 and hotlink24 for free devices
            const region = storage.regions.HOTLINK;
            if (!region) continue;
            let found = false;
            let contractTerm = "";
            let hotlinkTab: PricingMode = "hotlink12";
            const t12 = region.hotlink12?.[freeDevicePlan];
            if (t12 && Number(t12.devicePrice) === 0) { found = true; contractTerm = "12M"; hotlinkTab = "hotlink12"; }
            const t24 = region.hotlink24?.[freeDevicePlan];
            if (t24 && Number(t24.devicePrice) === 0) { found = true; contractTerm = contractTerm ? "12M/24M" : "24M"; hotlinkTab = "hotlink24"; }
            if (found) results.push({ brand: brand.brand, model, storage, isHotlink: true, contractTerm, hotlinkTab });
          } else {
            const table = storage.regions.ECEM?.upfront;
            if (!table) continue;
            const row = table[freeDevicePlan];
            if (row && Number(row.devicePrice) === 0) {
              results.push({ brand: brand.brand, model, storage });
            }
          }
        }
      }
    }
    return results;
  }, [freeDeviceMode, freeDevicePlan]);

  // ── By Plan results ────────────────────────────────────────────────────────
  type ByPlanResult = { brand: string; model: CatalogModel; storage: CatalogStorage; devicePrice: number; isFree: boolean; isHotlinkResult?: boolean; contractTerm?: string };
  const byPlanResults = useMemo((): ByPlanResult[] => {
    if (!byPlanMode) return [];
    const isHP = byPlanSelected.startsWith("HP");
    const results: ByPlanResult[] = [];
    for (const brand of catalog) {
      for (const model of brand.models) {
        for (const storage of model.storages) {
          if (isHP) {
            // Search Hotlink region — check both 12M and 24M, pick lowest device price
            let bestPrice = Infinity;
            let bestTerm = "12M";
            for (const [mode, term] of [["hotlink12", "12M"], ["hotlink24", "24M"]] as const) {
              const row = storage.regions.HOTLINK?.[mode]?.[byPlanSelected];
              if (!row) continue;
              const dp = (row as { devicePrice?: number | string }).devicePrice;
              if (dp === undefined || dp === "NA") continue;
              const price = Number(dp);
              if (!isNaN(price) && price < bestPrice) { bestPrice = price; bestTerm = term; }
            }
            if (bestPrice !== Infinity) {
              results.push({ brand: brand.brand, model, storage, devicePrice: bestPrice, isFree: bestPrice === 0, isHotlinkResult: true, contractTerm: bestTerm });
            }
          } else {
            const row = storage.regions.ECEM?.upfront?.[byPlanSelected];
            if (!row) continue;
            const dp = (row as { devicePrice?: number | string }).devicePrice;
            if (dp === undefined || dp === "NA") continue;
            const price = Number(dp);
            if (isNaN(price)) continue;
            results.push({ brand: brand.brand, model, storage, devicePrice: price, isFree: price === 0 });
          }
        }
      }
    }
    return results.sort((a, b) => a.devicePrice - b.devicePrice);
  }, [byPlanMode, byPlanSelected]);

  // ── By Plan upgrade tips (next 2 plan tiers) ────────────────────────────────
  const byPlanUpgradeTips = useMemo(() => {
    if (!byPlanMode || byPlanSelected.startsWith("HP")) return [];
    const idx = mpOrder.indexOf(byPlanSelected);
    const nextPlans = mpOrder.slice(idx + 1, idx + 3);
    return nextPlans.map(plan => {
      let becomeFreeCount = 0; let newDeviceCount = 0; let newFreeCount = 0;
      for (const brand of catalog) {
        for (const model of brand.models) {
          for (const storage of model.storages) {
            const dp = (storage.regions.ECEM?.upfront?.[plan] as { devicePrice?: number | string } | undefined)?.devicePrice;
            if (dp === undefined || dp === "NA") continue;
            const thisPrice = Number(dp);
            if (isNaN(thisPrice)) continue;
            const baseDp = (storage.regions.ECEM?.upfront?.[byPlanSelected] as { devicePrice?: number | string } | undefined)?.devicePrice;
            if (baseDp === undefined || baseDp === "NA") {
              newDeviceCount++;
              if (thisPrice === 0) newFreeCount++;
            } else if (thisPrice === 0 && Number(baseDp) > 0) {
              becomeFreeCount++;
            }
          }
        }
      }
      return { plan, extra: planFee(plan) - planFee(byPlanSelected), becomeFreeCount, newFreeCount, newDeviceCount };
    });
  }, [byPlanMode, byPlanSelected]);

  // ── Upsell Advisor data ─────────────────────────────────────────────────────
  const upsellData = useMemo((): { currentDevices: UpsellItem[]; tiers: UpsellTier[] } | null => {
    if (!upsellMode) return null;
    const basePlanIdx = mpOrder.indexOf(upsellBasePlan);
    if (basePlanIdx < 0) return null;

    // Build base-plan price map
    const baseMap = new Map<string, number>();
    for (const brand of catalog) {
      for (const model of brand.models) {
        for (const storage of model.storages) {
          const dp = (storage.regions.ECEM?.upfront?.[upsellBasePlan] as { devicePrice?: number | string } | undefined)?.devicePrice;
          if (dp === undefined || dp === "NA") continue;
          const price = Number(dp);
          if (!isNaN(price)) baseMap.set(`${brand.brand}|${model.model}|${storage.storage}`, price);
        }
      }
    }

    // Current devices at base plan (sorted cheapest first)
    const currentDevices: UpsellItem[] = [];
    for (const brand of catalog) {
      for (const model of brand.models) {
        for (const storage of model.storages) {
          const key = `${brand.brand}|${model.model}|${storage.storage}`;
          const price = baseMap.get(key);
          if (price !== undefined) currentDevices.push({ brand: brand.brand, model, storage, devicePrice: price, isFree: price === 0 });
        }
      }
    }
    currentDevices.sort((a, b) => a.devicePrice - b.devicePrice);

    // Build incremental upgrade tiers
    const introducedKeys = new Set<string>(baseMap.keys());
    const tiers: UpsellTier[] = [];

    for (let i = basePlanIdx + 1; i < mpOrder.length; i++) {
      const plan = mpOrder[i];
      const extraMonthly = planFee(plan) - planFee(upsellBasePlan);
      const newFree: UpsellItem[] = [];
      const newOther: UpsellItem[] = [];
      const savingsHighlight: { item: UpsellItem; saving: number; wasPrice: number }[] = [];

      for (const brand of catalog) {
        for (const model of brand.models) {
          for (const storage of model.storages) {
            const dp = (storage.regions.ECEM?.upfront?.[plan] as { devicePrice?: number | string } | undefined)?.devicePrice;
            if (dp === undefined || dp === "NA") continue;
            const newPrice = Number(dp);
            if (isNaN(newPrice)) continue;
            const key = `${brand.brand}|${model.model}|${storage.storage}`;
            const basePrice = baseMap.get(key);
            if (!introducedKeys.has(key)) {
              introducedKeys.add(key);
              const item: UpsellItem = { brand: brand.brand, model, storage, devicePrice: newPrice, isFree: newPrice === 0 };
              if (newPrice === 0) newFree.push(item);
              else newOther.push(item);
            } else if (basePrice !== undefined && newPrice < basePrice && (basePrice - newPrice >= 100 || newPrice === 0)) {
              savingsHighlight.push({ item: { brand: brand.brand, model, storage, devicePrice: newPrice, isFree: newPrice === 0 }, saving: basePrice - newPrice, wasPrice: basePrice });
            }
          }
        }
      }

      savingsHighlight.sort((a, b) => b.saving - a.saving);
      newFree.sort((a, b) => a.storage.rrp - b.storage.rrp);
      newOther.sort((a, b) => a.devicePrice - b.devicePrice);

      tiers.push({ plan, extraMonthly, newFree, newOther, savingsHighlight });
    }

    return { currentDevices, tiers };
  }, [upsellMode, upsellBasePlan]);

  // ── Total contract cost ─────────────────────────────────────────────────────
  const totalContractCost = useMemo((): string | null => {
    if (!selectedRow) return null;
    const fee = planFee(selectedPlan);
    // Hotlink: devicePrice (true cost) + monthly × contract months
    if (selectedTab === "hotlink12" || selectedTab === "hotlink24") {
      const months = selectedTab === "hotlink12" ? 12 : 24;
      const dp = (selectedRow as { devicePrice?: number | string }).devicePrice;
      const mo = (selectedRow as { monthly?: number | string }).monthly;
      if (dp === undefined || mo === undefined) return null;
      const d = Number(dp);
      const m = Number(mo);
      if (isNaN(d) || isNaN(m)) return null;
      return `RM${(d + m * months).toLocaleString()} over ${months} months`;
    }
    if (selectedTab === "upfront") {
      // Use devicePrice (not totalUpfront) — DAP is a deposit that comes back
      const dp = (selectedRow as { devicePrice?: number | string }).devicePrice;
      if (dp === undefined || dp === "NA") return null;
      const d = Number(dp);
      if (isNaN(d)) return null;
      return `RM${(d + fee * 24).toLocaleString()} over 24 months (excl. DAP deposit)`;
    }
    const months = selectedTab === "zero24" ? 24 : 36;
    const monthly = (selectedRow as { monthly?: number | string }).monthly;
    if (monthly === undefined || monthly === "NA") return null;
    const m = Number(monthly);
    if (isNaN(m)) return null;
    return `RM${((fee + m) * months).toLocaleString()} over ${months} months`;
  }, [selectedRow, selectedTab, selectedPlan]);

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


  // ── Upgrade ladder (upfront mode only) ─────────────────────────────────────
  type LadderRow = { plan: string; planCost: number; devicePrice: number; cashToday: number; isFree: boolean };
  const upgradeLadder = useMemo((): LadderRow[] => {
    if (!currentTable || selectedTab !== "upfront") return [];
    const rows: LadderRow[] = [];
    for (const plan of mpOrder) {
      const row = currentTable[plan];
      if (!row) continue;
      const dp = (row as { devicePrice?: number | string }).devicePrice;
      const tu = (row as { totalUpfront?: number | string }).totalUpfront;
      if (dp === undefined || dp === "NA") continue;
      const price = Number(dp);
      const cash = Number(tu);
      if (isNaN(price)) continue;
      rows.push({ plan, planCost: planFee(plan), devicePrice: price, cashToday: isNaN(cash) ? price : cash, isFree: price === 0 });
    }
    return rows;
  }, [currentTable, selectedTab]);

  // Value tip — show next plan where device price drops meaningfully
  const valueTip = useMemo((): { plan: string; message: string } | null => {
    if (upgradeLadder.length < 2) return null;
    const currentIdx = upgradeLadder.findIndex((r) => r.plan === selectedPlan);
    if (currentIdx < 0) return null;
    const current = upgradeLadder[currentIdx];
    for (let i = currentIdx + 1; i < upgradeLadder.length; i++) {
      const next = upgradeLadder[i];
      const extraPerMonth = next.planCost - current.planCost;
      const deviceSaving = current.devicePrice - next.devicePrice;
      if (deviceSaving <= 0) continue;
      const cashDiff = Math.abs(next.cashToday - current.cashToday);
      const sameCash = cashDiff <= 20; // within RM20 = effectively same
      if (next.isFree) {
        return {
          plan: next.plan,
          message: sameCash
            ? `${next.plan} — phone is FREE. Same cash today (RM${next.cashToday}). Just RM${extraPerMonth} more per month.`
            : `${next.plan} — phone is FREE. RM${next.cashToday} today. RM${extraPerMonth} more per month.`,
        };
      }
      if (deviceSaving >= 50) {
        return {
          plan: next.plan,
          message: sameCash
            ? `${next.plan} — phone drops RM${deviceSaving} to RM${next.devicePrice}. Same cash today. RM${extraPerMonth} more per month.`
            : `${next.plan} — phone drops RM${deviceSaving} to RM${next.devicePrice}. RM${extraPerMonth} more per month.`,
        };
      }
    }
    return null;
  }, [upgradeLadder, selectedPlan]);


  // ── Navigation helpers ──────────────────────────────────────────────────────
  const navigateToDevice = (
    brand: string,
    model: CatalogModel,
    storageName?: string,
    tab?: PricingMode,
    targetPlan?: string,         // explicit plan to show (from By Plan / Budget / Free Device)
    modeContext?: { mode: string; plan: string; label: string } | null  // breadcrumb context
  ) => {
    const targetStorage = storageName || model.storages[0].storage;
    const storage = model.storages.find(s => s.storage === targetStorage) || model.storages[0];
    // Auto-detect region: if device has no ECEM, use HOTLINK
    const targetRegion = storage.regions.ECEM ? "ECEM" : "HOTLINK";
    const targetTab = tab || (targetRegion === "HOTLINK" ? "hotlink12" : selectedTab);
    // Use explicit plan if provided; fall back to auto-detect
    const resolvedPlan = targetPlan || getBestDefaultPlan(model, targetStorage, targetTab, targetRegion);
    setSelectedRegion(targetRegion);
    setSelectedBrand(brand);
    setSelectedModel(model);
    setSelectedStorage(targetStorage);
    setSelectedTab(targetTab);
    setSelectedPlan(resolvedPlan);
    setSearchQuery("");
    setBudgetMode(false);
    setByPlanMode(false);
    setUpsellMode(false);
    setLastModeContext(modeContext !== undefined ? modeContext : null);
    setBrandExpanded(false);
    setModelExpanded(false);
    setPricingExpanded(true);
  };

  const pinToCompare = () => {
    const storage = selectedModel.storages.find((s) => s.storage === selectedStorage) || selectedModel.storages[0];
    const device: CompareDevice = { brand: selectedBrand, model: selectedModel, storage };
    if (!compareA) {
      setCompareA(device);
      setToast("Pinned A — now pick device B");
    } else if (!compareB) {
      setCompareB(device);
      setShowCompare(true);
    } else {
      setCompareA(device);
      setCompareB(null);
      setShowCompare(false);
      setToast("Pinned A — now pick device B");
    }
  };

  const chooseBrand = (brand: CatalogBrand["brand"]) => {
    const nextBrand = catalog.find((b) => b.brand === brand) || catalog[0];
    const nextModel = nextBrand.models[0];
    const nextStorage = nextModel.storages[0];
    const targetRegion = nextStorage.regions.ECEM ? "ECEM" : "HOTLINK";
    const targetTab: PricingMode = targetRegion === "HOTLINK" ? "hotlink12" : "upfront";

    setSelectedBrand(nextBrand.brand);
    setSelectedModel(nextModel);
    setSelectedStorage(nextStorage.storage);
    setSelectedRegion(targetRegion);
    setSelectedTab(targetTab);
    setSelectedPlan(getBestDefaultPlan(nextModel, nextStorage.storage, targetTab, targetRegion));
    setSearchQuery("");
    setBudgetMode(false);
    setBrandExpanded(false);
    setModelExpanded(true);
    setPricingExpanded(true);
  };

  const chooseModel = (model: CatalogModel) => {
    const nextStorage = model.storages[0].storage;
    const storage = model.storages[0];
    const targetRegion = storage.regions.ECEM ? "ECEM" : "HOTLINK";
    const targetTab: PricingMode = targetRegion === "HOTLINK" ? "hotlink12" : "upfront";
    setSelectedRegion(targetRegion);
    setSelectedModel(model);
    setSelectedStorage(nextStorage);
    setSelectedTab(targetTab);
    setSelectedPlan(getBestDefaultPlan(model, nextStorage, targetTab, targetRegion));
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
    setByPlanMode(false);
    setUpsellMode(false);
    setLastModeContext(null);
    setBrandExpanded(true);
    setModelExpanded(true);
    setPricingExpanded(true);
  };

  const quoteText = useMemo(() => {
    if (!regionPricing || !selectedRow) return "";

    const deviceName = selectedModel.model;
    const promo = activeStorage.promo || "";
    const modeLabel =
      selectedTab === "upfront" ? "Upfront"
      : selectedTab === "zero24" ? "Zerolution 24M"
      : selectedTab === "zero36" ? "Zerolution 36M"
      : selectedTab === "hotlink12" ? "Hotlink 12M"
      : "Hotlink 24M";

    if (selectedTab === "hotlink12" || selectedTab === "hotlink24") {
      const row = selectedRow as { devicePrice?: number | string; dap?: number | string; totalUpfront?: number | string; monthly?: number | string };
      if (row.devicePrice === undefined) return "";
      const isFree = Number(row.devicePrice) === 0;
      const months = selectedTab === "hotlink12" ? 12 : 24;

      if (copyMode === "recommended") {
        return [
          `🔥 ${deviceName}`,
          ``,
          `📱 Plan: ${selectedPlan} (${modeLabel})`,
          isFree ? `📦 Device: FREE 🎉` : `📦 Device: ${moneyPlain(row.devicePrice)}`,
          `💳 DAP: ${moneyPlain(row.dap)} (returned as rebate monthly)`,
          `🧾 Total today: ${moneyPlain(row.totalUpfront)}`,
          `💰 Monthly: RM${row.monthly}/month (${months}-month contract)`,
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
        ? `✅ FREE device — pay only RM${row.dap} deposit today!`
        : `📦 Device at ${moneyPlain(row.devicePrice)} only`;
      return [
        `🔥 BEST DEAL — ${deviceName}`,
        ``,
        strongest,
        `📱 Plan: ${selectedPlan} | ${modeLabel}`,
        `💰 RM${row.monthly}/month · ${months}-month contract`,
        promo ? `🎁 ${promo}` : ``,
        ``,
        `⚡ Fast approval for eligible customers`,
        ``,
        `👉 Grab it — limited stocks`,
        `👉 Reply YES and I handle everything`,
      ].filter((l, i, arr) => !(l === "" && arr[i - 1] === "")).join("\n").trim();
    }

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
      <div className="min-h-screen lg:grid lg:grid-cols-[240px_minmax(0,1fr)_300px] lg:grid-rows-[auto_1fr]">

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
        <aside className="border-b border-white/8 bg-[#111417] p-3 lg:row-start-2 lg:border-b-0 lg:border-r lg:p-4 lg:overflow-y-auto lg:max-h-[calc(100vh-57px)]">
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
                <label className="mb-1.5 block text-xs text-slate-400">Maxis Postpaid</label>
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
                <label className="mt-2 mb-1.5 block text-xs text-slate-400">Hotlink Postpaid</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {["HP45", "HP65", "HP75"].map((plan) => (
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
                {freeDeviceResults.map(({ brand, model, storage, isHotlink, contractTerm, hotlinkTab }, i) => (
                  <button
                    key={`free-${brand}-${model.model}-${storage.storage}-${i}`}
                    onClick={() => navigateToDevice(brand, model, storage.storage, isHotlink ? (hotlinkTab ?? "hotlink24") : "upfront", freeDevicePlan, { mode: "Free Device", plan: freeDevicePlan, label: `🎁 FREE on ${freeDevicePlan}` })}
                    className="w-full rounded-xl border border-white/8 bg-[#181c1f] p-3 text-left transition hover:border-white/15 hover:bg-[#1e2225]"
                  >
                    <div className="text-xs font-semibold text-white">{model.model}</div>
                    <div className="mt-0.5 text-[10px] text-slate-500">{brand} · {storage.storage}</div>
                    {isHotlink && contractTerm && (
                      <div className="mt-1 text-[10px] text-[#00D46A]/80">{freeDevicePlan} · {contractTerm}</div>
                    )}
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
          ) : byPlanMode ? (
            /* By Plan Filter Mode */
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#00D46A]">
                  📋 By Plan
                </div>
                <button
                  onClick={() => setByPlanMode(false)}
                  className="text-xs text-slate-500 transition hover:text-white"
                >
                  ✕ Close
                </button>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-slate-400">Maxis Postpaid</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {["MP69","MP89","MP99","MP109","MP139","MP169","MP199"].map((plan) => (
                    <button
                      key={plan}
                      onClick={() => setByPlanSelected(plan)}
                      className={`rounded-xl border px-1 py-2 text-[10px] font-medium transition ${
                        byPlanSelected === plan
                          ? "border-[#00D46A] bg-[#00D46A] text-black"
                          : "border-white/8 bg-transparent text-slate-400 hover:text-white"
                      }`}
                    >
                      {plan}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-slate-400">Hotlink Postpaid</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {["HP45","HP65","HP75"].map((plan) => (
                    <button
                      key={plan}
                      onClick={() => setByPlanSelected(plan)}
                      className={`rounded-xl border px-1 py-2 text-[10px] font-medium transition ${
                        byPlanSelected === plan
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
                {byPlanResults.filter(r => r.isFree).length} free · {byPlanResults.length} total on {byPlanSelected}
              </div>

              {/* Upgrade tips — next 2 plan tiers */}
              {byPlanUpgradeTips.length > 0 && (
                <div className="rounded-xl border border-blue-400/20 bg-blue-400/5 p-2.5">
                  <div className="mb-1.5 text-[10px] font-semibold text-blue-300">💡 Upsell tips</div>
                  {byPlanUpgradeTips.map(t => (
                    <button
                      key={t.plan}
                      onClick={() => setByPlanSelected(t.plan)}
                      className="flex w-full items-center justify-between py-1 text-left hover:opacity-80"
                    >
                      <span className="text-[11px] font-medium text-blue-200">{t.plan} <span className="text-blue-400/60">+RM{t.extra}/mo</span></span>
                      <span className="text-[10px]">
                        {(t.becomeFreeCount + t.newFreeCount) > 0 && (
                          <span className="mr-1.5 font-bold text-red-400">🔥 {t.becomeFreeCount + t.newFreeCount} FREE</span>
                        )}
                        {t.newDeviceCount > 0 && (
                          <span className="text-slate-400">+{t.newDeviceCount} new</span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="max-h-[calc(100vh-340px)] space-y-2 overflow-y-auto pr-1">
                {byPlanResults.map(({ brand, model, storage, devicePrice, isFree, isHotlinkResult, contractTerm }, i) => (
                  <button
                    key={`byplan-${brand}-${model.model}-${storage.storage}-${i}`}
                    onClick={() => navigateToDevice(brand, model, storage.storage, isHotlinkResult ? (contractTerm === "24M" ? "hotlink24" : "hotlink12") : "upfront", byPlanSelected, { mode: "By Plan", plan: byPlanSelected, label: `📋 ${byPlanSelected} By Plan` })}
                    className="w-full rounded-xl border border-white/8 bg-[#181c1f] p-3 text-left transition hover:border-white/15 hover:bg-[#1e2225]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-xs font-semibold text-white">{model.model}</div>
                        <div className="mt-0.5 text-[10px] text-slate-500">
                          {brand} · {storage.storage}{isHotlinkResult && contractTerm ? ` · ${contractTerm}` : ""}
                        </div>
                      </div>
                      {isFree ? (
                        <span className="flex-shrink-0 text-xs font-bold text-red-400">FREE</span>
                      ) : (
                        <span className="flex-shrink-0 text-xs font-semibold text-[#00D46A]">RM{devicePrice}</span>
                      )}
                    </div>
                    {model.eol && (
                      <div className="mt-1 text-[10px] font-medium text-red-400">⚠️ Stock ending</div>
                    )}
                  </button>
                ))}
                {byPlanResults.length === 0 && (
                  <div className="rounded-xl border border-white/8 p-4 text-center text-sm text-slate-500">
                    No devices found on {byPlanSelected}
                  </div>
                )}
              </div>
            </div>
          ) : upsellMode ? (
            /* Upsell Advisor Mode */
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#00D46A]">
                  🔼 Upsell Advisor
                </div>
                <button
                  onClick={() => setUpsellMode(false)}
                  className="text-xs text-slate-500 transition hover:text-white"
                >
                  ✕ Close
                </button>
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-slate-400">Customer&apos;s current plan</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {mpOrder.filter(p => p !== "MP199").map((plan) => (
                    <button
                      key={plan}
                      onClick={() => { setUpsellBasePlan(plan); setExpandedUpsellTier(null); }}
                      className={`rounded-xl border px-1 py-2 text-[10px] font-medium transition ${
                        upsellBasePlan === plan
                          ? "border-[#00D46A] bg-[#00D46A] text-black"
                          : "border-white/8 bg-transparent text-slate-400 hover:text-white"
                      }`}
                    >
                      {plan}
                    </button>
                  ))}
                </div>
              </div>

              {upsellData && (
                <div className="text-xs text-slate-500">
                  <span className="text-[#00D46A]">{upsellData.currentDevices.filter(d => d.isFree).length} FREE</span>
                  {" · "}{upsellData.currentDevices.length} devices on {upsellBasePlan}
                </div>
              )}

              <div className="max-h-[calc(100vh-280px)] space-y-2 overflow-y-auto pr-1">
                {/* Current plan summary */}
                {upsellData && (
                  <div className="rounded-xl border border-white/8 bg-[#181c1f] p-3">
                    <div className="mb-1.5 text-[10px] font-semibold text-slate-400">📱 On {upsellBasePlan} now</div>
                    <div className="flex flex-wrap gap-1">
                      {upsellData.currentDevices.filter(d => d.isFree).slice(0, 4).map((d, i) => (
                        <button
                          key={i}
                          onClick={() => navigateToDevice(d.brand, d.model, d.storage.storage, "upfront", upsellBasePlan, { mode: "Upsell", plan: upsellBasePlan, label: `📱 ${upsellBasePlan} current plan` })}
                          className="rounded-lg border border-[#00D46A]/25 bg-[#00D46A]/8 px-2 py-1 text-[10px] font-medium text-[#00D46A] hover:bg-[#00D46A]/15"
                        >
                          🔥 {d.model.model.replace(/^(Samsung Galaxy |Galaxy |Google |Honor |Huawei |Oppo |Realme |Vivo |Xiaomi |Redmi )/, "")}
                        </button>
                      ))}
                      {upsellData.currentDevices.filter(d => d.isFree).length > 4 && (
                        <span className="px-1 text-[10px] text-slate-500">+{upsellData.currentDevices.filter(d => d.isFree).length - 4} more FREE</span>
                      )}
                    </div>
                    {upsellData.currentDevices.filter(d => d.isFree).length === 0 && (
                      <div className="text-[10px] text-slate-500">No free devices — suggest upgrading ↓</div>
                    )}
                  </div>
                )}

                {/* Upgrade tiers */}
                {upsellData?.tiers.map(tier => {
                  const isExpanded = expandedUpsellTier === tier.plan;
                  const totalNew = tier.newFree.length + tier.newOther.length;
                  const topSaving = tier.savingsHighlight[0];
                  const hasHighlight = tier.newFree.length > 0 || topSaving;

                  return (
                    <div
                      key={tier.plan}
                      className={`overflow-hidden rounded-xl border transition ${
                        tier.newFree.length > 0 ? "border-red-400/25 bg-red-400/5" : hasHighlight ? "border-amber-400/20 bg-amber-400/5" : "border-white/8 bg-[#181c1f]"
                      }`}
                    >
                      {/* Tier header — always visible */}
                      <button
                        className="w-full p-3 text-left"
                        onClick={() => setExpandedUpsellTier(isExpanded ? null : tier.plan)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-bold text-white">{tier.plan}</span>
                            <span className="text-[10px] text-slate-500">+RM{tier.extraMonthly}/mo</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {tier.newFree.length > 0 && (
                              <span className="rounded-full bg-red-400/15 px-2 py-0.5 text-[10px] font-bold text-red-400">
                                🔥 {tier.newFree.length} FREE
                              </span>
                            )}
                            {totalNew > 0 && tier.newFree.length === 0 && (
                              <span className="text-[10px] text-slate-400">+{totalNew} new</span>
                            )}
                            <span className="text-[10px] text-slate-600">{isExpanded ? "▲" : "▼"}</span>
                          </div>
                        </div>
                        {/* Teaser line (collapsed) */}
                        {!isExpanded && (
                          <div className="mt-1 space-y-0.5">
                            {tier.newFree[0] && (
                              <div className="text-[10px] text-red-400/80 truncate">🔥 {tier.newFree[0].model.model} FREE</div>
                            )}
                            {topSaving && !tier.newFree[0] && (
                              <div className="text-[10px] text-amber-300/80 truncate">💸 {topSaving.item.model.model} saves RM{topSaving.saving}</div>
                            )}
                            {tier.newOther[0] && !tier.newFree[0] && !topSaving && (
                              <div className="text-[10px] text-slate-400 truncate">+ {tier.newOther[0].model.model}</div>
                            )}
                          </div>
                        )}
                      </button>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="border-t border-white/8 space-y-1.5 p-3 pt-2">
                          {/* NEW FREE devices */}
                          {tier.newFree.map((item, i) => (
                            <button
                              key={`free-${i}`}
                              onClick={() => navigateToDevice(item.brand, item.model, item.storage.storage, "upfront", tier.plan, { mode: "Upsell", plan: tier.plan, label: `🔼 ${tier.plan} (upgrade from ${upsellBasePlan})` })}
                              className="flex w-full items-center justify-between rounded-lg border border-red-400/25 bg-red-400/8 px-3 py-2.5 text-left hover:bg-red-400/15"
                            >
                              <div className="min-w-0">
                                <div className="truncate text-xs font-semibold text-white">{item.model.model}</div>
                                <div className="text-[10px] text-slate-500">{item.brand} · {item.storage.storage}</div>
                              </div>
                              <span className="ml-2 flex-shrink-0 text-xs font-bold text-red-400">FREE 🔥</span>
                            </button>
                          ))}
                          {/* Savings highlights */}
                          {tier.savingsHighlight.map((s, i) => (
                            <button
                              key={`save-${i}`}
                              onClick={() => navigateToDevice(s.item.brand, s.item.model, s.item.storage.storage, "upfront", tier.plan, { mode: "Upsell", plan: tier.plan, label: `🔼 ${tier.plan} · saves RM${s.saving}` })}
                              className="flex w-full items-center justify-between rounded-lg border border-amber-400/15 bg-amber-400/5 px-3 py-2.5 text-left hover:bg-amber-400/10"
                            >
                              <div className="min-w-0">
                                <div className="truncate text-xs font-semibold text-white">{s.item.model.model}</div>
                                <div className="text-[10px] text-slate-500">
                                  was RM{s.wasPrice} → {s.item.isFree ? "FREE" : `RM${s.item.devicePrice}`}
                                </div>
                              </div>
                              <span className="ml-2 flex-shrink-0 text-xs font-bold text-amber-300">-RM{s.saving}</span>
                            </button>
                          ))}
                          {/* New other devices */}
                          {tier.newOther.map((item, i) => (
                            <button
                              key={`new-${i}`}
                              onClick={() => navigateToDevice(item.brand, item.model, item.storage.storage, "upfront", tier.plan, { mode: "Upsell", plan: tier.plan, label: `🔼 ${tier.plan} (upgrade from ${upsellBasePlan})` })}
                              className="flex w-full items-center justify-between rounded-lg border border-white/8 bg-[#111417] px-3 py-2.5 text-left hover:bg-[#1e2225]"
                            >
                              <div className="min-w-0">
                                <div className="truncate text-xs font-semibold text-white">{item.model.model}</div>
                                <div className="text-[10px] text-slate-500">{item.brand} · {item.storage.storage}</div>
                              </div>
                              <span className="ml-2 flex-shrink-0 text-xs font-semibold text-[#00D46A]">RM{item.devicePrice}</span>
                            </button>
                          ))}
                          {tier.newFree.length === 0 && tier.savingsHighlight.length === 0 && tier.newOther.length === 0 && (
                            <div className="text-[10px] text-slate-500">No new unlocks at {tier.plan}</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
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
                      navigateToDevice(result.brand, result.model, result.storage.storage, budgetTab, result.bestPlan, { mode: "Budget", plan: result.bestPlan, label: `💰 ${result.bestPlan} · RM${result.bestMonthly} ${budgetTab === "upfront" ? "total" : "/mo"}` })
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
                          navigateToDevice(result.brand, result.model, result.storage.storage, budgetTab, result.bestPlan, { mode: "Budget", plan: result.bestPlan, label: `✨ ${result.bestPlan} · RM${result.bestMonthly} ${budgetTab === "upfront" ? "total" : "/mo"} (stretch)` })
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
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">① Brand</div>
                  </div>

                  {/* Filter shortcuts */}
                  <div className="mb-3 grid grid-cols-2 gap-1.5">
                    {[
                      { label: "🎁 Free Device", onClick: () => setFreeDeviceMode(true) },
                      { label: "📋 By Plan", onClick: () => setByPlanMode(true) },
                      { label: "🔼 Upsell Advisor", onClick: () => { setUpsellMode(true); setExpandedUpsellTier(null); } },
                      { label: "💰 Budget", onClick: () => setBudgetMode(true) },
                    ].map(({ label, onClick }) => (
                      <button
                        key={label}
                        onClick={onClick}
                        className="rounded-lg border border-white/10 bg-[#1e2225] py-1.5 text-[11px] font-medium text-slate-400 transition hover:border-[#00D46A]/30 hover:text-[#00D46A]"
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                    {catalog.map((brand) => {
                      const active = brand.brand === selectedBrand;
                      return (
                        <button
                          key={brand.brand}
                          onClick={() => chooseBrand(brand.brand)}
                          className={`rounded-xl border px-3 py-2.5 text-left transition ${
                            active
                              ? "border-[#00D46A] bg-[#00D46A] text-black"
                              : "border-white/8 bg-transparent text-slate-300 hover:border-white/15 hover:bg-[#181c1f] hover:text-white"
                          }`}
                        >
                          <div className="truncate text-sm font-semibold">{brand.brand}</div>
                          <div className={`text-[11px] ${active ? "text-black/70" : "text-slate-500"}`}>
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
                  {/* Shortcuts always accessible even when brand is collapsed */}
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    {[
                      { label: "🎁 Free Device", onClick: () => setFreeDeviceMode(true) },
                      { label: "📋 By Plan", onClick: () => setByPlanMode(true) },
                      { label: "🔼 Upsell", onClick: () => { setUpsellMode(true); setExpandedUpsellTier(null); } },
                      { label: "💰 Budget", onClick: () => setBudgetMode(true) },
                    ].map(({ label, onClick }) => (
                      <button
                        key={label}
                        onClick={onClick}
                        className="rounded-lg border border-white/10 bg-[#1e2225] py-1.5 text-[10px] font-medium text-slate-400 transition hover:border-[#00D46A]/30 hover:text-[#00D46A]"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
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
                    {/* Favourites first */}
                    {activeBrand.models.some(m => favourites.includes(m.model)) && (
                      <>
                        {activeBrand.models.filter(m => favourites.includes(m.model)).map((model) => {
                          const active = model.model === selectedModel.model;
                          return (
                            <div key={`fav-${model.model}`} className="flex items-stretch gap-1.5">
                              <button
                                onClick={() => chooseModel(model)}
                                className={`flex-1 rounded-xl border px-3 py-3 text-left transition ${
                                  active ? "border-[#00D46A]/40 bg-[#00D46A]/10" : "border-white/8 bg-transparent hover:border-white/15 hover:bg-[#181c1f]"
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-amber-400">⭐</span>
                                  <span className="text-sm font-medium text-white">{model.model}</span>
                                  {model.eol && <span className="text-[9px] font-bold text-red-400">EOL</span>}
                                </div>
                                <div className="mt-1 text-xs text-slate-500">{model.storages.map(s => s.storage).join(" · ")}</div>
                              </button>
                              <button onClick={() => toggleFavourite(model.model)} className="rounded-xl border border-white/8 px-2 text-amber-400 hover:bg-[#181c1f]">★</button>
                            </div>
                          );
                        })}
                        <div className="flex items-center gap-2 py-1">
                          <div className="h-px flex-1 bg-white/8" />
                          <span className="text-[9px] text-slate-600">ALL</span>
                          <div className="h-px flex-1 bg-white/8" />
                        </div>
                      </>
                    )}
                    {/* All models */}
                    {activeBrand.models.filter(m => !favourites.includes(m.model)).map((model) => {
                      const active = model.model === selectedModel.model;
                      return (
                        <div key={model.model} className="flex items-stretch gap-1.5">
                          <button
                            onClick={() => chooseModel(model)}
                            className={`flex-1 rounded-xl border px-3 py-3 text-left transition ${
                              active ? "border-[#00D46A]/40 bg-[#00D46A]/10" : "border-white/8 bg-transparent hover:border-white/15 hover:bg-[#181c1f]"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-white">{model.model}</span>
                              {model.eol && <span className="text-[9px] font-bold text-red-400">EOL</span>}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">{model.storages.map(s => s.storage).join(" · ")}</div>
                          </button>
                          <button onClick={() => toggleFavourite(model.model)} className="rounded-xl border border-white/8 px-2 text-slate-600 hover:bg-[#181c1f] hover:text-amber-400">☆</button>
                        </div>
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
        <section className="space-y-4 p-3 pb-32 lg:row-start-2 lg:overflow-y-auto lg:max-h-[calc(100vh-57px)] lg:p-5 lg:pb-5">

          {/* Context breadcrumb — shows which mode/plan led to this device */}
          {lastModeContext && (
            <div className="flex items-center justify-between rounded-xl border border-[#00D46A]/20 bg-[#00D46A]/6 px-3 py-2">
              <div className="flex items-center gap-2 text-xs text-[#00D46A]/90">
                <span className="font-semibold">{lastModeContext.label}</span>
                <span className="text-[#00D46A]/40">·</span>
                <span className="text-[#00D46A]/60">Pricing shown for this plan</span>
              </div>
              <button
                onClick={() => setLastModeContext(null)}
                className="text-[10px] text-[#00D46A]/40 hover:text-[#00D46A]/80 transition"
              >
                ✕
              </button>
            </div>
          )}

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
              <InfoChip text={`Region: ${isHotlink ? "Hotlink" : "ECEM"}`} />
              {isHotDeal && (
                <span className="rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1.5 text-sm font-bold text-red-400">
                  🔥 HOT DEAL
                </span>
              )}
              {selectedModel.eol && (
                <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-sm font-bold text-red-400">
                  ⚠️ Stock ending — sell first
                </span>
              )}
              <button
                onClick={pinToCompare}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  compareA?.model.model === selectedModel.model
                    ? "border-blue-400/50 bg-blue-400/15 text-blue-300"
                    : "border-white/10 bg-[#181c1f] text-slate-400 hover:text-white"
                }`}
              >
                {compareA?.model.model === selectedModel.model ? "📌 Pinned A" : compareB ? "🔄 Replace A" : compareA ? "📌 Pin as B" : "📌 Compare"}
              </button>
              {compareA && (
                <button
                  onClick={() => { setCompareA(null); setCompareB(null); setShowCompare(false); }}
                  className="rounded-full border border-white/10 bg-[#181c1f] px-3 py-1.5 text-sm text-slate-500 hover:text-white"
                >
                  ✕ Clear
                </button>
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

            {/* Region toggle — only shown when device has both ECEM and Hotlink pricing */}
            {hasECEM && hasHotlink && (
              <div className="mb-3 grid grid-cols-2 gap-2">
                {(["ECEM", "HOTLINK"] as const).map((region) => (
                  <button
                    key={region}
                    onClick={() => {
                      const newTab: PricingMode = region === "HOTLINK" ? "hotlink12" : "upfront";
                      setSelectedRegion(region);
                      setSelectedTab(newTab);
                      setSelectedPlan(getBestDefaultPlan(selectedModel, selectedStorage, newTab, region));
                      setPricingExpanded(true);
                    }}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-medium transition ${
                      selectedRegion === region
                        ? "border-[#00D46A] bg-[#00D46A] text-black"
                        : "border-white/8 bg-[#181c1f] text-slate-400 hover:border-white/15 hover:text-white"
                    }`}
                  >
                    {region === "ECEM" ? "Maxis Postpaid" : "Hotlink Postpaid"}
                  </button>
                ))}
              </div>
            )}

            <div className={`grid gap-2 ${activeTabs.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {activeTabs.map((tab) => {
                const active = tab.key === selectedTab;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setSelectedTab(tab.key);
                      setSelectedPlan(getBestDefaultPlan(selectedModel, selectedStorage, tab.key, selectedRegion));
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
                    {activeTabs.find((t) => t.key === selectedTab)?.label}
                  </span>
                </div>
                <div className="mt-1.5 text-base font-bold text-[#00D46A]">
                  {(selectedTab === "upfront" || selectedTab === "hotlink12" || selectedTab === "hotlink24")
                    ? (() => {
                        const r = selectedRow as {
                          devicePrice?: number | string;
                          totalUpfront?: number | string;
                          monthly?: number | string;
                        };
                        if (r.devicePrice === "NA") return "NA";
                        const monthlyStr = (selectedTab !== "upfront") ? ` · RM${r.monthly}/mo plan` : "";
                        return `${formatMoney(r.devicePrice)} device · ${formatMoney(r.totalUpfront)} today${monthlyStr}`;
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
                  {activePlanOrder.map((mp) => {
                    const row = currentTable?.[mp];
                    const active = mp === selectedPlan;

                    const isUpfrontMode = selectedTab === "upfront" || selectedTab === "hotlink12" || selectedTab === "hotlink24";
                    const isUpfront = isUpfrontMode && row && (row as { devicePrice?: number | string }).devicePrice !== undefined && (row as { devicePrice?: number | string }).devicePrice !== "NA";
                    const isMonthly = !isUpfrontMode && row && (row as { monthly?: number | string }).monthly !== undefined && (row as { monthly?: number | string }).monthly !== "NA";

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
                            {mp === "MP48" && !isHotlink && (
                              <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">Shareline</span>
                            )}
                            {isUpfrontMode && row && Number((row as { devicePrice?: number | string }).devicePrice) === 0 && (
                              <span className="rounded-full bg-red-400/15 px-2 py-0.5 text-xs font-bold text-red-400">🔥 FREE</span>
                            )}
                            {!isUpfrontMode && row && Number((row as { monthly?: number | string }).monthly) === 0 && (
                              <span className="rounded-full bg-red-400/15 px-2 py-0.5 text-xs font-bold text-red-400">🔥 FREE</span>
                            )}
                          </div>
                          {active && (
                            <span className="rounded-full bg-[#00D46A] px-3 py-1 text-xs font-bold text-black">
                              Selected
                            </span>
                          )}
                        </div>

                        {isUpfrontMode ? (
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
                              label={isHotlink ? "DAP (deposit)" : "DAP / ECC"}
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
                            {isHotlink && isUpfront && (
                              <StackValue
                                label="Monthly (effective)"
                                value={`RM${(row as { monthly?: number | string }).monthly}/mo`}
                              />
                            )}
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
                        {(selectedTab === "upfront" || selectedTab === "hotlink12" || selectedTab === "hotlink24") ? (
                          <>
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                              Device Price
                            </th>
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                              {isHotlink ? "DAP" : "DAP / ECC"}
                            </th>
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                              Total Upfront
                            </th>
                            {isHotlink && (
                              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                                Monthly
                              </th>
                            )}
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
                      {activePlanOrder.map((mp) => {
                        const row = currentTable?.[mp];
                        const active = mp === selectedPlan;
                        const isUpfrontMode = selectedTab === "upfront" || selectedTab === "hotlink12" || selectedTab === "hotlink24";

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
                              {mp === "MP48" && !isHotlink && (
                                <span className="ml-2 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-normal text-blue-300">Shareline</span>
                              )}
                            </td>

                            {isUpfrontMode ? (
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
                                {isHotlink && (
                                  <td className="px-4 py-3 text-sm text-slate-300">
                                    {!upfrontMissing ? `RM${(row as {monthly?: number|string}).monthly}/mo` : "NA"}
                                  </td>
                                )}
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
                No pricing available for this configuration.
              </div>
            )}
          </div>
          )}

          </div>{/* end plan section */}

          {/* ── Upgrade Ladder ──────────────────────────────────────────── */}
          {upgradeLadder.length > 1 && (() => {
            const currentRow = upgradeLadder.find(r => r.plan === selectedPlan);
            if (!currentRow) return null;
            return (
              <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#111417]">
                <div className="border-b border-white/8 px-4 py-3">
                  <div className="text-sm font-semibold text-white">📊 Plan comparison</div>
                  <div className="mt-0.5 text-xs text-slate-500">vs your selected plan {selectedPlan} · tap to switch</div>
                </div>
                <div className="divide-y divide-white/5">
                  {upgradeLadder.map((row) => {
                    const isSelected = row.plan === selectedPlan;
                    const monthlyDiff = row.planCost - currentRow.planCost;
                    const cashDiff = row.cashToday - currentRow.cashToday;
                    const isSameCash = Math.abs(cashDiff) <= 50;
                    const isLessCash = cashDiff < -50;

                    return (
                      <button
                        key={row.plan}
                        onClick={() => { setSelectedPlan(row.plan); setPricingExpanded(false); }}
                        className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition ${
                          isSelected
                            ? "bg-[#00D46A]/8"
                            : monthlyDiff < 0 ? "opacity-50 hover:opacity-80 hover:bg-[#181c1f]"
                            : "hover:bg-[#181c1f]"
                        }`}
                      >
                        {/* Plan */}
                        <div className="w-12 flex-shrink-0">
                          <div className={`text-sm font-bold ${isSelected ? "text-[#00D46A]" : "text-white"}`}>{row.plan}</div>
                          {isSelected && <div className="text-[9px] text-[#00D46A]/60">current</div>}
                        </div>

                        {/* Phone price — the main message */}
                        <div className="w-20 flex-shrink-0">
                          {row.isFree
                            ? <span className="text-sm font-bold text-red-400">FREE 🔥</span>
                            : <span className={`text-sm font-semibold ${isSelected ? "text-[#00D46A]" : "text-white"}`}>RM{row.devicePrice}</span>
                          }
                          <div className="text-[10px] text-slate-500">phone</div>
                        </div>

                        {/* Delta vs selected — what staff say out loud */}
                        <div className="min-w-0 flex-1">
                          {isSelected ? (
                            <div className="text-xs text-slate-500">selected plan</div>
                          ) : (
                            <div className="space-y-0.5">
                              <div className={`text-xs font-medium ${monthlyDiff > 0 ? "text-slate-300" : "text-slate-500"}`}>
                                {monthlyDiff > 0 ? `+RM${monthlyDiff}/mth` : `-RM${Math.abs(monthlyDiff)}/mth`}
                              </div>
                              {!isSelected && (
                                <div className="text-[10px]">
                                  {isLessCash
                                    ? <span className="text-emerald-400">RM{Math.abs(cashDiff)} less today</span>
                                    : isSameCash
                                    ? <span className="text-slate-500">same cash today</span>
                                    : <span className="text-slate-500">RM{Math.abs(cashDiff)} {cashDiff > 0 ? "more" : "less"} today</span>
                                  }
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

        </section>

        {/* ── RIGHT SIDEBAR ───────────────────────────────────────────────── */}
        <aside className="space-y-4 border-t border-white/8 bg-[#111417] p-3 pb-28 lg:row-start-2 lg:border-l lg:border-t-0 lg:overflow-y-auto lg:max-h-[calc(100vh-57px)] lg:p-4 lg:pb-4">
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
                value={activeTabs.find((t) => t.key === selectedTab)?.label || selectedTab}
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
            <div className="mb-2 grid grid-cols-2 gap-1.5">
              {(["recommended", "aggressive"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setCopyMode(mode)}
                  className={`rounded-xl border py-2 text-xs font-medium transition ${
                    copyMode === mode
                      ? mode === "aggressive"
                        ? "border-red-400/50 bg-red-400/15 text-red-300"
                        : "border-[#00D46A] bg-[#00D46A] text-black"
                      : "border-white/8 bg-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {mode === "recommended" ? "⭐ Smart" : "🔥 Closing"}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-white/8 bg-[#181c1f] p-4">
              <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-slate-300">
                {quoteText || "Select a valid plan to generate quote."}
              </pre>
            </div>

            {totalContractCost && (
              <div className="mt-2 rounded-xl border border-white/8 bg-[#181c1f] px-4 py-2.5">
                <span className="text-[10px] text-slate-500">Total commitment: </span>
                <span className="text-xs font-semibold text-slate-300">{totalContractCost}</span>
              </div>
            )}

            <button
              onClick={copyQuote}
              disabled={!quoteText}
              className="mt-3 w-full rounded-xl bg-[#00D46A] px-4 py-3 text-sm font-bold text-black transition hover:bg-[#00b85c] disabled:cursor-not-allowed disabled:bg-[#1e2225] disabled:text-slate-500"
            >
              {copyMode === "aggressive" ? "🔥 Copy Closing Message" : "⭐ Copy Smart Quote"}
            </button>
          </section>

        </aside>
      </div>

      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0e1114]/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">
              {selectedModel.model}
            </div>
            <div className="truncate text-xs text-slate-400">
              {selectedPlan} · {activeStorage.storage} · {activeTabs.find((t) => t.key === selectedTab)?.short}
            </div>
          </div>
          <button
            onClick={copyQuote}
            disabled={!quoteText}
            className={`flex-shrink-0 rounded-xl px-5 py-3 text-sm font-bold text-black transition disabled:opacity-40 ${
              copyMode === "aggressive" ? "bg-red-400" : "bg-[#00D46A]"
            }`}
          >
            {copyMode === "aggressive" ? "🔥 Copy" : "Copy Quote"}
          </button>
        </div>
      </div>

      {/* ── Compare Panel ───────────────────────────────────────────────── */}
      {showCompare && compareA && compareB && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0e1114]/97 backdrop-blur-md lg:bottom-0">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Side by side</div>
              <button
                onClick={() => setShowCompare(false)}
                className="text-xs text-slate-500 hover:text-white"
              >
                ✕ Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[compareA, compareB].map((dev, idx) => {
                const table = dev.storage.regions.ECEM?.[selectedTab];
                const row = table?.[selectedPlan];
                const label = idx === 0 ? "A" : "B";
                return (
                  <div
                    key={idx}
                    className={`rounded-xl border p-3 ${idx === 0 ? "border-blue-400/30 bg-blue-400/5" : "border-purple-400/30 bg-purple-400/5"}`}
                  >
                    <div className={`mb-1 text-[10px] font-bold ${idx === 0 ? "text-blue-400" : "text-purple-400"}`}>{label}</div>
                    <div className="truncate text-sm font-semibold text-white">{dev.model.model}</div>
                    <div className="mb-3 text-[10px] text-slate-500">{dev.storage.storage} · {selectedPlan} · {selectedTab}</div>
                    {row ? (
                      selectedTab === "upfront" ? (
                        <>
                          <div className="flex justify-between text-xs"><span className="text-slate-400">Device</span><span className="font-semibold text-white">{formatMoney((row as {devicePrice?: number|string}).devicePrice)}</span></div>
                          <div className="flex justify-between text-xs"><span className="text-slate-400">DAP</span><span className="text-slate-300">{(row as {dapLabel?: string}).dapLabel || formatMoney((row as {dap?: number|string}).dap)}</span></div>
                          <div className="mt-1 flex justify-between text-xs font-semibold"><span className="text-slate-400">Total upfront</span><span className="text-[#00D46A]">{formatMoney((row as {totalUpfront?: number|string}).totalUpfront)}</span></div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between text-xs"><span className="text-slate-400">Monthly device</span><span className="font-semibold text-white">{formatMoney((row as {monthly?: number|string}).monthly)}</span></div>
                          <div className="mt-1 flex justify-between text-xs font-semibold"><span className="text-slate-400">Total / month</span><span className="text-[#00D46A]">RM{planFee(selectedPlan) + Number((row as {monthly?: number|string}).monthly)}</span></div>
                        </>
                      )
                    ) : (
                      <div className="text-xs text-slate-500">Not available on {selectedPlan}</div>
                    )}
                    {dev.storage.promo && (
                      <div className="mt-2 text-[10px] text-amber-400">{dev.storage.promo}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
