// Ne tourne que sur Cloudflare, pas sous next dev : en local le formulaire bascule
// sur un repli mailto (voir components/Contact.tsx).

interface Env {
  RESEND_API_KEY: string;
  CONTACT_FROM?: string;
  CONTACT_TO?: string;
}

interface RequestContext {
  request: Request;
  env: Env;
}

const DEFAULT_FROM = "LENOPULSE <contact@lenopulse.com>";
const DEFAULT_TO = "louis.perrier.chenoise@gmail.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export async function onRequestPost(context: RequestContext): Promise<Response> {
  const { request, env } = context;

  if (!env.RESEND_API_KEY) {
    return json({ ok: false, error: "server_not_configured" }, 500);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  const honeypot = typeof payload.company === "string" ? payload.company.trim() : "";

  // Champ piege rempli : c'est un bot. On repond OK sans rien envoyer.
  if (honeypot) {
    return json({ ok: true }, 200);
  }

  if (
    name.length < 1 ||
    name.length > 100 ||
    !EMAIL_RE.test(email) ||
    email.length > 200 ||
    message.length < 1 ||
    message.length > 5000
  ) {
    return json({ ok: false, error: "invalid_fields" }, 400);
  }

  const from = env.CONTACT_FROM || DEFAULT_FROM;
  const to = env.CONTACT_TO || DEFAULT_TO;

  const text = `Nouveau message via le site LENOPULSE\n\nPrenom : ${name}\nEmail : ${email}\n\n${message}`;
  const html = `<div style="font-family:sans-serif;line-height:1.6;color:#1f160b">
    <h2 style="margin:0 0 12px">Nouveau message via le site LENOPULSE</h2>
    <p><strong>Prenom :</strong> ${escapeHtml(name)}<br>
    <strong>Email :</strong> ${escapeHtml(email)}</p>
    <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: email,
        subject: `Nouveau projet via le site LENOPULSE (${name})`,
        text,
        html,
      }),
    });

    if (!res.ok) {
      return json({ ok: false, error: "send_failed" }, 502);
    }
  } catch {
    return json({ ok: false, error: "send_failed" }, 502);
  }

  return json({ ok: true }, 200);
}
