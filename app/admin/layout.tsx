// Access control for /admin now lives in proxy.ts, on the server.
//
// This file used to hold the gate itself: a PIN read from NEXT_PUBLIC_ADMIN_PIN
// (falling back to a hard-coded "2025") compared inside React and remembered in
// localStorage. All three parts were broken — NEXT_PUBLIC_ values are compiled
// into the public JS bundle, the fallback shipped the real PIN to anyone who
// opened the bundle, and a client-side check is bypassed by setting one
// localStorage key. It has been removed rather than patched so nothing here
// looks like protection when it isn't.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: "#0a0d0f", minHeight: "100vh", color: "#ecf3ff" }}>
      {children}
    </div>
  );
}
