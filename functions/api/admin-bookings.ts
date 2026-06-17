// Cloudflare Pages Function. Donnees de la vue admin (reservation a venir + briefs).
// GET protege par le cookie de session admin. Lit Supabase via la cle service_role.
//
// Variables d'environnement :
//   ADMIN_TOKEN_SECRET          secret de signature du jeton de session
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY

import { type SupabaseEnv, hasSupabase, sbSelect } from "../_lib/supabase";
import { getCookie, verifyToken } from "../_lib/adminToken";

interface Env extends SupabaseEnv {
  ADMIN_TOKEN_SECRET?: string;
}

interface RequestContext {
  request: Request;
  env: Env;
}

const COOKIE = "lenopulse_admin";

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestGet(context: RequestContext): Promise<Response> {
  const { request, env } = context;

  if (!env.ADMIN_TOKEN_SECRET) {
    return json({ ok: false, error: "server_not_configured" }, 500);
  }

  const token = getCookie(request.headers.get("Cookie"), COOKIE);
  if (!(await verifyToken(env.ADMIN_TOKEN_SECRET, token))) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  if (!hasSupabase(env)) {
    return json({ ok: true, bookings: [], leads: [] }, 200);
  }

  // Reservations avec le brief de la session associee (embedding PostgREST).
  const bookings = await sbSelect(
    env,
    "bookings",
    "select=id,created_at,attendee_name,attendee_email,start_time,end_time,status,meeting_url,location,session:sessions(brief,visitor_email,locale)&order=start_time.asc"
  );

  // Briefs prets mais sans reservation (leads qualifies a relancer).
  const leads = await sbSelect(
    env,
    "sessions",
    "brief_ready=eq.true&status=neq.booked&select=id,created_at,updated_at,brief,locale,status&order=updated_at.desc"
  );

  return json({ ok: true, bookings, leads }, 200);
}
