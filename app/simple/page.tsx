"use client";

// Simple screen: one question at a time, one answer on screen.
//   find the phone → how the customer pays → which plan → the price → send it.
// Everything else (budget finder, upsell ladder, compare, home WiFi) stays in the
// full app at "/", one tap away.
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { CATALOG_DATE, LATEST_UPDATES } from "../../data/catalog";
import {
  BRANDS,
  PHONES,
  PHONE_BY_ID,
  TYPE_LABEL,
  freeUpgrade,
  hasHotlink,
  planFee,
  plansFor,
  quote,
  rm,
  searchPhones,
  storageText,
  termLabel,
  termsFor,
  typesFor,
  whatsappText,
  type PayType,
  type Phone,
  type Quote,
  type Term,
} from "./phones";

type View = "home" | "phone" | "free";
type Prefs = {
  type?: PayType;
  term: Partial<Record<PayType, Term>>;
  plan: Partial<Record<PayType, string>>;
};
type Selection = { type: PayType; term: Term; plan: string };

const PREFS_KEY = "gc-simple-prefs";
const RECENT_KEY = "gc-simple-recent";
const SEEN_KEY = "gc-simple-updates-seen";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function prettyDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return y && m && d ? `${d} ${MONTHS[m - 1]} ${y}` : iso;
}

const PRICE_DATE = prettyDate(CATALOG_DATE);
const UPDATES_ID = LATEST_UPDATES[0] ? `${LATEST_UPDATES[0].date}|${LATEST_UPDATES[0].text}` : "";

// A value kept in localStorage, read through useSyncExternalStore: the server render
// and hydration use `serverValue` (no mismatch), then React switches to the stored
// value. If storage is blocked (private mode) it lives in memory for the visit.
function storedValue<T>(key: string, fallback: T, serverValue: T = fallback) {
  let memory: string | null = null;
  let cache: { raw: string | null; value: T } | null = null;
  const listeners = new Set<() => void>();
  const readRaw = () => {
    try {
      return localStorage.getItem(key);
    } catch {
      return memory;
    }
  };
  return {
    get(): T {
      const raw = readRaw();
      if (!cache || cache.raw !== raw) {
        let value = fallback;
        try {
          if (raw) value = JSON.parse(raw) as T;
        } catch {
          /* corrupt value: start fresh */
        }
        cache = { raw, value };
      }
      return cache.value;
    },
    getServer: () => serverValue,
    set(value: T) {
      memory = JSON.stringify(value);
      try {
        localStorage.setItem(key, memory);
      } catch {
        /* private mode / storage full: kept in memory for this visit */
      }
      listeners.forEach((l) => l());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      const onStorage = (e: StorageEvent) => e.key === key && listener();
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
  };
}

const NO_PREFS: Prefs = { term: {}, plan: {} };
const NO_RECENT: string[] = [];
const prefsStore = storedValue<Prefs>(PREFS_KEY, NO_PREFS);
const recentStore = storedValue<string[]>(RECENT_KEY, NO_RECENT);
// The server render assumes "seen" so the new-updates dot only ever appears client-side.
const seenStore = storedValue<string>(SEEN_KEY, "", UPDATES_ID);

function useStored<T>(store: ReturnType<typeof storedValue<T>>) {
  return useSyncExternalStore(store.subscribe, store.get, store.getServer);
}

function closestPlan(plans: string[], wanted: string) {
  const pool = plans.filter((p) => p !== "MP48");
  const list = pool.length ? pool : plans;
  const target = planFee(wanted);
  return list.reduce((best, p) => {
    const d = Math.abs(planFee(p) - target);
    const bd = Math.abs(planFee(best) - target);
    return d < bd || (d === bd && planFee(p) > planFee(best)) ? p : best;
  }, list[0]);
}

function pickSelection(phone: Phone, storageIdx: number, prefs: Prefs, want: Partial<Selection> = {}): Selection {
  const st = phone.storages[storageIdx];
  const types = typesFor(st);
  const type = ([want.type, prefs.type].find((t) => t && types.includes(t)) ?? types[0]) as PayType;
  const terms = termsFor(st, type);
  const term = ([want.term, prefs.term[type]].find((t) => t && terms.includes(t)) ?? terms[0]) as Term;
  const plans = plansFor(st, type, term);
  const wanted = want.plan ?? prefs.plan[type] ?? (type === "hotlink" ? "HP75" : "MP99");
  return { type, term, plan: plans.includes(wanted) ? wanted : closestPlan(plans, wanted) };
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export default function SimplePage() {
  const [view, setView] = useState<View>("home");
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState<string | null>(null);
  const [phoneId, setPhoneId] = useState<string | null>(null);
  const [storageIdx, setStorageIdx] = useState(0);
  const [sel, setSel] = useState<Selection | null>(null);
  const [planNote, setPlanNote] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [customer, setCustomer] = useState(false);
  const [updatesOpen, setUpdatesOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [freeType, setFreeType] = useState<PayType>("upfront");
  const [freePlan, setFreePlan] = useState("MP99");
  const prefs = useStored(prefsStore);
  const savedRecent = useStored(recentStore);
  const recent = useMemo(() => savedRecent.filter((id) => PHONE_BY_ID.has(id)), [savedRecent]);
  const unseen = useStored(seenStore) !== UPDATES_ID;

  // Phone back button / swipe-back walks back through the screens instead of
  // leaving the app.
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const s = (e.state as { simple?: string } | null)?.simple;
      setCustomer(s === "customer");
      if (s === "customer" || s === "phone") setView("phone");
      else if (s === "free") setView("free");
      else setView("home");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const phone = phoneId ? PHONE_BY_ID.get(phoneId) ?? null : null;
  const st = phone ? phone.storages[storageIdx] ?? phone.storages[0] : null;
  const q: Quote | null = phone && st && sel ? quote(st, sel.type, sel.term, sel.plan) : null;

  const rememberChoice = (s: Selection) => {
    const p = prefsStore.get();
    prefsStore.set({
      type: s.type,
      term: { ...p.term, [s.type]: s.term },
      plan: { ...p.plan, [s.type]: s.plan },
    });
  };

  const openPhone = (id: string, want: Partial<Selection> = {}, storage = 0) => {
    const p = PHONE_BY_ID.get(id);
    if (!p) return;
    const idx = Math.min(storage, p.storages.length - 1);
    const s = pickSelection(p, idx, prefs, want);
    const wanted = want.plan ?? prefs.plan[s.type];
    setPlanNote(wanted && wanted !== s.plan ? `${wanted} isn't offered for this phone — showing ${s.plan}.` : "");
    setPhoneId(id);
    setStorageIdx(idx);
    setSel(s);
    setShowAll(false);
    setView("phone");
    recentStore.set([id, ...recentStore.get().filter((x) => x !== id)].slice(0, 8));
    window.history.pushState({ simple: "phone" }, "");
    window.scrollTo(0, 0);
  };

  const change = (patch: Partial<Selection>, storage = storageIdx) => {
    if (!phone || !sel) return;
    const want: Partial<Selection> = { ...sel, ...patch };
    // A new way to pay starts from what this staff member last used for it.
    if (patch.type && patch.type !== sel.type) {
      want.term = undefined;
      want.plan = undefined;
    }
    const next = pickSelection(phone, storage, prefs, want);
    const sameFamily = next.plan.slice(0, 2) === sel.plan.slice(0, 2);
    setPlanNote(
      patch.plan === undefined && sameFamily && next.plan !== sel.plan
        ? `${sel.plan} isn't offered here — showing ${next.plan}.`
        : ""
    );
    setStorageIdx(storage);
    setSel(next);
    rememberChoice(next);
  };

  const openFree = () => {
    // "What's free?" almost always means a free phone on an upfront deal.
    const plan = prefs.plan.upfront ?? "MP99";
    setFreeType("upfront");
    setFreePlan(FREE_PLANS.upfront.includes(plan) ? plan : "MP99");
    setView("free");
    window.history.pushState({ simple: "free" }, "");
    window.scrollTo(0, 0);
  };

  const showCustomer = () => {
    setCustomer(true);
    window.history.pushState({ simple: "customer" }, "");
  };

  const back = () => window.history.back();

  const openUpdates = () => {
    setUpdatesOpen(true);
    seenStore.set(UPDATES_ID);
  };

  const results = useMemo(() => searchPhones(query), [query]);
  const brandPhones = useMemo(
    () => PHONES.filter((p) => !p.eol && (brand === "Hotlink" ? hasHotlink(p) : p.brand === brand)),
    [brand]
  );

  const message = phone && st && q ? whatsappText(phone, st, q, PRICE_DATE) : "";
  // After a reload the browser history can still point at a phone screen that no
  // longer has a phone loaded; fall back to Home instead of a blank page.
  const screen: View = view === "phone" && !(phone && st && sel) ? "home" : view;

  // ── Screens ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0d0f] font-sans text-[#ecf3ff]">
      <div className="mx-auto w-full max-w-[560px] px-4 pb-32">
        {screen === "home" && (
          <HomeScreen
            query={query}
            setQuery={setQuery}
            results={results}
            recent={recent}
            brand={brand}
            setBrand={setBrand}
            brandPhones={brandPhones}
            openPhone={openPhone}
            openFree={openFree}
            unseen={unseen}
            openUpdates={openUpdates}
          />
        )}

        {screen === "phone" && phone && st && sel && (
          <PhoneScreen
            phone={phone}
            storageIdx={storageIdx}
            sel={sel}
            q={q}
            planNote={planNote}
            showAll={showAll}
            setShowAll={setShowAll}
            change={change}
            back={back}
          />
        )}

        {screen === "free" && (
          <FreeScreen
            type={freeType}
            plan={freePlan}
            setType={(t) => {
              setFreeType(t);
              setFreePlan(t === "hotlink" ? "HP75" : freePlan.startsWith("HP") ? "MP99" : freePlan);
            }}
            setPlan={setFreePlan}
            back={back}
            openPhone={openPhone}
          />
        )}
      </div>

      {screen === "phone" && phone && st && q && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#0d1013]/95 px-4 pt-3 backdrop-blur [padding-bottom:calc(12px+env(safe-area-inset-bottom,0px))]">
          <div className="mx-auto grid max-w-[560px] grid-cols-[auto_auto_1fr] gap-2">
            <button onClick={showCustomer} className="h-12 whitespace-nowrap rounded-xl border border-white/12 bg-white/5 px-3 text-[14px] font-semibold">
              Show customer
            </button>
            <button
              onClick={async () => setToast((await copyText(message)) ? "Copied — paste it in WhatsApp" : "Couldn't copy on this phone")}
              className="h-12 whitespace-nowrap rounded-xl border border-white/12 bg-white/5 px-4 text-[14px] font-semibold"
            >
              Copy
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center whitespace-nowrap rounded-xl bg-[#00D46A] px-2 text-[16px] font-bold text-[#04140a]"
            >
              WhatsApp it
            </a>
          </div>
        </div>
      )}

      {customer && screen === "phone" && phone && st && q && (
        <CustomerView phone={phone} storageIdx={storageIdx} q={q} close={back} />
      )}

      {updatesOpen && <UpdatesSheet close={() => setUpdatesOpen(false)} />}

      {toast && (
        <div className="fixed inset-x-0 bottom-28 z-40 flex justify-center px-4">
          <div className="rounded-full bg-white px-4 py-2 text-[14px] font-semibold text-[#0a0d0f] shadow-lg">{toast}</div>
        </div>
      )}
    </div>
  );
}

// ── Home: find the phone ────────────────────────────────────────────────────

function HomeScreen(props: {
  query: string;
  setQuery: (v: string) => void;
  results: Phone[];
  recent: string[];
  brand: string | null;
  setBrand: (b: string | null) => void;
  brandPhones: Phone[];
  openPhone: (id: string) => void;
  openFree: () => void;
  unseen: boolean;
  openUpdates: () => void;
}) {
  const { query, setQuery, results, recent, brand, setBrand, brandPhones, openPhone, openFree, unseen, openUpdates } = props;
  return (
    <>
      <header className="pb-4 pt-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="whitespace-nowrap text-[20px] font-bold leading-tight">GC Price Check</h1>
          <Link href="/" className="whitespace-nowrap text-[14px] font-semibold text-[#8b9bb8] underline underline-offset-4">
            Full app
          </Link>
        </div>
        <div className="mt-1 flex items-center gap-3 text-[13px]">
          <span className="text-[#8b9bb8]">Prices checked {PRICE_DATE}</span>
          <button onClick={openUpdates} className="relative font-semibold text-[#00D46A]">
            What&apos;s new
            {unseen && <span className="ml-1 inline-block h-2 w-2 rounded-full bg-[#00D46A] align-middle" />}
          </button>
        </div>
      </header>

      <label className="block">
        <span className="sr-only">Phone name</span>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setBrand(null);
          }}
          type="search"
          inputMode="search"
          autoComplete="off"
          placeholder="Which phone? e.g. iPhone 17, A57, Y11"
          className="h-14 w-full rounded-2xl border border-white/15 bg-[#111417] px-4 text-[17px] text-white outline-none placeholder:text-[#6f7f9c] focus:border-[#00D46A]"
        />
      </label>

      {query.trim() ? (
        <section className="mt-4">
          {results.length ? (
            <PhoneList phones={results} openPhone={openPhone} />
          ) : (
            <p className="rounded-2xl border border-white/10 bg-[#111417] p-4 text-[15px] text-[#8b9bb8]">
              No phone matches &ldquo;{query}&rdquo;. Try fewer letters, e.g. &ldquo;A57&rdquo; or &ldquo;17 pro&rdquo;.
            </p>
          )}
        </section>
      ) : brand ? (
        <section className="mt-4">
          <button onClick={() => setBrand(null)} className="mb-3 text-[15px] font-semibold text-[#00D46A]">
            ‹ All brands
          </button>
          <h2 className="mb-3 text-[18px] font-bold">{brand === "Hotlink" ? "Phones on Hotlink" : brand}</h2>
          <PhoneList phones={brandPhones} openPhone={openPhone} />
        </section>
      ) : (
        <>
          {recent.length > 0 && (
            <section className="mt-5">
              <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-[#8b9bb8]">Recent</h2>
              <div className="flex flex-wrap gap-2">
                {recent.map((id) => {
                  const p = PHONE_BY_ID.get(id);
                  return p ? (
                    <button key={id} onClick={() => openPhone(id)} className="h-10 rounded-full border border-white/12 bg-[#111417] px-4 text-[14px] font-medium">
                      {p.name}
                    </button>
                  ) : null;
                })}
              </div>
            </section>
          )}

          <button
            onClick={openFree}
            className="mt-5 flex w-full items-center justify-between rounded-2xl border border-[#00D46A]/40 bg-[#00D46A]/10 px-4 py-4 text-left"
          >
            <span>
              <span className="block text-[17px] font-bold">What can the customer get FREE?</span>
              <span className="block text-[13px] text-[#9fdcbc]">Pick a plan, see every free phone</span>
            </span>
            <span className="text-[22px] text-[#00D46A]">›</span>
          </button>

          <section className="mt-6">
            <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-[#8b9bb8]">Or pick a brand</h2>
            <div className="grid grid-cols-3 gap-2">
              {[...BRANDS, "Hotlink"].map((b) => (
                <button
                  key={b}
                  onClick={() => setBrand(b)}
                  className={`h-12 rounded-xl border px-2 text-[15px] font-semibold ${
                    b === "Hotlink" ? "border-[#ff9f43]/40 bg-[#ff9f43]/10 text-[#ffc58a]" : "border-white/10 bg-[#111417]"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </section>

          <p className="mt-8 text-[13px] leading-relaxed text-[#6f7f9c]">
            Budget finder, plan upgrades, compare and home WiFi are in the{" "}
            <Link href="/" className="font-semibold text-[#8b9bb8] underline">
              full app
            </Link>
            .
          </p>
        </>
      )}
    </>
  );
}

function PhoneList({ phones, openPhone }: { phones: Phone[]; openPhone: (id: string) => void }) {
  return (
    <ul className="divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/10 bg-[#111417]">
      {phones.map((p) => (
        <li key={p.id}>
          <button
            onClick={() => openPhone(p.id)}
            aria-label={`${p.name}${hasHotlink(p) ? ", Hotlink" : ""}`}
            className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
          >
            <span className="min-w-0">
              <span className="block truncate text-[16px] font-semibold">{p.name}</span>
              <span className="block text-[13px] text-[#8b9bb8]">
                {p.brand}
                {p.storages.some((s) => s.label) && ` · ${p.storages.map((s) => s.label).filter(Boolean).join(" / ")}`}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              {p.eol && <span className="rounded-md bg-white/10 px-2 py-0.5 text-[12px] text-[#8b9bb8]">Ended</span>}
              {hasHotlink(p) && <span className="rounded-md bg-[#ff9f43]/15 px-2 py-0.5 text-[12px] font-semibold text-[#ffc58a]">Hotlink</span>}
              <span className="text-[20px] text-[#6f7f9c]">›</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

// ── Phone: the price ────────────────────────────────────────────────────────

function Segmented<T extends string | number>(props: {
  options: T[];
  value: T;
  label: (v: T) => string;
  onChange: (v: T) => void;
  small?: boolean;
}) {
  const { options, value, label, onChange, small } = props;
  return (
    <div className="flex gap-1 rounded-xl border border-white/10 bg-[#111417] p-1">
      {options.map((o) => (
        <button
          key={String(o)}
          onClick={() => onChange(o)}
          className={`flex-1 rounded-lg ${small ? "h-9 text-[14px]" : "h-11 text-[15px]"} font-semibold transition-colors ${
            o === value ? "bg-[#00D46A] text-[#04140a]" : "text-[#c6d2e8]"
          }`}
        >
          {label(o)}
        </button>
      ))}
    </div>
  );
}

function PhoneScreen(props: {
  phone: Phone;
  storageIdx: number;
  sel: Selection;
  q: Quote | null;
  planNote: string;
  showAll: boolean;
  setShowAll: (v: boolean) => void;
  change: (patch: Partial<Selection>, storage?: number) => void;
  back: () => void;
}) {
  const { phone, storageIdx, sel, q, planNote, showAll, setShowAll, change, back } = props;
  const st = phone.storages[storageIdx];
  const types = typesFor(st);
  const terms = termsFor(st, sel.type);
  const plans = plansFor(st, sel.type, sel.term);
  const freeOn = freeUpgrade(st, sel.type, sel.term, sel.plan);

  return (
    <>
      <div className="flex items-center justify-between pb-2 pt-4">
        <button onClick={back} className="h-10 text-[16px] font-semibold text-[#00D46A]">
          ‹ Back
        </button>
        <span className="text-[13px] text-[#6f7f9c]">Prices {PRICE_DATE}</span>
      </div>

      <p className="text-[13px] font-semibold uppercase tracking-wide text-[#8b9bb8]">{phone.brand}</p>
      <h1 className="text-[26px] font-bold leading-tight [text-wrap:balance]">{phone.name}</h1>
      <p className="mt-1 text-[14px] text-[#8b9bb8]">RRP {rm(st.rrp)}</p>

      {phone.storages.length > 1 && (
        <div className="mt-4">
          <Segmented
            options={phone.storages.map((_, i) => i)}
            value={storageIdx}
            label={(i) => phone.storages[i].label || `Option ${i + 1}`}
            onChange={(i) => change({}, i)}
          />
        </div>
      )}

      <h2 className="mb-2 mt-5 text-[14px] font-semibold text-[#c6d2e8]">How will the customer pay?</h2>
      <Segmented options={types} value={sel.type} label={(t) => TYPE_LABEL[t]} onChange={(t) => change({ type: t })} />
      {terms.length > 1 && (
        <div className="mt-2">
          <Segmented options={terms} value={sel.term} label={termLabel} onChange={(t) => change({ term: t })} small />
        </div>
      )}

      <h2 className="mb-2 mt-5 text-[14px] font-semibold text-[#c6d2e8]">Plan</h2>
      <div className="grid grid-cols-4 gap-2">
        {plans.map((p) => (
          <button
            key={p}
            onClick={() => change({ plan: p })}
            className={`h-11 rounded-xl border text-[15px] font-semibold ${
              p === sel.plan ? "border-[#00D46A] bg-[#00D46A] text-[#04140a]" : "border-white/10 bg-[#111417] text-[#c6d2e8]"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      {planNote && <p className="mt-2 text-[13px] text-[#ffc58a]">{planNote}</p>}

      {q ? <AnswerCard q={q} /> : <p className="mt-5 text-[15px] text-[#8b9bb8]">No price for this choice.</p>}

      {freeOn && (
        <button onClick={() => change({ plan: freeOn })} className="mt-3 w-full rounded-xl border border-[#00D46A]/30 bg-[#00D46A]/8 px-4 py-3 text-left text-[15px]">
          <span className="font-semibold text-[#00D46A]">Phone is FREE on {freeOn}</span>
          <span className="text-[#8b9bb8]"> — tap to show</span>
        </button>
      )}

      {st.promo && (
        <p className="mt-3 rounded-xl bg-white/5 px-4 py-3 text-[14px] leading-relaxed text-[#c6d2e8]">
          <span className="font-semibold text-[#8b9bb8]">Staff note (check it&apos;s still running): </span>
          {st.promo}
        </p>
      )}

      <button onClick={() => setShowAll(!showAll)} className="mt-4 text-[15px] font-semibold text-[#8b9bb8] underline underline-offset-4">
        {showAll ? "Hide other plans" : `Compare all plans (${TYPE_LABEL[sel.type]}, ${sel.term} months)`}
      </button>
      {showAll && (
        <ul className="mt-3 divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/10 bg-[#111417]">
          {plans.map((p) => {
            const r = quote(st, sel.type, sel.term, p);
            if (!r) return null;
            return (
              <li key={p}>
                <button
                  onClick={() => change({ plan: p })}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left ${p === sel.plan ? "bg-[#00D46A]/10" : ""}`}
                >
                  <span className="text-[15px] font-semibold">{p}</span>
                  <span className="text-right">
                    <span className="block text-[16px] font-bold tabular-nums">
                      {r.type === "zero" ? `${rm(r.monthly)}/month` : `${rm(r.today)} today`}
                    </span>
                    <span className="block text-[12px] text-[#8b9bb8] tabular-nums">
                      {r.free ? "phone FREE" : r.type === "zero" ? `phone ${rm(r.phone)}/month` : `then ${rm(r.monthly)}/month`}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function AnswerCard({ q, large = false }: { q: Quote; large?: boolean }) {
  const big = large ? "text-[56px]" : "text-[44px]";
  if (q.type === "zero") {
    return (
      <div className="mt-5 rounded-2xl border border-[#00D46A]/40 bg-[#00D46A]/8 p-5">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-[#9fdcbc]">Customer pays every month</p>
        <p className={`${big} font-bold leading-none tabular-nums`}>{rm(q.monthly)}</p>
        <p className="mt-3 text-[16px] tabular-nums">
          {q.free ? (
            <>
              <span className="font-bold text-[#00D46A]">Phone FREE</span> — only the {q.plan} plan
            </>
          ) : (
            <>
              RM{planFee(q.plan)} plan + {rm(q.phone)} phone, for {q.term} months
            </>
          )}
        </p>
        <p className="mt-1 text-[14px] text-[#8b9bb8]">
          {q.ecc === "share" ? "Nothing to pay today · share line, no credit check" : "Nothing to pay today · a deposit only if the credit check (ECC) asks"}
        </p>
      </div>
    );
  }
  return (
    <div className="mt-5 rounded-2xl border border-[#00D46A]/40 bg-[#00D46A]/8 p-5">
      <p className="text-[13px] font-semibold uppercase tracking-wide text-[#9fdcbc]">Customer pays today</p>
      <p className={`${big} font-bold leading-none tabular-nums`}>{rm(q.today)}</p>
      <p className="mt-3 text-[16px] tabular-nums">
        {q.free ? <span className="font-bold text-[#00D46A]">Phone FREE</span> : <>Phone {rm(q.phone)}</>}
        {q.deposit ? <> + deposit {rm(q.deposit)} (comes back in the bill)</> : null}
      </p>
      <p className="mt-1 text-[16px] tabular-nums">
        Then <span className="font-bold">{rm(q.monthly)}/month</span> · {q.plan}, {q.term} months
      </p>
    </div>
  );
}

// ── FREE finder ─────────────────────────────────────────────────────────────

const FREE_PLANS: Record<PayType, string[]> = {
  upfront: ["MP79", "MP89", "MP99", "MP109", "MP139", "MP169", "MP199"],
  zero: ["MP79", "MP89", "MP99", "MP109", "MP139", "MP169", "MP199"],
  hotlink: ["HP75"],
};

function FreeScreen(props: {
  type: PayType;
  plan: string;
  setType: (t: PayType) => void;
  setPlan: (p: string) => void;
  back: () => void;
  openPhone: (id: string, want?: Partial<Selection>, storage?: number) => void;
}) {
  const { type, plan, setType, setPlan, back, openPhone } = props;
  const term: Term = 24;
  const rows = useMemo(() => {
    const out: { phone: Phone; storage: number; q: Quote }[] = [];
    for (const p of PHONES) {
      if (p.eol) continue;
      p.storages.forEach((s, i) => {
        const r = quote(s, type, term, plan);
        if (r?.free) out.push({ phone: p, storage: i, q: r });
      });
    }
    return out.sort((a, b) => b.phone.storages[b.storage].rrp - a.phone.storages[a.storage].rrp);
  }, [type, plan]);

  return (
    <>
      <div className="pb-2 pt-4">
        <button onClick={back} className="h-10 text-[16px] font-semibold text-[#00D46A]">
          ‹ Back
        </button>
      </div>
      <h1 className="text-[24px] font-bold leading-tight">What can the customer get FREE?</h1>
      <p className="mt-1 text-[14px] text-[#8b9bb8]">24-month contract · prices {PRICE_DATE}</p>

      <h2 className="mb-2 mt-5 text-[14px] font-semibold text-[#c6d2e8]">How will the customer pay?</h2>
      <Segmented options={["upfront", "zero", "hotlink"] as PayType[]} value={type} label={(t) => TYPE_LABEL[t]} onChange={setType} />

      <h2 className="mb-2 mt-5 text-[14px] font-semibold text-[#c6d2e8]">Plan</h2>
      <div className="grid grid-cols-4 gap-2">
        {FREE_PLANS[type].map((p) => (
          <button
            key={p}
            onClick={() => setPlan(p)}
            className={`h-11 rounded-xl border text-[15px] font-semibold ${
              p === plan ? "border-[#00D46A] bg-[#00D46A] text-[#04140a]" : "border-white/10 bg-[#111417] text-[#c6d2e8]"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <h2 className="mb-2 mt-6 text-[14px] font-semibold text-[#c6d2e8]">
        {rows.length ? `${rows.length} free phone${rows.length === 1 ? "" : "s"} on ${plan}` : `No free phone on ${plan}`}
      </h2>
      {rows.length > 0 && (
        <ul className="divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/10 bg-[#111417]">
          {rows.map(({ phone, storage, q }) => (
            <li key={`${phone.id}-${storage}`}>
              <button
                onClick={() => openPhone(phone.id, { type, term, plan }, storage)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[16px] font-semibold">{storageText(phone, phone.storages[storage])}</span>
                  <span className="block text-[13px] text-[#8b9bb8] tabular-nums">
                    RRP {rm(phone.storages[storage].rrp)}
                    {q.type === "zero"
                      ? ` · ${rm(q.monthly)}/month, nothing today`
                      : ` · pay ${rm(q.today)} today${q.deposit ? " (deposit)" : ""}`}
                  </span>
                </span>
                <span className="text-[20px] text-[#6f7f9c]">›</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// ── Customer view: turn the phone around ────────────────────────────────────

function CustomerView({ phone, storageIdx, q, close }: { phone: Phone; storageIdx: number; q: Quote; close: () => void }) {
  const st = phone.storages[storageIdx];
  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-[#0a0d0f] px-5 [padding-bottom:calc(24px+env(safe-area-inset-bottom,0px))] [padding-top:calc(16px+env(safe-area-inset-top,0px))]">
      <div className="mx-auto max-w-[560px]">
        <div className="flex justify-end">
          <button onClick={close} className="h-11 rounded-xl border border-white/12 px-4 text-[15px] font-semibold">
            Close
          </button>
        </div>
        <p className="mt-6 text-[14px] font-semibold uppercase tracking-wide text-[#8b9bb8]">{phone.brand}</p>
        <h1 className="text-[32px] font-bold leading-tight [text-wrap:balance]">{phone.name}</h1>
        {st.label && <p className="mt-1 text-[17px] text-[#c6d2e8]">{st.label}</p>}
        <p className="mt-4 inline-block rounded-full bg-white/8 px-4 py-1.5 text-[15px] font-semibold">
          {q.plan} · {TYPE_LABEL[q.type]} · {q.term} months
        </p>
        <AnswerCard q={q} large />
        <p className="mt-8 text-[13px] leading-relaxed text-[#6f7f9c]">
          Subject to stock availability and credit verification. Prices as of {PRICE_DATE}.
          <br />
          GC Store · Authorised Maxis Partner · Aiman Mall &amp; Emart Batu Kawa
        </p>
      </div>
    </div>
  );
}

// ── What's new ──────────────────────────────────────────────────────────────

function UpdatesSheet({ close }: { close: () => void }) {
  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/60" onClick={close}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-auto max-h-[80vh] w-full max-w-[560px] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[#111417] px-5 pt-5 [padding-bottom:calc(24px+env(safe-area-inset-bottom,0px))]"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[19px] font-bold">What&apos;s new</h2>
          <button onClick={close} className="h-10 rounded-xl border border-white/12 px-4 text-[14px] font-semibold">
            Close
          </button>
        </div>
        <ul className="space-y-4">
          {LATEST_UPDATES.slice(0, 6).map((u, i) => (
            <li key={i} className="border-b border-white/8 pb-4 last:border-0">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-[#00D46A]">
                {u.date} · {u.type === "upcoming" ? "coming" : u.type}
              </p>
              <p className="mt-1 text-[15px] leading-snug">{u.text}</p>
              {u.subtext && <p className="mt-1 text-[13px] leading-relaxed text-[#8b9bb8]">{u.subtext}</p>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
