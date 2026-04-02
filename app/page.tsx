"use client";

import { useMemo, useState } from "react";
import {
  catalog,
  type CatalogBrand,
  type CatalogModel,
  type PricingMode,
} from "../data/catalog";

const pricingTabs: { key: PricingMode; label: string }[] = [
  { key: "upfront", label: "Upfront" },
  { key: "zero24", label: "Zero 24M" },
  { key: "zero36", label: "Zero 36M" },
];

const mpOrder = ["MP69", "MP89", "MP99", "MP109", "MP139", "MP169", "MP199"];

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function normalizeTight(text: string) {
  return text.toLowerCase().replace(/[\s"']/g, "").trim();
}

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
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<CatalogBrand["brand"]>(catalog[0].brand);
  const [selectedModel, setSelectedModel] = useState<CatalogModel>(catalog[0].models[0]);
  const [selectedStorage, setSelectedStorage] = useState(catalog[0].models[0].storages[0].storage);
  const [selectedTab, setSelectedTab] = useState<PricingMode>("upfront");
  const [selectedPlan, setSelectedPlan] = useState("MP99");

  const activeBrand = useMemo(
    () => catalog.find((b) => b.brand === selectedBrand) || catalog[0],
    [selectedBrand]
  );

  const filteredModels = useMemo(() => {
    const q = normalize(search);
    const qTight = normalizeTight(search);
    if (!q) return activeBrand.models;

    return activeBrand.models.filter((m) => {
      const hitModel = normalize(m.model).includes(q) || normalizeTight(m.model).includes(qTight);
      const hitAliases = m.aliases.some(
        (a) =>
          normalize(a).includes(q) ||
          q.includes(normalize(a)) ||
          normalizeTight(a).includes(qTight) ||
          qTight.includes(normalizeTight(a))
      );
      const hitStorage = m.storages.some(
        (s) =>
          normalize(s.storage).includes(q) ||
          normalizeTight(s.storage).includes(qTight) ||
          qTight.includes(normalizeTight(s.storage))
      );
      return hitModel || hitAliases || hitStorage;
    });
  }, [search, activeBrand]);

  const activeStorage = useMemo(
    () =>
      selectedModel.storages.find((s) => s.storage === selectedStorage) ||
      selectedModel.storages[0],
    [selectedModel, selectedStorage]
  );

  const regionPricing = activeStorage.regions.ECEM || null;
  const currentTable = regionPricing ? regionPricing[selectedTab] : null;
  const selectedRow = currentTable?.[selectedPlan];

  const globalSuggestions = useMemo(() => {
    const q = normalize(search);
    const qTight = normalizeTight(search);
    if (!q) return [];

    const hits: {
      brand: string;
      model: CatalogModel;
      score: number;
    }[] = [];

    for (const brand of catalog) {
      for (const model of brand.models) {
        let score = 0;

        if (normalize(model.model) === q || normalizeTight(model.model) === qTight) score += 100;
        if (normalize(model.model).includes(q) || normalizeTight(model.model).includes(qTight)) score += 40;

        for (const alias of model.aliases) {
          if (normalize(alias) === q || normalizeTight(alias) === qTight) score += 90;
          else if (
            normalize(alias).includes(q) ||
            q.includes(normalize(alias)) ||
            normalizeTight(alias).includes(qTight) ||
            qTight.includes(normalizeTight(alias))
          ) {
            score += 30;
          }
        }

        for (const storage of model.storages) {
          if (
            normalize(storage.storage).includes(q) ||
            normalizeTight(storage.storage).includes(qTight) ||
            qTight.includes(normalizeTight(storage.storage))
          ) {
            score += 10;
          }
        }

        if (score > 0) {
          hits.push({ brand: brand.brand, model, score });
        }
      }
    }

    return hits.sort((a, b) => b.score - a.score).slice(0, 8);
  }, [search]);

  const chooseModel = (brandName: string, model: CatalogModel) => {
    setSelectedBrand(brandName);
    setSelectedModel(model);
    setSelectedStorage(model.storages[0].storage);
    setSelectedTab("upfront");
  };

  const quoteText = useMemo(() => {
    if (!regionPricing || !selectedRow) return "";

    if (selectedTab === "upfront") {
      return `🔥 ${selectedModel.model}
📦 Storage: ${activeStorage.storage}
📍 Region: ECEM
📱 Plan: ${selectedPlan}

💰 Device Price / Upfront: ${moneyPlain((selectedRow as { devicePrice?: number | string }).devicePrice)}
📉 DAP: ${"dapLabel" in selectedRow && selectedRow.dapLabel ? selectedRow.dapLabel : moneyPlain((selectedRow as { dap?: number | string }).dap)}
🧾 Total Upfront: ${moneyPlain((selectedRow as { totalUpfront?: number | string }).totalUpfront)}`;
    }

    return `🔥 ${selectedModel.model}
📦 Storage: ${activeStorage.storage}
📍 Region: ECEM
📱 Plan: ${selectedPlan}
🗓 Mode: ${selectedTab === "zero24" ? "Zerolution 24M" : "Zerolution 36M"}

📆 Monthly: ${moneyPlain((selectedRow as { monthly?: number | string }).monthly)}
📝 Note: ${"dapLabel" in selectedRow && selectedRow.dapLabel ? selectedRow.dapLabel : "Check ECC"}`;
  }, [regionPricing, selectedRow, selectedModel, activeStorage, selectedPlan, selectedTab]);

  const copyQuote = async () => {
    if (!quoteText) return;
    await navigator.clipboard.writeText(quoteText);
    alert("Quote copied ✅");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <div className="rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
          <div className="border-b border-white/10 px-5 py-5 md:px-6">
            <h1 className="text-2xl font-bold md:text-3xl">ECEM Device Pricing Browser</h1>
            <p className="mt-1 text-sm text-slate-400">
              Staff mode · browse by brand, model, storage, pricing type, and quick quote
            </p>
          </div>

          <div className="grid gap-6 p-5 md:grid-cols-[280px_1fr] md:p-6">
            <div className="space-y-5">
              <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-100">
                ECEM pricing only
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Search</label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Try: ip17, 17 pro, honor 600, samsung"
                  className="w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-green-500"
                />
              </div>

              <div>
                <div className="mb-2 text-sm font-medium text-slate-300">Brands</div>
                <div className="flex flex-wrap gap-2">
                  {catalog.map((brand) => (
                    <button
                      key={brand.brand}
                      onClick={() => {
                        setSelectedBrand(brand.brand);
                        setSelectedModel(brand.models[0]);
                        setSelectedStorage(brand.models[0].storages[0].storage);
                        setSelectedTab("upfront");
                        setSelectedPlan("MP99");
                      }}
                      className={`rounded-full px-3 py-2 text-sm transition ${
                        selectedBrand === brand.brand
                          ? "bg-green-500 font-semibold text-black"
                          : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                      }`}
                    >
                      {brand.brand}
                    </button>
                  ))}
                </div>
              </div>

              {globalSuggestions.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-slate-800 p-3">
                  <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">
                    Search results
                  </div>
                  <div className="space-y-2">
                    {globalSuggestions.map((item) => (
                      <button
                        key={`${item.brand}-${item.model.model}`}
                        onClick={() => chooseModel(item.brand, item.model)}
                        className="block w-full rounded-xl px-3 py-3 text-left hover:bg-slate-700"
                      >
                        <div className="font-medium text-white">{item.model.model}</div>
                        <div className="text-xs text-slate-400">{item.brand}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-slate-800 p-3">
                <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">
                  Models in {activeBrand.brand}
                </div>
                <div className="max-h-[460px] space-y-2 overflow-y-auto pr-1">
                  {filteredModels.map((model) => (
                    <button
                      key={model.model}
                      onClick={() => chooseModel(activeBrand.brand, model)}
                      className={`block w-full rounded-xl px-3 py-3 text-left transition ${
                        selectedModel.model === model.model
                          ? "bg-slate-700"
                          : "hover:bg-slate-700"
                      }`}
                    >
                      <div className="font-medium text-white">{model.model}</div>
                      <div className="text-xs text-slate-400">
                        {model.storages.map((s) => s.storage).join(" · ")}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl border border-white/10 bg-slate-800/60 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-sm text-slate-400">{selectedBrand}</div>
                    <h2 className="text-2xl font-bold">{selectedModel.model}</h2>
                    <div className="mt-2 text-sm text-slate-300">
                      Browse by storage and pricing type
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-900 px-4 py-3 text-sm">
                    <div className="text-slate-400">Region</div>
                    <div className="font-semibold text-white">East Malaysia (EC / EM)</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium text-slate-300">Storage</div>
                <div className="flex flex-wrap gap-2">
                  {selectedModel.storages.map((storage) => (
                    <button
                      key={storage.storage}
                      onClick={() => setSelectedStorage(storage.storage)}
                      className={`rounded-full px-3 py-2 text-sm transition ${
                        selectedStorage === storage.storage
                          ? "bg-green-500 font-semibold text-black"
                          : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                      }`}
                    >
                      {storage.storage}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-800/60 p-5">
                <div className="grid gap-3 md:grid-cols-3">
                  <InfoCard label="Storage" value={activeStorage.storage} />
                  <InfoCard label="RRP" value={formatMoney(activeStorage.rrp)} />
                  <InfoCard label="Notes" value={activeStorage.notes || "ECEM pricing"} />
                </div>
              </div>

              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  {pricingTabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedTab(tab.key)}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        selectedTab === tab.key
                          ? "bg-green-500 font-semibold text-black"
                          : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {regionPricing ? (
                  <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
                    <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-white">
                      {selectedModel.model} · {activeStorage.storage} ·{" "}
                      {pricingTabs.find((t) => t.key === selectedTab)?.label}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-slate-800 text-slate-300">
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
                                className={`cursor-pointer border-t border-white/5 ${
                                  isSelected ? "bg-green-500/10" : "hover:bg-white/5"
                                }`}
                              >
                                <td className="px-4 py-3 font-medium text-white">{mp}</td>

                                {selectedTab === "upfront" ? (
                                  <>
                                    <td className="px-4 py-3 text-slate-200">
                                      {row ? formatMoney((row as { devicePrice?: number | string }).devicePrice) : "NA"}
                                    </td>
                                    <td className="px-4 py-3 text-slate-200">
                                      {row
                                        ? "dapLabel" in row && row.dapLabel
                                          ? row.dapLabel
                                          : formatMoney((row as { dap?: number | string }).dap)
                                        : "NA"}
                                    </td>
                                    <td className="px-4 py-3 text-slate-200">
                                      {row ? formatMoney((row as { totalUpfront?: number | string }).totalUpfront) : "NA"}
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td className="px-4 py-3 text-slate-200">
                                      {row ? formatMoney((row as { monthly?: number | string }).monthly) : "NA"}
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
                ) : (
                  <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100">
                    No ECEM pricing loaded for this model.
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-green-500/20 bg-green-500/10 p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">Quick Quote</div>
                    <div className="text-xs text-green-100/80">
                      Tap any plan row above, then copy for WhatsApp
                    </div>
                  </div>
                  <button
                    onClick={copyQuote}
                    disabled={!quoteText}
                    className="rounded-2xl bg-green-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Copy Quote
                  </button>
                </div>

                <div className="rounded-2xl bg-slate-950/50 p-4">
                  <pre className="whitespace-pre-wrap text-sm text-slate-200">
                    {quoteText || "Select a valid plan row to generate quote."}
                  </pre>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-800/60 p-5">
                <div className="text-sm font-semibold text-white">Sales notes</div>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  <li>• Search is for fast staff.</li>
                  <li>• Brand → model → storage is for browsing.</li>
                  <li>• Click any plan row to prepare quick quote.</li>
                  <li>• This version is ECEM only.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-900 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-2 text-base font-semibold text-white">{value}</div>
    </div>
  );
}