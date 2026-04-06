"use client";

import { useEffect, useMemo, useState } from "react";
import {
  catalog,
  type CatalogBrand,
  type CatalogModel,
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

export default function Page() {
  const [selectedBrand, setSelectedBrand] = useState<CatalogBrand["brand"]>(catalog[0].brand);
  const [selectedModel, setSelectedModel] = useState<CatalogModel>(catalog[0].models[0]);
  const [selectedStorage, setSelectedStorage] = useState(
    catalog[0].models[0].storages[0].storage
  );
  const [selectedTab, setSelectedTab] = useState<PricingMode>("upfront");
  const [selectedPlan, setSelectedPlan] = useState("MP99");
  const [toast, setToast] = useState("");

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

  const chooseBrand = (brand: CatalogBrand["brand"]) => {
    const nextBrand = catalog.find((b) => b.brand === brand) || catalog[0];
    const nextModel = nextBrand.models[0];
    const nextStorage = nextModel.storages[0].storage;

    setSelectedBrand(nextBrand.brand);
    setSelectedModel(nextModel);
    setSelectedStorage(nextStorage);
    setSelectedTab("upfront");
    setSelectedPlan(getBestDefaultPlan(nextModel, nextStorage, "upfront"));
  };

  const chooseModel = (model: CatalogModel) => {
    const nextStorage = model.storages[0].storage;

    setSelectedModel(model);
    setSelectedStorage(nextStorage);
    setSelectedTab("upfront");
    setSelectedPlan(getBestDefaultPlan(model, nextStorage, "upfront"));
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
  };

  const quoteText = useMemo(() => {
    if (!regionPricing || !selectedRow) return "";

    if (selectedTab === "upfront") {
      const row = selectedRow as {
        devicePrice?: number | string;
        dap?: number | string;
        dapLabel?: string;
        totalUpfront?: number | string;
      };

      if (row.devicePrice === undefined || row.devicePrice === "NA") return "";

      return `🔥 ${selectedModel.model}
📦 Storage: ${activeStorage.storage}
📍 Region: ECEM
📱 Plan: ${selectedPlan}

💰 Device Price / Upfront: ${moneyPlain(row.devicePrice)}
📉 DAP: ${row.dapLabel ? row.dapLabel : moneyPlain(row.dap)}
🧾 Total Upfront: ${moneyPlain(row.totalUpfront)}`;
    }

    const row = selectedRow as {
      monthly?: number | string;
      dapLabel?: string;
    };

    if (row.monthly === undefined || row.monthly === "NA") return "";

    return `🔥 ${selectedModel.model}
📦 Storage: ${activeStorage.storage}
📍 Region: ECEM
📱 Plan: ${selectedPlan}${selectedPlan === "MP48" ? " (Shareline)" : ""}
🗓 Mode: ${selectedTab === "zero24" ? "Zerolution 24M" : "Zerolution 36M"}

📆 Monthly: ${moneyPlain(row.monthly)}
📝 Note: ${row.dapLabel && row.dapLabel !== "NA" ? row.dapLabel : selectedPlan === "MP48" ? "Shareline - no ECC" : "Check ECC"}`;
  }, [regionPricing, selectedRow, selectedModel, activeStorage, selectedPlan, selectedTab]);

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

  return (
    <main className="min-h-screen bg-[#0a0d0f] text-[#f0f2f4]">
      <div className="min-h-screen lg:grid lg:grid-cols-[220px_minmax(0,1fr)_320px] lg:grid-rows-[auto_1fr]">
        <header className="border-b border-white/8 bg-[#111417] px-4 py-4 lg:col-span-3 lg:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00D46A] text-sm font-bold text-black">
                M
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Maxis ECEM Pricing Browser</div>
                <div className="text-xs text-slate-400">Staff tool — ECEM / Sarawak</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[#00D46A]/25 bg-[#00D46A]/12 px-3 py-1 text-xs font-semibold text-[#00D46A]">
                ECEM
              </span>
              <button
                onClick={resetAll}
                className="rounded-xl border border-white/10 bg-[#1e2225] px-3 py-2 text-xs font-medium text-slate-300 transition hover:text-white"
              >
                ↺ Reset
              </button>
            </div>
          </div>
        </header>

        <aside className="border-b border-white/8 bg-[#111417] p-3 lg:row-start-2 lg:border-b-0 lg:border-r lg:p-4">
          <section className="mb-4">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Brands
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

          <section>
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Models
              </div>
              <div className="text-xs text-slate-500">{activeBrand.models.length}</div>
            </div>

            <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
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
        </aside>

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
            </div>
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

          <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#111417]">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
              <div className="text-sm font-semibold text-white">Plan pricing</div>
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
                        onClick={() => setSelectedPlan(mp)}
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
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="hidden md:block overflow-x-auto">
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
                            onClick={() => setSelectedPlan(mp)}
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
                                  <span className={upfrontMissing ? "text-slate-500" : "font-semibold text-[#00D46A]"}>
                                    {upfrontMissing
                                      ? "NA"
                                      : formatMoney(
                                          (row as { devicePrice?: number | string }).devicePrice
                                        )}
                                  </span>
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
                                  <span className={monthlyMissing ? "text-slate-500" : "font-semibold text-[#00D46A]"}>
                                    {monthlyMissing
                                      ? "NA"
                                      : formatMoney((row as { monthly?: number | string }).monthly)}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-300">
                                  {monthlyMissing
                                    ? "NA"
                                    : "dapLabel" in (row || {}) &&
                                      (row as { dapLabel?: string }).dapLabel
                                    ? (row as { dapLabel?: string }).dapLabel || "NA"
                                    : "Check ECC"}
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
        </section>

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

          <section>
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Quick Quote
            </div>

            <div className="rounded-xl border border-white/8 bg-[#181c1f] p-4">
              <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-7 text-slate-300">
                {quoteText || "Select a valid plan to generate quote."}
              </pre>
            </div>

            <button
              onClick={copyQuote}
              disabled={!quoteText}
              className="mt-3 w-full rounded-xl bg-[#00D46A] px-4 py-3 text-sm font-bold text-black transition hover:bg-[#00b85c] disabled:cursor-not-allowed disabled:bg-[#1e2225] disabled:text-slate-500"
            >
              Copy for WhatsApp
            </button>
          </section>

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
            className="rounded-2xl bg-[#00D46A] px-4 py-3 text-sm font-bold text-black disabled:opacity-50"
          >
            Copy Quote
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
