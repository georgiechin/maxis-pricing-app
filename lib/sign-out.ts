// Browser-side sign out, shared by the main screen and /admin.
//
// Signing out has three parts, and the old /admin button did none of them (it
// only removed a localStorage key left over from the client-side PIN):
//   1. ask the server to clear the session cookies (they are httpOnly, so the
//      page cannot clear them itself);
//   2. drop the service worker's offline copies, so a shared shop tablet keeps
//      no price list after the next person picks it up;
//   3. leave for the login screen with a full navigation.
export async function signOut(): Promise<void> {
  try {
    await fetch("/api/logout", { method: "POST" });
  } catch {
    // Offline: still clear the local copies below. The cookie stays until the
    // next sign-out or its expiry, and the server still checks it every time.
  }
  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    navigator.serviceWorker?.controller?.postMessage("clear-caches");
  } catch {
    // Cache API missing or blocked (private window): nothing stored to clear.
  }
  window.location.replace("/login");
}
