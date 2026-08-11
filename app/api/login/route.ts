import { cookies } from "next/headers";

import {
  ADMIN_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  adminPasswordMatches,
  authConfigured,
  createSessionToken,
  passwordMatches,
} from "@/lib/auth";

/** Small deterrent against someone scripting guesses at the password. */
const attempts = new Map<string, { count: number; until: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function clientKey(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for") || "";
  return fwd.split(",")[0].trim() || "unknown";
}

function rateLimited(key: string): boolean {
  const now = Date.now();
  const row = attempts.get(key);
  if (!row || now > row.until) return false;
  return row.count >= MAX_ATTEMPTS;
}

function recordFailure(key: string): void {
  const now = Date.now();
  const row = attempts.get(key);
  if (!row || now > row.until) {
    attempts.set(key, { count: 1, until: now + WINDOW_MS });
    return;
  }
  row.count += 1;
}

export async function POST(request: Request) {
  if (!authConfigured()) {
    return Response.json(
      { ok: false, error: "Site password is not configured." },
      { status: 503 },
    );
  }

  const key = clientKey(request);
  if (rateLimited(key)) {
    return Response.json(
      { ok: false, error: "Too many attempts. Try again in a few minutes." },
      { status: 429 },
    );
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    password = "";
  }

  const isAdmin = adminPasswordMatches(password);
  if (!isAdmin && !passwordMatches(password)) {
    recordFailure(key);
    // Deliberately vague: never reveal whether the password was close, or the
    // expected length.
    return Response.json({ ok: false, error: "Wrong password." }, { status: 401 });
  }

  attempts.delete(key);

  const opts = {
    httpOnly: true,                                   // JS can never read it
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };

  const store = await cookies();
  // The admin password also grants ordinary browsing, so George types one
  // password and gets everything.
  store.set(SESSION_COOKIE, createSessionToken("site"), opts);
  if (isAdmin) {
    store.set(ADMIN_COOKIE, createSessionToken("admin"), opts);
  }

  return Response.json({ ok: true, admin: isAdmin });
}
