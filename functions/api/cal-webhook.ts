// Cal.com signe le corps BRUT en HMAC SHA-256 hex dans x-cal-signature-256.
// On recalcule et on compare en temps constant avant tout traitement.

import { type SupabaseEnv, hasSupabase, sbSelect, sbUpsert } from "../_lib/supabase";

interface Env extends SupabaseEnv {
  CAL_WEBHOOK_SECRET?: string;
  RESEND_API_KEY?: string;
  CONTACT_FROM?: string;
  CONTACT_TO?: string;
}

interface RequestContext {
  request: Request;
  env: Env;
}

const DEFAULT_FROM = "LENOPULSE <contact@lenopulse.com>";
const DEFAULT_TO = "louis.perrier.chenoise@gmail.com";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifySignature(secret: string, body: string, header: string | null): Promise<boolean> {
  if (!header) return false;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
    return timingSafeEqual(toHex(sig).toLowerCase(), header.trim().toLowerCase());
  } catch {
    return false;
  }
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function onRequestPost(context: RequestContext): Promise<Response> {
  const { request, env } = context;

  if (!env.CAL_WEBHOOK_SECRET) {
    return json({ ok: false, error: "server_not_configured" }, 500);
  }

  // Corps BRUT : la signature porte sur les octets exacts, ne pas re-serialiser.
  const rawBody = await request.text();
  const valid = await verifySignature(
    env.CAL_WEBHOOK_SECRET,
    rawBody,
    request.headers.get("x-cal-signature-256")
  );
  if (!valid) {
    return json({ ok: false, error: "invalid_signature" }, 401);
  }

  let data: { triggerEvent?: string; payload?: Record<string, unknown> };
  try {
    data = JSON.parse(rawBody);
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const trigger = data.triggerEvent;
  const payload = (data.payload || {}) as Record<string, unknown>;

  // On ne traite que les evenements de reservation. Le reste est acquitte (200).
  const handled = ["BOOKING_CREATED", "BOOKING_RESCHEDULED", "BOOKING_CANCELLED"];
  if (!trigger || !handled.includes(trigger)) {
    return json({ ok: true, ignored: true }, 200);
  }

  const metadata = (payload.metadata || {}) as Record<string, unknown>;
  const videoCallData = (payload.videoCallData || {}) as Record<string, unknown>;
  const attendees = Array.isArray(payload.attendees) ? payload.attendees : [];
  const attendee = (attendees[0] || {}) as Record<string, unknown>;

  const calUid = str(payload.uid);
  const calBookingId = calUid || (payload.bookingId != null ? String(payload.bookingId) : null);
  if (!calBookingId) {
    return json({ ok: true, ignored: true }, 200);
  }

  const briefId = str(metadata.briefId);
  const meetingUrl = str(metadata.videoCallUrl) || str(videoCallData.url);
  const status = trigger === "BOOKING_CANCELLED" ? "cancelled" : "confirmed";

  // Enregistrement de la reservation (idempotent sur cal_booking_id).
  if (hasSupabase(env)) {
    await sbUpsert(
      env,
      "bookings",
      {
        cal_booking_id: calBookingId,
        cal_uid: calUid,
        session_id: briefId && UUID_RE.test(briefId) ? briefId : null,
        attendee_name: str(attendee.name),
        attendee_email: str(attendee.email),
        start_time: str(payload.startTime),
        end_time: str(payload.endTime),
        status,
        meeting_url: meetingUrl,
        location: str(payload.location),
        raw_payload: data,
      },
      "cal_booking_id"
    );

    // La session passe en "booked" (utile pour l'admin).
    if (trigger === "BOOKING_CREATED" && briefId && UUID_RE.test(briefId)) {
      await sbUpsert(
        env,
        "sessions",
        { id: briefId, status: "booked", updated_at: new Date().toISOString() },
        "id"
      );
    }
  }

  // Notification email a Louis, avec le brief en contexte (best-effort, sur creation).
  if (trigger === "BOOKING_CREATED" && env.RESEND_API_KEY) {
    await notify(env, payload, attendee, briefId, meetingUrl);
  }

  return json({ ok: true }, 200);
}

async function notify(
  env: Env,
  payload: Record<string, unknown>,
  attendee: Record<string, unknown>,
  briefId: string | null,
  meetingUrl: string | null
): Promise<void> {
  try {
    // Recuperation du brief associe (si lien et Supabase disponibles).
    let briefHtml = "<p><em>Aucun brief associe.</em></p>";
    if (hasSupabase(env) && briefId && UUID_RE.test(briefId)) {
      const rows = await sbSelect<{ brief: Record<string, string> | null }>(
        env,
        "sessions",
        `id=eq.${encodeURIComponent(briefId)}&select=brief`
      );
      const brief = rows[0]?.brief;
      if (brief && typeof brief === "object") {
        const labels: Record<string, string> = {
          problem: "Probleme",
          target: "Cible",
          scope: "Solution envisagee",
          budget: "Budget",
          timeline: "Delai",
          nextStep: "Prochaine etape",
        };
        const lines = Object.keys(labels)
          .filter((k) => typeof brief[k] === "string" && brief[k])
          .map((k) => `<p><strong>${labels[k]} :</strong> ${escapeHtml(brief[k])}</p>`)
          .join("");
        if (lines) briefHtml = lines;
      }
    }

    const name = str(attendee.name) || "Prospect";
    const email = str(attendee.email) || "";
    const start = str(payload.startTime) || "";
    const joinLine = meetingUrl
      ? `<p><strong>Rejoindre l'appel :</strong> <a href="${escapeHtml(meetingUrl)}">${escapeHtml(meetingUrl)}</a></p>`
      : "";

    const html = `<div style="font-family:sans-serif;line-height:1.6;color:#1f160b">
      <h2 style="margin:0 0 12px">Nouvel appel reserve via LENOPULSE</h2>
      <p><strong>Nom :</strong> ${escapeHtml(name)}<br>
      <strong>Email :</strong> ${escapeHtml(email)}<br>
      <strong>Creneau :</strong> ${escapeHtml(start)}</p>
      ${joinLine}
      <h3 style="margin:18px 0 8px">Brief du projet</h3>
      ${briefHtml}
    </div>`;

    const text = `Nouvel appel reserve via LENOPULSE\n\nNom : ${name}\nEmail : ${email}\nCreneau : ${start}\n${
      meetingUrl ? `Rejoindre : ${meetingUrl}\n` : ""
    }`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM || DEFAULT_FROM,
        to: env.CONTACT_TO || DEFAULT_TO,
        reply_to: email || undefined,
        subject: `Nouvel appel reserve via LENOPULSE (${name})`,
        text,
        html,
      }),
    });
  } catch {
    // Notification best-effort : un echec ne doit pas faire echouer le webhook.
  }
}
