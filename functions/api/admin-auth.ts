// Comparaison du mot de passe en temps constant, puis cookie de session signe.

import { createToken, timingSafeEqual } from "../_lib/adminToken";

interface Env {
  ADMIN_PASSWORD?: string;
  ADMIN_TOKEN_SECRET?: string;
}

interface RequestContext {
  request: Request;
  env: Env;
}

const COOKIE = "lenopulse_admin";
const TTL_SECONDS = 60 * 60 * 12; // 12 heures

function json(data: unknown, status: number, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...(extraHeaders || {}) },
  });
}

export async function onRequestPost(context: RequestContext): Promise<Response> {
  const { request, env } = context;

  if (!env.ADMIN_PASSWORD || !env.ADMIN_TOKEN_SECRET) {
    return json({ ok: false, error: "server_not_configured" }, 500);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const password = typeof payload.password === "string" ? payload.password : "";
  if (!password || !timingSafeEqual(password, env.ADMIN_PASSWORD)) {
    return json({ ok: false, error: "invalid_credentials" }, 401);
  }

  const token = await createToken(env.ADMIN_TOKEN_SECRET, TTL_SECONDS);
  const cookie = `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${TTL_SECONDS}`;
  return json({ ok: true }, 200, { "Set-Cookie": cookie });
}

export async function onRequestDelete(): Promise<Response> {
  const cookie = `${COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
  return json({ ok: true }, 200, { "Set-Cookie": cookie });
}
