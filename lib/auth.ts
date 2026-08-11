// Server-side session auth for the pricing browser.
//
// Why this exists: the catalog is Maxis GTM-derived pricing. It is not meant to
// be readable by anyone who happens to have the URL. The previous gate lived in
// the browser (a NEXT_PUBLIC_ PIN compared in React, remembered in localStorage),
// which meant the PIN shipped inside the public JS bundle and could be skipped
// entirely by writing one key to localStorage. Everything here runs on the
// server; the browser only ever receives an opaque signed cookie.
//
// Two scopes, one login box:
//   site  — SITE_PASSWORD  → browse pricing (what staff get)
//   admin — ADMIN_PASSWORD → also reach /admin, the price editor (George)
// If ADMIN_PASSWORD is unset, /admin simply needs the site password, so a
// half-configured deployment never locks the owner out of his own tool.
import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "gc_session";
export const ADMIN_COOKIE = "gc_admin";

/** 30 days — staff open this on the shop floor daily; re-typing weekly is friction. */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export type Scope = "site" | "admin";

/**
 * Key used to sign session cookies. AUTH_SECRET is preferred, but SITE_PASSWORD
 * is an acceptable fallback so a single env var is enough to get running. A side
 * effect worth knowing: changing SITE_PASSWORD then invalidates every existing
 * session, which is exactly what you want when someone leaves the company.
 */
function signingSecret(): string {
  return process.env.AUTH_SECRET || process.env.SITE_PASSWORD || "";
}

/** False means the deployment has no password set — callers must fail closed. */
export function authConfigured(): boolean {
  return Boolean(process.env.SITE_PASSWORD);
}

/** False means /admin is covered by the site password alone. */
export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

/** Length-safe constant-time compare (timingSafeEqual throws on length mismatch). */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function passwordMatches(candidate: string): boolean {
  const expected = process.env.SITE_PASSWORD || "";
  if (!expected) return false;
  return safeEqual(candidate, expected);
}

export function adminPasswordMatches(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return false;
  return safeEqual(candidate, expected);
}

/**
 * Token is `<scope>.<expiry-ms>.<hmac>` — no user data, nothing worth stealing.
 * The scope is inside the signed payload, so a site cookie cannot be renamed
 * into an admin one.
 */
export function createSessionToken(scope: Scope, now: number = Date.now()): string {
  const exp = String(now + SESSION_MAX_AGE * 1000);
  const payload = `${scope}.${exp}`;
  const mac = createHmac("sha256", signingSecret()).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

export function sessionValid(
  token: string | undefined,
  scope: Scope,
  now: number = Date.now(),
): boolean {
  if (!token) return false;
  const secret = signingSecret();
  if (!secret) return false;

  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;

  const payload = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  if (!safeEqual(mac, expected)) return false;

  const [tokenScope, exp] = payload.split(".");
  if (tokenScope !== scope) return false;

  const expMs = Number(exp);
  return Number.isFinite(expMs) && expMs > now;
}
