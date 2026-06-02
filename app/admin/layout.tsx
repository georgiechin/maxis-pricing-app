"use client";

import { useEffect, useState } from "react";

const ADMIN_PIN =
  process.env.NEXT_PUBLIC_ADMIN_PIN ?? "2025";
const STORAGE_KEY = "maxis-admin-auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setAuthed(stored === "1");
    } catch {
      setAuthed(false);
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // storage blocked
      }
      setError("");
      setAuthed(true);
    } else {
      setError("Incorrect PIN. Try again.");
      setPin("");
    }
  }

  if (authed === null) {
    return (
      <div
        style={{ background: "#0a0d0f" }}
        className="min-h-screen flex items-center justify-center"
      />
    );
  }

  if (!authed) {
    return (
      <div
        style={{ background: "#0a0d0f" }}
        className="min-h-screen flex items-center justify-center px-4"
      >
        <div
          style={{
            background: "#111417",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          className="rounded-2xl p-8 w-full max-w-sm flex flex-col items-center gap-6"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl" role="img" aria-label="lock">
              🔐
            </span>
            <h1
              className="text-xl font-semibold tracking-tight"
              style={{ color: "#ecf3ff" }}
            >
              GC Pricing Admin
            </h1>
            <p className="text-sm" style={{ color: "#95a6c7" }}>
              Enter your 4-digit PIN to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                setPin(v);
                setError("");
              }}
              placeholder="••••"
              autoFocus
              className="w-full rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] outline-none focus:ring-2 transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#ecf3ff",
                caretColor: "#00D46A",
                // @ts-expect-error ring color via style
                "--tw-ring-color": "#00D46A",
              }}
            />
            {error && (
              <p className="text-center text-sm font-medium" style={{ color: "#ff6b6b" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={pin.length !== 4}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: pin.length === 4 ? "#00D46A" : "rgba(0,212,106,0.3)",
                color: pin.length === 4 ? "#0a0d0f" : "#ecf3ff",
              }}
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0a0d0f", minHeight: "100vh", color: "#ecf3ff" }}>
      {children}
    </div>
  );
}
