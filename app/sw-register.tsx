"use client";

import { useEffect, useState } from "react";

// Registers the service worker and shows a one-tap refresh nudge when a new
// version (new GTM cache) is ready — so staff can't get stuck on stale prices.
export default function SwRegister() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
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
      })
      .catch(() => {});
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
