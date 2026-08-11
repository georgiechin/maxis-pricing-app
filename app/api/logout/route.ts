import { cookies } from "next/headers";

import { ADMIN_COOKIE, SESSION_COOKIE } from "@/lib/auth";

/**
 * Clears the session and asks the browser to drop the service-worker caches, so
 * a shared shop tablet doesn't keep an offline copy of the price list after
 * someone signs out.
 */
export async function POST() {
  const cleared = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
  const store = await cookies();
  store.set(SESSION_COOKIE, "", cleared);
  store.set(ADMIN_COOKIE, "", cleared);
  return Response.json({ ok: true, clearCaches: true });
}
