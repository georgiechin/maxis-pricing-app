"use client";

import { useEffect, useMemo, useState } from "react";
import {
  catalog,
  type CatalogBrand,
  type CatalogModel,
  type PricingMode,
} from "../data/catalog";

const pricingTabs: { key: PricingMode; label: string; mobileLabel: string }[] = [
  { key: "upfront", label: "Upfront Pricing", mobileLabel: "Upfront" },
  { key: "zero24", label: "Zerolution 24M", mobileLabel: "Zero 24M" },
  { key: "zero36", label: "Zerolution 36M", mobileLabel: "Zero 36M" },
];

const mpOrder = ["MP69", "MP89", "MP99", "MP109", "MP139", "MP169", "MP199"];

function formatMoney(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "" || value === "NA") {
    return "NA";
  }
  return `RM ${Number(value).toLocaleString()}`;
}

function moneyPlain(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "" || value === "NA") {
    return "NA";
  }
  return `RM${Number(value).toLocaleString()}`;
}

export default function Page() {
  const [selectedBrand, setSelectedBrand] = useState<CatalogBrand["brand"]>(catalog[0].brand);
  const [selectedModel, setSelectedModel] = useState<CatalogModel>(catalog[0].models[0]);
  const [selectedStorage, setSelectedStorage] = useState(catalog[0].models[0].storages[0].storage);
  const [selectedTab, setSelectedTab] = useState<PricingMode>("upfront");
  const [selectedPlan, setSelectedPlan] = useState("MP99");
  const [toast, setToast] = useState("");

  const activeBrand = useMemo(
    () => catalog.find((b) => b.brand === selectedBrand) || catalog[0],
    [selectedBrand]
  );

  const filteredModels = activeBrand.models;

  const activeStorage = useMemo(
    () =>
      selectedModel.storages.find((s) => s.storage === selectedStorage) ||
      selectedModel.storages[0],
    [selectedModel, selectedStorage]
  );

  const regionPricing = activeStorage.regions.ECEM || null;
  const currentTable = regionPricing ? regionPricing[selectedTab] : null;
  const selectedRow = currentTable?.[selectedPlan];

  const chooseBrand = (brand: CatalogBrand["brand"]) => {
    const nextBrand = catalog.find((b) => b.brand === brand) || catalog[0];
    setSelectedBrand(nextBrand.brand);
    setSelectedModel(nextBrand.models[0]);
    setSelectedStorage(nextBrand.models[0].storages[0].storage);
    setSelectedTab("upfront");
    setSelectedPlan("MP99");
  };

  const chooseModel = (brandName: string, model: CatalogModel) => {
    setSelectedBrand(brandName);
    setSelectedModel(model);
    setSelectedStorage(model.storages[0].storage);
    setSelectedTab("upfront");
    setSelectedPlan("MP99");
  };

  const quoteText = useMemo(() => {
    if (!regionPricing || !selectedRow) return "";

    if (selectedTab === "upfront") {
      return `🔥 ${selectedModel.model}
📦 Storage: ${activeStorage.storage}
📍 Region: ECEM
📱 Plan: ${selectedPlan}

💰 Device Price / Upfront: ${moneyPlain(
        (selectedRow as { devicePrice?: number | string }).devicePrice
      )}
📉 DAP: ${
        "dapLabel" in selectedRow && selectedRow.dapLabel
          ? selectedRow.dapLabel
          : moneyPlain((selectedRow as { dap?: number | string }).dap)
      }
🧾 Total Upfront: ${moneyPlain(
        (selectedRow as { totalUpfront?: number | string }).totalUpfront
      )}`;
    }

    return `🔥 ${selectedModel.model}
📦 Storage: ${activeStorage.storage}
📍 Region: ECEM
📱 Plan: ${selectedPlan}
🗓 Mode: ${selectedTab === "zero24" ? "Zerolution 24M" : "Zerolution 36M"}

📆 Monthly: ${moneyPlain((selectedRow as { monthly?: number | string }).monthly)}
📝 Note: ${
      "dapLabel" in selectedRow && selectedRow.dapLabel ? selectedRow.dapLabel : "Check ECC"
    }`;
  }, [regionPricing, selectedRow, selectedModel, activeStorage, selectedPlan, selectedTab]);

  const copyQuote = async () => {
    if (!quoteText) return;
    await navigator.clipboard.writeText(quoteText);
    setToast("Quote copied");
  };

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <main className="min-h-screen text-white">
      <div className="app-shell">
        <div className="app-card overflow-hidden">
          <header className="border-b border-white/8 px-4 py-4 md:px-6 md:py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-300 ring-1 ring-green-500/20">
                    ECEM only
                  </span>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300 ring-1 ring-white/8">
                    Staff pricing tool
                  </span>
                </div>
                <h1 className="text-xl font-bold tracking-tight md:text-3xl">
                  Maxis ECEM Device Pricing Browser
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Choose brand, tap model, select plan, and copy quote fast
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 md:flex md:items-center">
                <QuickStat label="Brand" value={selectedBrand} />
                <QuickStat label="Model" value={selectedModel.model} />
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => {
                  setSelectedTab("upfront");
                  setSelectedPlan("MP99");
                }}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10 lg:w-auto"
              >
                Reset pricing selection
              </button>
            </div>
          </header>

          <section className="grid gap-4 p-3 pb-32 md:p-4 md:pb-6 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
            <aside className="space-y-4">
              <section className="soft-panel p-3">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Brands
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-1">
                  {catalog.map((brand) => {
                    const active = selectedBrand === brand.brand;

                    return (
                      <button
                        key={brand.brand}
                        onClick={() => chooseBrand(brand.brand)}
                        className={`rounded-2xl px-4 py-3 text-left text-sm transition ${
                          active
                            ? "bg-green-500 text-slate-950 shadow-lg shadow-green-500/20"
                            : "border border-white/8 bg-white/4 text-slate-200 hover:bg-white/8"
                        }`}
                      >
                        <div className="truncate font-semibold">{brand.brand}</div>
                        <div className={`text-xs ${active ? "text-slate-900/80" : "text-slate-400"}`}>
                          {brand.models.length} models
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="soft-panel p-3">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Models in {activeBrand.brand}
                  </div>
                  <div className="text-xs text-slate-400">{filteredModels.length}</div>
                </div>

                <div className="model-scroll max-h-[420px] space-y-2 overflow-y-auto pr-1">
                  {filteredModels.map((model) => {
                    const active = selectedModel.model === model.model;

                    return (
                      <button
                        key={model.model}
                        onClick={() => chooseModel(activeBrand.brand, model)}
                        className={`block w-full rounded-2xl border px-3 py-3 text-left transition ${
                          active
                            ? "border-green-500/35 bg-green-500/10"
                            : "border-white/6 bg-white/3 hover:bg-white/6"
                        }`}
                      >
                        <div className="text-sm font-semibold text-white">{model.model}</div>
                        <div className="mt-1 text-xs text-slate-400">
                          {model.storages.map((s) => s.storage).join(" · ")}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            </aside>

            <section className="space-y-4">
              <div className="soft-panel p-4 md:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-sm text-slate-400">{selectedBrand}</div>
                    <h2 className="mt-1 text-2xl font-bold md:text-3xl">{selectedModel.model}</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <MiniBadge label={`Storage: ${activeStorage.storage}`} />
                      <MiniBadge label={`RRP: ${formatMoney(activeStorage.rrp)}`} />
                      <MiniBadge label="Region: ECEM" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                    <InfoCard label="Selected plan" value={selectedPlan} />
                  </div>
                </div>
              </div>

              <div className="soft-panel p-4">
                <div className="mb-3 text-sm font-semibold text-white">Choose storage</div>
                <div className="flex flex-wrap gap-2">
                  {selectedModel.storages.map((storage) => (
                    <button
                      key={storage.storage}
                      onClick={() => setSelectedStorage(storage.storage)}
                      className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                        selectedStorage === storage.storage
                          ? "bg-green-500 text-slate-950"
                          : "glass-chip text-slate-200 hover:bg-white/8"
                      }`}
                    >
                      {storage.storage}
                    </button>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-white/8 bg-slate-950/45 p-3 text-sm text-slate-300">
                  {activeStorage.notes || "Use ECEM pricing shown below."}
                </div>
              </div>

              <div className="soft-panel p-4">
                <div className="mb-3 text-sm font-semibold text-white">Pricing mode</div>
                <div className="grid grid-cols-3 gap-2">
                  {pricingTabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedTab(tab.key)}
                      className={`rounded-2xl px-3 py-3 text-center text-sm font-medium transition ${
                        selectedTab === tab.key
                          ? "bg-green-500 text-slate-950"
                          : "glass-chip text-slate-200 hover:bg-white/8"
                      }`}
                    >
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.mobileLabel}</span>
                    </button>
                  ))}
                </div>
              </div>

              {regionPricing ? (
                <div className="soft-panel overflow-hidden">
                  <div className="border-b border-white/8 px-4 py-3">
                    <div className="text-sm font-semibold text-white">Mobile quick select</div>
                    <div className="text-xs text-slate-400">
                      Tap any plan card to prepare quote.
                    </div>
                  </div>

                  <div className="grid gap-3 p-3 md:hidden">
                    {mpOrder.map((mp) => {
                      const row = currentTable?.[mp];
                      const isSelected = selectedPlan === mp;

                      return (
                        <button
                          key={mp}
                          onClick={() => setSelectedPlan(mp)}
                          className={`rounded-2xl border p-4 text-left transition ${
                            isSelected
                              ? "border-green-500/40 bg-green-500/10"
                              : "border-white/8 bg-white/3"
                          }`}
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <div className="text-2xl font-bold text-white">{mp}</div>
                            {isSelected && (
                              <span className="rounded-full bg-green-500 px-2.5 py-1 text-xs font-bold text-slate-950">
                                Selected
                              </span>
                            )}
                          </div>

                          {selectedTab === "upfront" ? (
                            <div className="space-y-3">
                              <MobileStackValue
                                label="Device Price / Upfront"
                                value={
                                  row
                                    ? formatMoney((row as { devicePrice?: number | string }).devicePrice)
                                    : "NA"
                                }
                              />
                              <MobileStackValue
                                label="DAP"
                                value={
                                  row
                                    ? "dapLabel" in row && row.dapLabel
                                      ? row.dapLabel
                                      : formatMoney((row as { dap?: number | string }).dap)
                                    : "NA"
                                }
                              />
                              <MobileStackValue
                                label="Total Upfront"
                                value={
                                  row
                                    ? formatMoney(
                                        (row as { totalUpfront?: number | string }).totalUpfront
                                      )
                                    : "NA"
                                }
                              />
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <MobileStackValue
                                label="Monthly"
                                value={
                                  row
                                    ? formatMoney((row as { monthly?: number | string }).monthly)
                                    : "NA"
                                }
                              />
                              <MobileStackValue
                                label="DAP / ECC"
                                value={
                                  row
                                    ? "dapLabel" in row && row.dapLabel
                                      ? row.dapLabel
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

                  <div className="hidden md:block">
                    <div className="table-scroll overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-white/4 text-slate-300">
                          <tr>
                            <th className="px-4 py-3 text-left">Plan</th>
                            {selectedTab === "upfront" ? (
                              <>
                                <th className="px-4 py-3 text-left">Device Price / Upfront</th>
                                <th className="px-4 py-3 text-left">DAP</th>
                                <th className="px-4 py-3 text-left">Total Upfront</th>
                              </>
                            ) : (
                              <>
                                <th className="px-4 py-3 text-left">Monthly</th>
                                <th className="px-4 py-3 text-left">DAP / ECC</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {mpOrder.map((mp) => {
                            const row = currentTable?.[mp];
                            const isSelected = selectedPlan === mp;

                            return (
                              <tr
                                key={mp}
                                onClick={() => setSelectedPlan(mp)}
                                className={`cursor-pointer border-t border-white/6 transition ${
                                  isSelected ? "bg-green-500/10" : "hover:bg-white/4"
                                }`}
                              >
                                <td className="px-4 py-3 font-semibold text-white">{mp}</td>

                                {selectedTab === "upfront" ? (
                                  <>
                                    <td className="px-4 py-3 text-slate-200">
                                      {row
                                        ? formatMoney(
                                            (row as { devicePrice?: number | string }).devicePrice
                                          )
                                        : "NA"}
                                    </td>
                                    <td className="px-4 py-3 text-slate-200">
                                      {row
                                        ? "dapLabel" in row && row.dapLabel
                                          ? row.dapLabel
                                          : formatMoney((row as { dap?: number | string }).dap)
                                        : "NA"}
                                    </td>
                                    <td className="px-4 py-3 text-slate-200">
                                      {row
                                        ? formatMoney(
                                            (row as { totalUpfront?: number | string }).totalUpfront
                                          )
                                        : "NA"}
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td className="px-4 py-3 text-slate-200">
                                      {row
                                        ? formatMoney((row as { monthly?: number | string }).monthly)
                                        : "NA"}
                                    </td>
                                    <td className="px-4 py-3 text-slate-200">
                                      {row
                                        ? "dapLabel" in row && row.dapLabel
                                          ? row.dapLabel
                                          : "Check ECC"
                                        : "NA"}
                                    </td>
                                  </>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100">
                  No ECEM pricing loaded for this model.
                </div>
              )}
            </section>

            <aside className="space-y-4">
              <section className="soft-panel p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">Quick Quote</div>
                    <div className="text-xs text-slate-400">Tap plan, then copy for WhatsApp</div>
                  </div>
                  <button
                    onClick={copyQuote}
                    disabled={!quoteText}
                    className="rounded-2xl bg-green-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Copy
                  </button>
                </div>

                <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-4">
                  <pre className="quote-pre whitespace-pre-wrap text-sm text-slate-200">
                    {quoteText || "Select a valid plan row to generate quote."}
                  </pre>
                </div>
              </section>

              <section className="soft-panel p-4">
                <div className="mb-3 text-sm font-semibold text-white">Staff flow</div>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>1. Choose brand</li>
                  <li>2. Tap model</li>
                  <li>3. Tap storage</li>
                  <li>4. Tap pricing plan</li>
                  <li>5. Copy quote</li>
                </ul>
              </section>

              <section className="soft-panel p-4">
                <div className="mb-3 text-sm font-semibold text-white">Current selection</div>
                <div className="grid gap-2 text-sm">
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
            </aside>
          </section>
        </div>
      </div>

      <div className="sticky-mobile-bar fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/92 px-3 py-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">
              {selectedModel.model} · {selectedPlan}
            </div>
            <div className="truncate text-xs text-slate-400">
              {activeStorage.storage} · {pricingTabs.find((t) => t.key === selectedTab)?.mobileLabel}
            </div>
          </div>

          <button
            onClick={copyQuote}
            disabled={!quoteText}
            className="rounded-2xl bg-green-500 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-50"
          >
            Copy Quote
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed right-3 top-3 z-50 rounded-2xl border border-green-500/30 bg-green-500/15 px-4 py-3 text-sm font-semibold text-green-200 shadow-2xl">
          {toast} ✅
        </div>
      )}
    </main>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 px-3 py-2">
      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-1 max-w-[180px] truncate text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function MiniBadge({ label }: { label: string }) {
  return (
    <div className="rounded-full border border-white/8 bg-white/4 px-3 py-1.5 text-xs text-slate-300">
      {label}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 p-3">
      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function MobileStackValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/6 px-4 py-3">
      <div className="text-sm text-slate-300">{label}</div>
      <div className="mt-1 text-lg font-bold text-white">{value || "NA"}</div>
    </div>
  );
}

function SelectionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-white/8 bg-white/4 px-3 py-3">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-semibold text-white">{value}</span>
    </div>
  );
}
