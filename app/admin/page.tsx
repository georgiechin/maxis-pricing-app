"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  catalog,
  CATALOG_SOURCE,
  CATALOG_DATE,
  type CatalogBrand,
  type CatalogStorage,
  type HotlinkRow,
} from "../../data/catalog";

// ── constants ──────────────────────────────────────────────────────────────
const STORAGE_KEY = "maxis-admin-auth";
const CHANGES_KEY = "maxis-admin-changes";

const MP_UPFRONT = ["MP69", "MP89", "MP99", "MP109", "MP139", "MP169", "MP199"];
const MP_ZERO = ["MP48", "MP69", "MP89", "MP99", "MP109", "MP139", "MP169", "MP199"];
const HP_ORDER = ["HP45", "HP65", "HP75"];

type TabKey = "upfront" | "upfront36" | "zero24" | "zero36" | "hotlink";

// ── flat device row for table ──────────────────────────────────────────────
interface DeviceRow {
  brand: string;
  model: string;
  storage: string;
  rrp: number;
  storageObj: CatalogStorage;
}

// ── change store ───────────────────────────────────────────────────────────
type ChangeKey = string; // e.g. "Apple|iPhone 16|128GB|upfront|MP69|devicePrice"
type ChangesMap = Record<ChangeKey, string | number>;

function makeChangeKey(
  brand: string,
  model: string,
  storage: string,
  tab: string,
  plan: string,
  field: string
): ChangeKey {
  return `${brand}|${model}|${storage}|${tab}|${plan}|${field}`;
}

// ── helpers ────────────────────────────────────────────────────────────────
function fmt(v: number | string | undefined): string {
  if (v === undefined || v === null) return "NA";
  if (v === "NA") return "NA";
  if (typeof v === "number") return v.toFixed(2).replace(/\.00$/, "");
  return String(v);
}

function getBestDeal(row: DeviceRow): string {
  const ecem = row.storageObj.regions.ECEM;
  if (ecem?.upfront) {
    for (const plan of MP_UPFRONT) {
      const r = ecem.upfront[plan];
      if (r && r.devicePrice === 0) return `Free on ${plan}`;
    }
    const first = MP_UPFRONT.find((p) => ecem.upfront![p]);
    if (first) {
      const r = ecem.upfront[first];
      const dp = r?.devicePrice;
      if (dp !== undefined && dp !== "NA") return `RM${dp} on ${first}`;
    }
  }
  const hl = row.storageObj.regions.HOTLINK;
  if (hl?.hotlink24) {
    for (const plan of HP_ORDER) {
      const r = hl.hotlink24[plan];
      if (r && r.devicePrice === 0) return `Free on ${plan} 24M`;
    }
  }
  if (hl?.hotlink12) {
    const first = HP_ORDER.find((p) => hl.hotlink12![p]);
    if (first) {
      const r = hl.hotlink12[first];
      if (r?.devicePrice !== undefined) return `RM${r.devicePrice} on ${first}`;
    }
  }
  return "–";
}

// ── build flat list ────────────────────────────────────────────────────────
function buildDeviceList(): DeviceRow[] {
  const rows: DeviceRow[] = [];
  for (const brand of catalog) {
    for (const model of brand.models) {
      for (const storage of model.storages) {
        rows.push({
          brand: brand.brand,
          model: model.model,
          storage: storage.storage,
          rrp: storage.rrp,
          storageObj: storage,
        });
      }
    }
  }
  return rows;
}

// ── CSV export ─────────────────────────────────────────────────────────────
function exportCsv(devices: DeviceRow[]) {
  const headers = [
    "Brand",
    "Model",
    "Storage",
    "RRP",
    "MP69 upfront",
    "MP89 upfront",
    "MP99 upfront",
    "MP109 upfront",
    "MP139 upfront",
    "MP169 upfront",
    "MP199 upfront",
    "MP48 zero24",
    "MP99 zero24",
    "MP139 zero24",
  ];
  const rows = devices.map((d) => {
    const ecem = d.storageObj.regions.ECEM;
    const getUp = (plan: string) =>
      fmt(ecem?.upfront?.[plan]?.devicePrice);
    const getZ24 = (plan: string) =>
      fmt(ecem?.zero24?.[plan]?.monthly);
    return [
      d.brand,
      d.model,
      d.storage,
      d.rrp,
      getUp("MP69"),
      getUp("MP89"),
      getUp("MP99"),
      getUp("MP109"),
      getUp("MP139"),
      getUp("MP169"),
      getUp("MP199"),
      getZ24("MP48"),
      getZ24("MP99"),
      getZ24("MP139"),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",");
  });
  const csv = [headers.map((h) => `"${h}"`).join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `maxis-pricing-${CATALOG_DATE}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── generate Python script ─────────────────────────────────────────────────
function generateScript(changes: ChangesMap): string {
  if (Object.keys(changes).length === 0) return "# No changes pending.";
  const lines = ["# Auto-generated pricing update script", "# Apply with: python update.py", ""];
  for (const [key, val] of Object.entries(changes)) {
    const parts = key.split("|");
    if (parts.length !== 6) continue;
    const [brand, model, storage, tab, plan, field] = parts;
    lines.push(
      `replace_unique("${brand}", "${model}", "${storage}", "${tab}", "${plan}", "${field}", ${JSON.stringify(val)})`
    );
  }
  return lines.join("\n");
}

// ── Edit panel component ───────────────────────────────────────────────────
interface EditPanelProps {
  device: DeviceRow | null;
  changes: ChangesMap;
  onClose: () => void;
  onChanges: (changes: ChangesMap) => void;
}

function EditPanel({ device, changes, onClose, onChanges }: EditPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("upfront");

  useEffect(() => {
    if (!device) return;
    const ecem = device.storageObj.regions.ECEM;
    const hl = device.storageObj.regions.HOTLINK;
    if (ecem?.upfront) setActiveTab("upfront");
    else if (ecem?.zero24) setActiveTab("zero24");
    else if (hl) setActiveTab("hotlink");
  }, [device]);

  if (!device) return null;

  const { brand, model, storage, storageObj } = device;
  const ecem = storageObj.regions.ECEM;
  const hl = storageObj.regions.HOTLINK;

  const allTabs: { key: TabKey; label: string }[] = [
    { key: "upfront", label: "Upfront 24M" },
    { key: "upfront36", label: "Upfront 36M" },
    { key: "zero24", label: "Zero24" },
    { key: "zero36", label: "Zero36" },
    { key: "hotlink", label: "Hotlink" },
  ];
  const tabs = allTabs.filter(({ key }) => {
    if (key === "hotlink") return !!hl;
    if (key === "upfront") return !!ecem?.upfront;
    if (key === "upfront36") return !!ecem?.upfront36;
    if (key === "zero24") return !!ecem?.zero24;
    if (key === "zero36") return !!ecem?.zero36;
    return false;
  });

  function handleField(
    tab: string,
    plan: string,
    field: string,
    value: string
  ) {
    const key = makeChangeKey(brand, model, storage, tab, plan, field);
    const updated = { ...changes };
    if (value === "") {
      delete updated[key];
    } else {
      updated[key] = isNaN(Number(value)) ? value : Number(value);
    }
    onChanges(updated);
  }

  function getVal(tab: string, plan: string, field: string): string {
    const key = makeChangeKey(brand, model, storage, tab, plan, field);
    if (key in changes) return String(changes[key]);
    return "";
  }

  function isChanged(tab: string, plan: string, field: string): boolean {
    return makeChangeKey(brand, model, storage, tab, plan, field) in changes;
  }

  function placeholder(tab: string, plan: string, field: string): string {
    if (tab === "upfront") {
      const r = ecem?.upfront?.[plan];
      if (!r) return "NA";
      return fmt((r as Record<string, unknown>)[field] as number | string);
    }
    if (tab === "upfront36") {
      const r = ecem?.upfront36?.[plan];
      if (!r) return "NA";
      return fmt((r as Record<string, unknown>)[field] as number | string);
    }
    if (tab === "zero24") {
      const r = ecem?.zero24?.[plan];
      if (!r) return "NA";
      return fmt((r as Record<string, unknown>)[field] as number | string);
    }
    if (tab === "zero36") {
      const r = ecem?.zero36?.[plan];
      if (!r) return "NA";
      return fmt((r as Record<string, unknown>)[field] as number | string);
    }
    return "NA";
  }

  const inputCls = (changed: boolean) =>
    `w-full rounded px-2 py-1 text-sm outline-none transition-all ${
      changed
        ? "bg-amber-500/20 border border-amber-400/60 text-amber-200"
        : "bg-white/5 border border-white/8 text-white/80"
    }`;

  return (
    <div
      className="fixed inset-y-0 right-0 z-50 flex flex-col"
      style={{
        width: 480,
        background: "#111417",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* header */}
      <div
        className="flex items-start justify-between p-4 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div>
          <div className="font-semibold text-base" style={{ color: "#ecf3ff" }}>
            {model}
          </div>
          <div className="text-xs mt-0.5" style={{ color: "#95a6c7" }}>
            {storage} · RRP RM{device.rrp}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-lg leading-none px-2 py-1 rounded hover:bg-white/10 transition-colors"
          style={{ color: "#95a6c7" }}
        >
          ✕
        </button>
      </div>

      {/* tabs */}
      <div
        className="flex gap-1 px-4 pt-3 pb-2 overflow-x-auto"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all"
            style={
              activeTab === t.key
                ? { background: "#00D46A", color: "#0a0d0f", fontWeight: 600 }
                : {
                    background: "rgba(255,255,255,0.05)",
                    color: "#95a6c7",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* body */}
      <div className="flex-1 overflow-y-auto p-4">
        {(activeTab === "upfront" || activeTab === "upfront36") && (
          <UpfrontTable
            plans={MP_UPFRONT}
            tabKey={activeTab}
            ecem={
              activeTab === "upfront" ? ecem?.upfront : ecem?.upfront36
            }
            getVal={getVal}
            isChanged={isChanged}
            handleField={handleField}
            placeholder={placeholder}
            inputCls={inputCls}
          />
        )}
        {(activeTab === "zero24" || activeTab === "zero36") && (
          <ZeroTable
            plans={MP_ZERO}
            tabKey={activeTab}
            data={activeTab === "zero24" ? ecem?.zero24 : ecem?.zero36}
            getVal={getVal}
            isChanged={isChanged}
            handleField={handleField}
            placeholder={placeholder}
            inputCls={inputCls}
          />
        )}
        {activeTab === "hotlink" && (
          <HotlinkTable
            hl={hl}
            brand={brand}
            model={model}
            storage={storage}
            changes={changes}
            onChanges={onChanges}
          />
        )}
      </div>
    </div>
  );
}

// ── sub-tables ──────────────────────────────────────────────────────────────
function UpfrontTable({
  plans,
  tabKey,
  ecem,
  getVal,
  isChanged,
  handleField,
  placeholder,
  inputCls,
}: {
  plans: string[];
  tabKey: string;
  ecem: Record<string, { devicePrice?: number | string; dap?: number | string; totalUpfront?: number | string }> | undefined;
  getVal: (tab: string, plan: string, field: string) => string;
  isChanged: (tab: string, plan: string, field: string) => boolean;
  handleField: (tab: string, plan: string, field: string, value: string) => void;
  placeholder: (tab: string, plan: string, field: string) => string;
  inputCls: (changed: boolean) => string;
}) {
  const availPlans = plans.filter((p) => ecem?.[p]);
  if (availPlans.length === 0)
    return <p className="text-sm" style={{ color: "#95a6c7" }}>No data for this tab.</p>;

  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr style={{ color: "#95a6c7" }}>
          <th className="text-left pb-2 pr-2 font-medium">Plan</th>
          <th className="text-left pb-2 pr-2 font-medium">Device Price</th>
          <th className="text-left pb-2 pr-2 font-medium">DAP</th>
          <th className="text-left pb-2 font-medium">Total</th>
        </tr>
      </thead>
      <tbody>
        {availPlans.map((plan) => (
          <tr key={plan} className="border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <td className="py-2 pr-2 font-mono font-semibold text-xs" style={{ color: "#00D46A" }}>
              {plan}
            </td>
            {(["devicePrice", "dap", "totalUpfront"] as const).map((field) => (
              <td key={field} className="py-2 pr-2">
                <input
                  type="text"
                  className={inputCls(isChanged(tabKey, plan, field))}
                  value={getVal(tabKey, plan, field)}
                  placeholder={placeholder(tabKey, plan, field)}
                  onChange={(e) => handleField(tabKey, plan, field, e.target.value)}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ZeroTable({
  plans,
  tabKey,
  data,
  getVal,
  isChanged,
  handleField,
  placeholder,
  inputCls,
}: {
  plans: string[];
  tabKey: string;
  data: Record<string, { monthly?: number | string }> | undefined;
  getVal: (tab: string, plan: string, field: string) => string;
  isChanged: (tab: string, plan: string, field: string) => boolean;
  handleField: (tab: string, plan: string, field: string, value: string) => void;
  placeholder: (tab: string, plan: string, field: string) => string;
  inputCls: (changed: boolean) => string;
}) {
  const availPlans = plans.filter((p) => data?.[p]);
  if (availPlans.length === 0)
    return <p className="text-sm" style={{ color: "#95a6c7" }}>No data for this tab.</p>;

  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr style={{ color: "#95a6c7" }}>
          <th className="text-left pb-2 pr-2 font-medium">Plan</th>
          <th className="text-left pb-2 font-medium">Monthly (RM)</th>
        </tr>
      </thead>
      <tbody>
        {availPlans.map((plan) => (
          <tr key={plan} className="border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <td className="py-2 pr-2 font-mono font-semibold text-xs" style={{ color: "#00D46A" }}>
              {plan}
            </td>
            <td className="py-2">
              <input
                type="text"
                className={inputCls(isChanged(tabKey, plan, "monthly"))}
                value={getVal(tabKey, plan, "monthly")}
                placeholder={placeholder(tabKey, plan, "monthly")}
                onChange={(e) => handleField(tabKey, plan, "monthly", e.target.value)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function HotlinkTable({
  hl,
  brand,
  model,
  storage,
  changes,
  onChanges,
}: {
  hl: CatalogStorage["regions"]["HOTLINK"];
  brand: string;
  model: string;
  storage: string;
  changes: ChangesMap;
  onChanges: (c: ChangesMap) => void;
}) {
  if (!hl) return null;

  const allPlans = HP_ORDER.filter(
    (p) => hl.hotlink12?.[p] || hl.hotlink24?.[p]
  );

  function getVal(dur: "hotlink12" | "hotlink24", plan: string, field: string): string {
    const k = makeChangeKey(brand, model, storage, dur, plan, field);
    return k in changes ? String(changes[k]) : "";
  }

  function isChanged(dur: string, plan: string, field: string): boolean {
    return makeChangeKey(brand, model, storage, dur, plan, field) in changes;
  }

  function handleField(dur: string, plan: string, field: string, value: string) {
    const k = makeChangeKey(brand, model, storage, dur, plan, field);
    const updated = { ...changes };
    if (value === "") delete updated[k];
    else updated[k] = isNaN(Number(value)) ? value : Number(value);
    onChanges(updated);
  }

  function ph(dur: "hotlink12" | "hotlink24", plan: string, field: keyof HotlinkRow): string {
    const r = hl?.[dur]?.[plan];
    if (!r) return "NA";
    return fmt(r[field] as number | string);
  }

  const inputCls = (changed: boolean) =>
    `w-full rounded px-2 py-1 text-xs outline-none transition-all ${
      changed
        ? "bg-amber-500/20 border border-amber-400/60 text-amber-200"
        : "bg-white/5 border border-white/8 text-white/80"
    }`;

  return (
    <div className="space-y-4">
      {(["hotlink12", "hotlink24"] as const).map((dur) => (
        <div key={dur}>
          <div className="text-xs font-semibold mb-2" style={{ color: "#95a6c7" }}>
            {dur === "hotlink12" ? "12-Month" : "24-Month"}
          </div>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr style={{ color: "#95a6c7" }}>
                <th className="text-left pb-1 pr-2 font-medium">Plan</th>
                <th className="text-left pb-1 pr-1 font-medium">Device</th>
                <th className="text-left pb-1 pr-1 font-medium">DAP</th>
                <th className="text-left pb-1 pr-1 font-medium">Total</th>
                <th className="text-left pb-1 font-medium">Monthly</th>
              </tr>
            </thead>
            <tbody>
              {allPlans
                .filter((p) => hl[dur]?.[p])
                .map((plan) => (
                  <tr key={plan} className="border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <td className="py-1.5 pr-2 font-mono font-semibold" style={{ color: "#00D46A" }}>
                      {plan}
                    </td>
                    {(["devicePrice", "dap", "totalUpfront", "monthly"] as const).map((field) => (
                      <td key={field} className="py-1.5 pr-1">
                        <input
                          type="text"
                          className={inputCls(isChanged(dur, plan, field))}
                          value={getVal(dur, plan, field)}
                          placeholder={ph(dur, plan, field)}
                          onChange={(e) => handleField(dur, plan, field, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

// ── View modal ─────────────────────────────────────────────────────────────
function ViewModal({
  device,
  onClose,
}: {
  device: DeviceRow | null;
  onClose: () => void;
}) {
  if (!device) return null;
  const { model, storage, storageObj } = device;
  const ecem = storageObj.regions.ECEM;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
        style={{
          background: "#111417",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold" style={{ color: "#ecf3ff" }}>
              {model} · {storage}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "#95a6c7" }}>
              RRP RM{storageObj.rrp} · Upfront 24M pricing
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded hover:bg-white/10"
            style={{ color: "#95a6c7" }}
          >
            ✕
          </button>
        </div>
        {ecem?.upfront ? (
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr style={{ color: "#95a6c7" }}>
                <th className="text-left pb-2 pr-2">Plan</th>
                <th className="text-right pb-2 pr-2">Device (RM)</th>
                <th className="text-right pb-2 pr-2">DAP (RM)</th>
                <th className="text-right pb-2">Total (RM)</th>
              </tr>
            </thead>
            <tbody>
              {MP_UPFRONT.filter((p) => ecem.upfront![p]).map((plan) => {
                const r = ecem.upfront![plan];
                return (
                  <tr
                    key={plan}
                    className="border-t"
                    style={{ borderColor: "rgba(255,255,255,0.05)" }}
                  >
                    <td className="py-2 pr-2 font-mono font-semibold" style={{ color: "#00D46A" }}>
                      {plan}
                    </td>
                    <td className="text-right py-2 pr-2" style={{ color: "#ecf3ff" }}>
                      {fmt(r?.devicePrice)}
                    </td>
                    <td className="text-right py-2 pr-2" style={{ color: "#95a6c7" }}>
                      {fmt(r?.dap)}
                    </td>
                    <td className="text-right py-2" style={{ color: "#ecf3ff" }}>
                      {fmt(r?.totalUpfront)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-sm" style={{ color: "#95a6c7" }}>
            No Upfront 24M pricing available.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Script modal ───────────────────────────────────────────────────────────
function ScriptModal({
  changes,
  onClose,
}: {
  changes: ChangesMap;
  onClose: () => void;
}) {
  const script = generateScript(changes);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      //
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col"
        style={{
          background: "#111417",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold" style={{ color: "#ecf3ff" }}>
            Generated Update Script
          </div>
          <div className="flex gap-2">
            <button
              onClick={copy}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: copied ? "#00D46A" : "rgba(0,212,106,0.15)",
                color: copied ? "#0a0d0f" : "#00D46A",
                border: "1px solid rgba(0,212,106,0.3)",
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={onClose}
              className="px-2 py-1 rounded hover:bg-white/10"
              style={{ color: "#95a6c7" }}
            >
              ✕
            </button>
          </div>
        </div>
        <pre
          className="flex-1 overflow-y-auto text-xs rounded-xl p-4 font-mono"
          style={{
            background: "#0a0d0f",
            color: "#ecf3ff",
            border: "1px solid rgba(255,255,255,0.06)",
            lineHeight: 1.7,
          }}
        >
          {script}
        </pre>
      </div>
    </div>
  );
}

// ── main page ──────────────────────────────────────────────────────────────
export default function AdminPage() {
  const allDevices = useMemo(() => buildDeviceList(), []);
  const allBrands = useMemo(
    () => ["All", ...Array.from(new Set(allDevices.map((d) => d.brand))).sort()],
    [allDevices]
  );

  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"rrp" | "alpha">("alpha");
  const [changes, setChanges] = useState<ChangesMap>({});
  const [editDevice, setEditDevice] = useState<DeviceRow | null>(null);
  const [viewDevice, setViewDevice] = useState<DeviceRow | null>(null);
  const [showScript, setShowScript] = useState(false);

  // load changes from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHANGES_KEY);
      if (raw) setChanges(JSON.parse(raw));
    } catch {
      //
    }
  }, []);

  // persist changes
  const handleChanges = useCallback((c: ChangesMap) => {
    setChanges(c);
    try {
      localStorage.setItem(CHANGES_KEY, JSON.stringify(c));
    } catch {
      //
    }
  }, []);

  function clearChanges() {
    handleChanges({});
  }

  function logout() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      //
    }
    window.location.reload();
  }

  const filtered = useMemo(() => {
    let rows = allDevices;
    if (brandFilter !== "All") rows = rows.filter((d) => d.brand === brandFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (d) =>
          d.model.toLowerCase().includes(q) ||
          d.brand.toLowerCase().includes(q) ||
          d.storage.toLowerCase().includes(q)
      );
    }
    if (sortBy === "rrp") {
      rows = [...rows].sort((a, b) => a.rrp - b.rrp);
    } else {
      rows = [...rows].sort((a, b) => a.model.localeCompare(b.model));
    }
    return rows;
  }, [allDevices, brandFilter, search, sortBy]);

  const changeCount = Object.keys(changes).length;

  const totalBrands = useMemo(
    () => new Set(allDevices.map((d) => d.brand)).size,
    [allDevices]
  );

  return (
    <>
      {/* main content */}
      <div
        className="min-h-screen pb-24"
        style={{ background: "#0a0d0f", color: "#ecf3ff" }}
      >
        {/* header */}
        <div
          className="sticky top-0 z-40 flex items-center justify-between px-6 py-3"
          style={{
            background: "rgba(10,13,15,0.95)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="font-bold text-base tracking-tight" style={{ color: "#ecf3ff" }}>
            GC Pricing Admin
          </div>
          <div
            className="text-xs px-3 py-1.5 rounded-full font-medium"
            style={{
              background: "rgba(0,212,106,0.12)",
              color: "#00D46A",
              border: "1px solid rgba(0,212,106,0.25)",
            }}
          >
            GTM: {CATALOG_SOURCE}
          </div>
          <button
            onClick={logout}
            className="text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-white/10"
            style={{ color: "#95a6c7", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Logout
          </button>
        </div>

        <div className="px-6 py-6 max-w-7xl mx-auto space-y-6">
          {/* stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Devices", value: allDevices.length },
              { label: "Brands", value: totalBrands },
              { label: "Last Updated", value: CATALOG_DATE },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-4"
                style={{
                  background: "#111417",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="text-xs mb-1" style={{ color: "#95a6c7" }}>
                  {s.label}
                </div>
                <div className="text-xl font-bold" style={{ color: "#ecf3ff" }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* search + sort */}
          <div className="flex gap-3 items-center flex-wrap">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search devices..."
              className="flex-1 min-w-48 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              style={{
                background: "#111417",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#ecf3ff",
              }}
            />
            <div className="flex gap-2">
              {(["alpha", "rrp"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className="text-xs px-3 py-2 rounded-lg transition-all"
                  style={
                    sortBy === s
                      ? { background: "#00D46A", color: "#0a0d0f", fontWeight: 600 }
                      : {
                          background: "#111417",
                          color: "#95a6c7",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }
                  }
                >
                  {s === "alpha" ? "A–Z" : "By RRP"}
                </button>
              ))}
            </div>
          </div>

          {/* brand filter pills */}
          <div className="flex gap-2 flex-wrap">
            {allBrands.map((b) => (
              <button
                key={b}
                onClick={() => setBrandFilter(b)}
                className="text-xs px-3 py-1.5 rounded-full transition-all"
                style={
                  brandFilter === b
                    ? { background: "#00D46A", color: "#0a0d0f", fontWeight: 600 }
                    : {
                        background: "rgba(255,255,255,0.05)",
                        color: "#95a6c7",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }
                }
              >
                {b}
              </button>
            ))}
          </div>

          {/* device table */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "#111417",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr
                    className="text-xs"
                    style={{
                      color: "#95a6c7",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <th className="text-left px-4 py-3 font-medium">Device</th>
                    <th className="text-left px-4 py-3 font-medium">Storage</th>
                    <th className="text-right px-4 py-3 font-medium">RRP (RM)</th>
                    <th className="text-left px-4 py-3 font-medium">Best Deal</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d, i) => (
                    <tr
                      key={`${d.brand}-${d.model}-${d.storage}`}
                      style={{
                        borderTop:
                          i === 0 ? undefined : "1px solid rgba(255,255,255,0.04)",
                      }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium" style={{ color: "#ecf3ff" }}>
                          {d.model}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: "#95a6c7" }}>
                          {d.brand}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "#ecf3ff" }}>
                        {d.storage}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm" style={{ color: "#ecf3ff" }}>
                        {d.rrp.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#00D46A" }}>
                        {getBestDeal(d)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setViewDevice(d)}
                            className="text-xs px-2.5 py-1 rounded-lg transition-all"
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              color: "#95a6c7",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            View
                          </button>
                          <button
                            onClick={() => setEditDevice(d)}
                            className="text-xs px-2.5 py-1 rounded-lg transition-all"
                            style={{
                              background: "rgba(0,212,106,0.1)",
                              color: "#00D46A",
                              border: "1px solid rgba(0,212,106,0.25)",
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm"
                        style={{ color: "#95a6c7" }}
                      >
                        No devices match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* edit panel overlay */}
      {editDevice && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setEditDevice(null)}
        />
      )}
      <EditPanel
        device={editDevice}
        changes={changes}
        onClose={() => setEditDevice(null)}
        onChanges={handleChanges}
      />

      {/* view modal */}
      {viewDevice && (
        <ViewModal device={viewDevice} onClose={() => setViewDevice(null)} />
      )}

      {/* script modal */}
      {showScript && (
        <ScriptModal changes={changes} onClose={() => setShowScript(false)} />
      )}

      {/* bottom action bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-3 gap-4"
        style={{
          background: "rgba(17,20,23,0.97)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="text-sm font-medium" style={{ color: changeCount > 0 ? "#00D46A" : "#95a6c7" }}>
          {changeCount > 0 ? `${changeCount} change${changeCount !== 1 ? "s" : ""} pending` : "No changes"}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportCsv(allDevices)}
            className="text-xs px-3 py-2 rounded-lg transition-all"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "#ecf3ff",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Export CSV
          </button>
          <button
            onClick={clearChanges}
            disabled={changeCount === 0}
            className="text-xs px-3 py-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "rgba(255,107,107,0.12)",
              color: "#ff6b6b",
              border: "1px solid rgba(255,107,107,0.25)",
            }}
          >
            Clear Changes
          </button>
          <button
            onClick={() => setShowScript(true)}
            disabled={changeCount === 0}
            className="text-xs px-3 py-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
            style={{
              background: changeCount > 0 ? "#00D46A" : "rgba(0,212,106,0.2)",
              color: changeCount > 0 ? "#0a0d0f" : "#00D46A",
            }}
          >
            Generate Script
          </button>
        </div>
      </div>
    </>
  );
}
