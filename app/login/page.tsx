"use client";

import { useEffect, useRef, useState } from "react";

/** Only ever follow a same-site path, so ?next= can't bounce staff off-site. */
function safeNext(raw: string | null): string {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    // Read the field itself rather than trusting React state. Chrome autofill and
    // password managers can write a value without firing onChange, which would
    // otherwise leave staff staring at a filled box that refuses to submit.
    const value = inputRef.current?.value || password;
    if (!value) {
      setError("Enter the password.");
      inputRef.current?.focus();
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        const next = safeNext(new URLSearchParams(window.location.search).get("next"));
        // Full navigation, not a client route change: the cookie has to be sent
        // to the server for the gate to let the page through.
        window.location.replace(next);
        return;
      }
      setError(data?.error || "Wrong password.");
      setPassword("");
      inputRef.current?.focus();
    } catch {
      setError("Network problem. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{ background: "#0a0d0f" }}
      className="min-h-screen flex items-center justify-center px-4"
    >
      <div
        style={{ background: "#111417", border: "1px solid rgba(255,255,255,0.08)" }}
        className="rounded-2xl p-8 w-full max-w-sm flex flex-col items-center gap-6"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-4xl" role="img" aria-label="lock">
            🔐
          </span>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "#ecf3ff" }}>
            Maxis Device Pricing
          </h1>
          <p className="text-sm" style={{ color: "#95a6c7" }}>
            Staff only — enter the site password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <input
            ref={inputRef}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="Password"
            className="w-full rounded-xl px-4 py-3 text-center outline-none focus:ring-2 transition-all"
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
          {/* Never disabled on "empty" — see handleSubmit. An autofilled field can
              read as empty to React, and a dead button with no explanation is the
              one failure staff can't work around on a busy shop floor. */}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: busy ? "rgba(0,212,106,0.3)" : "#00D46A",
              color: busy ? "#ecf3ff" : "#0a0d0f",
            }}
          >
            {busy ? "Checking…" : "Unlock"}
          </button>
        </form>

        <p className="text-xs text-center" style={{ color: "#5d6b85" }}>
          Contains Maxis confidential pricing. Do not share this link or password
          outside the team.
        </p>
      </div>
    </div>
  );
}
