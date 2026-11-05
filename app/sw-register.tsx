"use client";

import { useEffect, useState } from "react";

// Registers the service worker and shows a one-tap refresh nudge when a new
// version (new GTM cache) is ready — so staff can't get stuck on stale prices.
export default function SwRegister() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    // `next dev` serves chunks under fixed names, so the cache-first worker kept
    // handing back old code after every edit. Only production builds register it.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
      return;
    }

    let stopped = false;
    let timer: number | undefined;
    let onVisible: (() => void) | undefined;

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        if (stopped) return;
        reg.addEventListener("updatefound", () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener("statechange", () => {
            // A new SW is installed AND an old one is controlling => update waiting.
            if (nw.state === "installed" && navigator.serviceWorker.controller) {
              setUpdateReady(true);
            }
          });
        });
        // A shop tablet can keep this tab open for days without navigating, and
        // the browser only looks for a new worker on navigation. Ask it to look
        // when the screen comes back on and every 30 minutes, so a price update
        // reaches the counter the same day.
        const check = () => {
          reg.update().catch(() => {});
        };
        onVisible = () => {
          if (document.visibilityState === "visible") check();
        };
        document.addEventListener("visibilitychange", onVisible);
        timer = window.setInterval(check, 30 * 60 * 1000);
      })
      .catch(() => {});

    return () => {
      stopped = true;
      if (timer !== undefined) window.clearInterval(timer);
      if (onVisible) document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  if (!updateReady) return null;
  return (
    <button
      onClick={() => window.location.reload()}
      className="fixed bottom-3 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-[#00D46A] bg-[#00D46A] px-4 py-2 text-xs font-bold text-black shadow-lg"
    >
      ⬆️ New prices available — tap to refresh
    </button>
  );
}
