// Server-side gate for the whole app.
//
// Next 16 renamed the `middleware` file convention to `proxy` (see
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).
// Proxy runs on the Node.js runtime by default, so node:crypto in lib/auth is fine.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  ADMIN_COOKIE,
  SESSION_COOKIE,
  adminConfigured,
  authConfigured,
  sessionValid,
} from "@/lib/auth";

/**
 * Fail CLOSED when SITE_PASSWORD is unset.
 *
 * Failing open would silently recreate the exact problem this gate exists to fix
 * — a public URL serving the confidential price matrix — and nobody would notice,
 * because the app would look completely normal. A blocked app gets fixed in
 * minutes; a quietly public one stays public for months.
 */
function setupRequired(): NextResponse {
  const html = `<!doctype html><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Setup required</title>
<style>
 body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:#0a0d0f;color:#ecf3ff;font:16px/1.6 system-ui,"Segoe UI",Roboto,sans-serif;padding:24px}
 .card{background:#111417;border:1px solid rgba(255,255,255,.08);border-radius:16px;
       padding:32px;max-width:520px}
 h1{margin:0 0 12px;font-size:20px}
 p{color:#95a6c7;margin:0 0 16px}
 code{background:rgba(255,255,255,.06);padding:2px 6px;border-radius:6px;color:#00D46A}
 ol{color:#95a6c7;padding-left:20px;margin:0}
 li{margin-bottom:8px}
</style>
<div class="card">
  <h1>🔒 Password not configured</h1>
  <p>This app is locked because no site password is set, so it is not serving
     pricing to anyone. To switch it on:</p>
  <ol>
    <li>Vercel → this project → <strong>Settings → Environment Variables</strong></li>
    <li>Add <code>SITE_PASSWORD</code> (the password staff will type)</li>
    <li>Add <code>AUTH_SECRET</code> (any long random string)</li>
    <li>Redeploy</li>
  </ol>
</div>`;
  return new NextResponse(html, {
    status: 503,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export function proxy(request: NextRequest) {
  if (!authConfigured()) {
    return setupRequired();
  }

  const { pathname, search } = request.nextUrl;

  // /admin is the price editor. When ADMIN_PASSWORD is set it needs its own
  // scope; otherwise the site password covers it.
  const needsAdmin = adminConfigured() && pathname.startsWith("/admin");
  const cookie = needsAdmin
    ? request.cookies.get(ADMIN_COOKIE)?.value
    : request.cookies.get(SESSION_COOKIE)?.value;

  if (sessionValid(cookie, needsAdmin ? "admin" : "site")) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  // Send the user back where they were aiming once they unlock. Only ever a
  // same-site path, so this can't be turned into an open redirect.
  url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname + search)}`;

  const res = NextResponse.redirect(url);
  // A redirect to the login screen must never be cached — by the browser or by
  // the service worker's offline shell.
  res.headers.set("cache-control", "no-store");
  return res;
}

export const config = {
  matcher: [
    // Everything except: the login screen and its API, Next's own asset routes,
    // and any path with a file extension (favicon.ico, sw.js, manifest.webmanifest,
    // icons) — those carry no pricing and the PWA breaks without them.
    "/((?!login|api/(?:login|logout)|_next/|.*\\.).*)",
  ],
};
