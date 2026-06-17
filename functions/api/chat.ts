// Cloudflare Pages Function. Proxy de l'assistant IA de cadrage.
// Relaie la conversation vers l'API Anthropic (Claude), cache la cle, borne les
// couts, filtre les bots (honeypot) puis renvoie la reponse et, le cas echeant,
// la synthese de brief structuree.
//
// Variables d'environnement (settings du projet Cloudflare Pages) :
//   ANTHROPIC_API_KEY           cle API Anthropic (secret, obligatoire)
//   SUPABASE_URL                URL du projet Supabase (optionnel)
//   SUPABASE_SERVICE_ROLE_KEY   cle service_role Supabase (secret, optionnel)
//
// La persistance Supabase est best-effort : si elle n'est pas configuree ou
// echoue, l'assistant repond quand meme. Cette fonction ne s'execute que sur
// Cloudflare, pas sous `next dev` (l'assistant bascule alors sur un repli, voir
// components/Assistant.tsx).

import { type SupabaseEnv, hasSupabase, sbUpsert } from "../_lib/supabase";

interface Env extends SupabaseEnv {
  ANTHROPIC_API_KEY: string;
}

interface RequestContext {
  request: Request;
  env: Env;
}

type Role = "user" | "assistant";
interface Msg {
  role: Role;
  content: string;
}

// Bornage des couts et anti-abus.
const MODEL = "claude-sonnet-4-6";
const ANTHROPIC_VERSION = "2023-06-01";
const MAX_TOKENS = 800;
const MAX_MESSAGES = 16; // on ne garde que les N derniers tours
const MAX_CONTENT = 4000; // longueur max d'un message (caracteres)

// Sentinelles du bloc machine emis par le modele quand le brief est pret.
const BRIEF_OPEN = "<<<BRIEF>>>";
const BRIEF_CLOSE = "<<<END>>>";

const LOCALES = ["fr", "en", "es"] as const;
type Locale = (typeof LOCALES)[number];

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function systemPrompt(locale: Locale): string {
  const briefBlock = `${BRIEF_OPEN}\n{"problem":"...","target":"...","scope":"...","budget":"...","timeline":"...","nextStep":"..."}\n${BRIEF_CLOSE}`;

  if (locale === "en") {
    return `You are the project scoping assistant for LENOPULSE, the studio of Louis Perrier (websites, applications, automations and AI agents). Your role is to help the visitor clearly formulate their project, whether they already have a precise idea or just a rough sketch.

How you proceed:
- Ask ONE short, warm question at a time.
- Cover, in order, these four areas: 1) the problem or need, 2) the target or users, 3) the approximate budget, 4) the desired timeline. Adapt: if the person already answered one area, do not ask again.
- Briefly rephrase to show you understood, then move on.
- Stay within LENOPULSE services. Never give a firm price, speak in ballpark ranges if needed.
- Always reply in English.
- Never use a long dash.

Once the four areas are covered (after a few exchanges at most), write a short warm summary for the person, then end your message with a technical block in the EXACT format below, with nothing after it. The person will not see this block:
${briefBlock}
Each value is a concise sentence in English. "scope" summarizes the envisioned solution. "nextStep" suggests what comes next (for example a call with Louis).`;
  }

  if (locale === "es") {
    return `Eres el asistente de encuadre de proyectos de LENOPULSE, el estudio de Louis Perrier (webs, aplicaciones, automatizaciones y agentes de IA). Tu funcion es ayudar a la persona a formular con claridad su proyecto, tenga ya una idea precisa o solo un boceto.

Como procedes:
- Haz UNA sola pregunta a la vez, breve y cordial.
- Cubre, en orden, estos cuatro ejes: 1) el problema o la necesidad, 2) el publico o los usuarios, 3) el presupuesto aproximado, 4) el plazo deseado. Adaptate: si la persona ya respondio un eje, no lo vuelvas a preguntar.
- Reformula brevemente para mostrar que entendiste, y luego continua.
- Mantente dentro de los servicios de LENOPULSE. Nunca des un precio cerrado, habla de ordenes de magnitud si hace falta.
- Responde siempre en espanol.
- No uses nunca una raya larga.

Cuando los cuatro ejes esten cubiertos (como mucho tras algunos intercambios), redacta una sintesis breve y cordial para la persona, y termina tu mensaje con un bloque tecnico en el formato EXACTO siguiente, sin nada despues. La persona no vera este bloque:
${briefBlock}
Cada valor es una frase concisa en espanol. "scope" resume la solucion prevista. "nextStep" propone el siguiente paso (por ejemplo una llamada con Louis).`;
  }

  return `Tu es l'assistant de cadrage de projet de LENOPULSE, le studio de Louis Perrier (sites web, applications, automatisations et agents IA). Ton role est d'aider la personne a formuler clairement son projet, qu'elle ait deja une idee precise ou une simple ebauche.

Comment tu procedes :
- Pose UNE seule question a la fois, courte et chaleureuse.
- Couvre, dans l'ordre, ces quatre axes : 1) le probleme ou le besoin, 2) la cible ou les utilisateurs, 3) le budget approximatif, 4) le delai souhaite. Adapte-toi : si la personne a deja repondu a un axe, ne le redemande pas.
- Reformule brievement pour montrer que tu as compris, puis enchaine.
- Reste dans le perimetre des services LENOPULSE. Ne donne jamais de prix ferme, parle d'ordres de grandeur si necessaire.
- Reponds toujours en francais.
- N'utilise jamais de tiret long.

Quand les quatre axes sont couverts (au plus apres quelques echanges), redige une courte synthese chaleureuse pour la personne, puis termine ton message par un bloc technique au format EXACT suivant, sans rien apres. La personne ne verra pas ce bloc :
${briefBlock}
Chaque valeur est une phrase concise en francais. "scope" resume la solution envisagee. "nextStep" propose la suite (par exemple un appel avec Louis).`;
}

// Extrait le texte concatene des blocs "text" de la reponse Anthropic.
function extractText(data: unknown): string {
  const content = (data as { content?: unknown }).content;
  if (!Array.isArray(content)) return "";
  return content
    .filter(
      (b): b is { type: string; text: string } =>
        !!b && typeof (b as { text?: unknown }).text === "string"
    )
    .map((b) => b.text)
    .join("");
}

// Separe le texte conversationnel du bloc brief machine, si present.
function splitBrief(text: string): {
  reply: string;
  briefReady: boolean;
  brief: Record<string, string> | null;
} {
  const start = text.indexOf(BRIEF_OPEN);
  if (start === -1) {
    return { reply: text.trim(), briefReady: false, brief: null };
  }
  const reply = text.slice(0, start).trim();
  const end = text.indexOf(BRIEF_CLOSE, start);
  const rawJson = text.slice(start + BRIEF_OPEN.length, end === -1 ? undefined : end).trim();
  try {
    const parsed = JSON.parse(rawJson) as Record<string, string>;
    return { reply, briefReady: true, brief: parsed };
  } catch {
    // Bloc mal forme : on renvoie le texte tel quel, sans marquer le brief pret.
    return { reply: reply || text.trim(), briefReady: false, brief: null };
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Hache une IP en SHA-256 (on ne stocke jamais l'IP en clair, RGPD).
async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function onRequestPost(context: RequestContext): Promise<Response> {
  const { request, env } = context;

  if (!env.ANTHROPIC_API_KEY) {
    return json({ ok: false, error: "server_not_configured" }, 500);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  // Champ piege anti-bot : si rempli, on repond OK sans appeler le modele.
  const honeypot = typeof payload.company === "string" ? payload.company.trim() : "";
  if (honeypot) {
    return json({ ok: true, reply: "", briefReady: false, brief: null }, 200);
  }

  const locale: Locale = LOCALES.includes(payload.locale as Locale)
    ? (payload.locale as Locale)
    : "fr";

  const sessionId = typeof payload.sessionId === "string" ? payload.sessionId : "";

  const rawMessages = Array.isArray(payload.messages) ? payload.messages : null;
  if (!rawMessages || rawMessages.length === 0) {
    return json({ ok: false, error: "invalid_fields" }, 400);
  }

  // Conversation complete et nettoyee (sert a la persistance).
  const validMessages: Msg[] = rawMessages
    .filter(
      (m): m is Msg =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CONTENT) }));

  // Historique tronque aux derniers tours (sert a l'appel modele, borne le cout).
  const cleaned: Msg[] = validMessages.slice(-MAX_MESSAGES);

  // Anthropic exige que la conversation commence par un message "user".
  while (cleaned.length && cleaned[0].role !== "user") cleaned.shift();

  // Et que le dernier message soit de l'utilisateur (pour obtenir une reponse).
  if (cleaned.length === 0 || cleaned[cleaned.length - 1].role !== "user") {
    return json({ ok: false, error: "invalid_fields" }, 400);
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt(locale),
        messages: cleaned,
      }),
    });

    if (!res.ok) {
      return json({ ok: false, error: "ai_failed" }, 502);
    }

    const data = await res.json();
    const text = extractText(data);
    if (!text) {
      return json({ ok: false, error: "ai_failed" }, 502);
    }

    const { reply, briefReady, brief } = splitBrief(text);

    // Persistance best-effort de la session (source de verite serveur).
    if (hasSupabase(env) && UUID_RE.test(sessionId)) {
      const storedMessages: Msg[] = [...validMessages];
      if (reply) storedMessages.push({ role: "assistant", content: reply });

      let ipHash: string | null = null;
      const ip = request.headers.get("CF-Connecting-IP");
      if (ip) {
        try {
          ipHash = await hashIp(ip);
        } catch {
          ipHash = null;
        }
      }

      await sbUpsert(
        env,
        "sessions",
        {
          id: sessionId,
          locale,
          messages: storedMessages,
          brief: brief ?? null,
          brief_ready: briefReady,
          status: briefReady ? "brief_ready" : "open",
          updated_at: new Date().toISOString(),
          ip_hash: ipHash,
        },
        "id"
      );
    }

    return json({ ok: true, reply, briefReady, brief }, 200);
  } catch {
    return json({ ok: false, error: "ai_failed" }, 502);
  }
}
