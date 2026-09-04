// Cloudflare Pages Function. Gestion des scenarios n8n depuis /admin.
// Protege par le cookie de session admin, comme les autres fonctions admin.
//
//   GET    /api/admin-automations           tous les scenarios, brouillons compris
//   POST   /api/admin-automations           cree un scenario
//   POST   /api/admin-automations  {action:"reorder", ids:[...]}   reordonne
//   PUT    /api/admin-automations           met a jour (body.id requis)
//   DELETE /api/admin-automations?id=<uuid> supprime
//
// Variables d'environnement :
//   ADMIN_TOKEN_SECRET
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY

import {
  type SupabaseEnv,
  hasSupabase,
  sbSelect,
  sbInsert,
  sbPatch,
  sbDelete,
} from "../_lib/supabase";
import { getCookie, verifyToken } from "../_lib/adminToken";

interface Env extends SupabaseEnv {
  ADMIN_TOKEN_SECRET?: string;
}

interface RequestContext {
  request: Request;
  env: Env;
}

const COOKIE = "lenopulse_admin";
const TABLE = "portfolio_automations";

// Un export n8n depasse rarement quelques dizaines de kilo-octets. La borne evite
// qu'un fichier hors sujet finisse en base et alourdisse la page publique.
const MAX_JSON = 400_000;

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

async function guard(context: RequestContext): Promise<Response | null> {
  const { request, env } = context;
  if (!env.ADMIN_TOKEN_SECRET) return json({ ok: false, error: "server_not_configured" }, 500);
  const token = getCookie(request.headers.get("Cookie"), COOKIE);
  if (!(await verifyToken(env.ADMIN_TOKEN_SECRET, token))) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }
  if (!hasSupabase(env)) return json({ ok: false, error: "supabase_not_configured" }, 500);
  return null;
}

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function link(value: unknown): string | null {
  const raw = text(value, 500);
  if (!raw) return null;
  return /^https?:\/\//i.test(raw) ? raw : null;
}

function list(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => (typeof v === "string" ? v.trim().slice(0, 40) : ""))
    .filter(Boolean)
    .slice(0, 12);
}

// Le workflow doit etre un export n8n exploitable : un objet portant un tableau
// `nodes`. On le stocke reformate, ce qui garantit qu'il est valide et lisible,
// et on en tire le nombre de noeuds sans rien demander de plus a la saisie.
function workflow(value: unknown): { json: string | null; nodes: number | null; erreur?: string } {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return { json: null, nodes: null };
  if (raw.length > MAX_JSON) return { json: null, nodes: null, erreur: "workflow_too_large" };
  try {
    const parsed = JSON.parse(raw) as { nodes?: unknown };
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.nodes)) {
      return { json: null, nodes: null, erreur: "not_an_n8n_workflow" };
    }
    return { json: JSON.stringify(parsed), nodes: parsed.nodes.length };
  } catch {
    return { json: null, nodes: null, erreur: "invalid_json" };
  }
}

function toRow(body: Record<string, unknown>): Record<string, unknown> | { erreur: string } {
  const wf = workflow(body.workflow_json);
  if (wf.erreur) return { erreur: wf.erreur };
  return {
    name: text(body.name, 120) ?? "Sans titre",
    summary: text(body.summary, 200),
    description: text(body.description, 2000),
    tools: list(body.tools),
    image_url: link(body.image_url),
    guide_url: link(body.guide_url),
    workflow_json: wf.json,
    node_count: wf.nodes,
    published: body.published === true,
  };
}

function slugifier(nom: string): string {
  return (
    nom
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 60)
      .replace(/^-+|-+$/g, "") || "scenario"
  );
}

// Le slug n'est calcule qu'a la creation. Un renommage ne le touche pas : les
// liens deja envoyes dans une candidature doivent continuer a pointer sur la
// bonne carte.
async function slugLibre(env: Env, nom: string): Promise<string> {
  const base = slugifier(nom);
  const existants = await sbSelect<{ slug: string | null }>(env, TABLE, "select=slug");
  const pris = new Set(existants.map((e) => e.slug).filter(Boolean));
  if (!pris.has(base)) return base;
  let n = 2;
  while (pris.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export async function onRequestGet(context: RequestContext): Promise<Response> {
  const blocked = await guard(context);
  if (blocked) return blocked;

  const automations = await sbSelect(
    context.env,
    TABLE,
    "select=*&order=position.asc&order=created_at.asc"
  );
  return json({ ok: true, automations }, 200);
}

export async function onRequestPost(context: RequestContext): Promise<Response> {
  const blocked = await guard(context);
  if (blocked) return blocked;

  let body: Record<string, unknown>;
  try {
    body = (await context.request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "invalid_body" }, 400);
  }

  if (body.action === "reorder") {
    const ids = Array.isArray(body.ids) ? body.ids : [];
    let rang = 0;
    for (const id of ids) {
      if (typeof id !== "string") continue;
      const ok = await sbPatch(context.env, TABLE, `id=eq.${encodeURIComponent(id)}`, {
        position: rang,
        updated_at: new Date().toISOString(),
      });
      if (!ok) return json({ ok: false, error: "reorder_failed" }, 500);
      rang += 1;
    }
    return json({ ok: true }, 200);
  }

  const row = toRow(body);
  if ("erreur" in row) return json({ ok: false, error: row.erreur }, 400);

  const existing = await sbSelect<{ position: number }>(
    context.env,
    TABLE,
    "select=position&order=position.desc&limit=1"
  );
  const nextPosition = existing.length ? (existing[0].position ?? 0) + 1 : 0;
  const slug = await slugLibre(context.env, row.name as string);

  const created = await sbInsert(context.env, TABLE, { ...row, slug, position: nextPosition });
  if (!created) return json({ ok: false, error: "create_failed" }, 500);

  return json({ ok: true, automation: created }, 201);
}

export async function onRequestPut(context: RequestContext): Promise<Response> {
  const blocked = await guard(context);
  if (blocked) return blocked;

  let body: Record<string, unknown>;
  try {
    body = (await context.request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "invalid_body" }, 400);
  }

  const id = typeof body.id === "string" ? body.id : null;
  if (!id) return json({ ok: false, error: "missing_id" }, 400);

  const row = toRow(body);
  if ("erreur" in row) return json({ ok: false, error: row.erreur }, 400);

  const ok = await sbPatch(context.env, TABLE, `id=eq.${encodeURIComponent(id)}`, {
    ...row,
    updated_at: new Date().toISOString(),
  });
  if (!ok) return json({ ok: false, error: "update_failed" }, 500);

  return json({ ok: true }, 200);
}

export async function onRequestDelete(context: RequestContext): Promise<Response> {
  const blocked = await guard(context);
  if (blocked) return blocked;

  const id = new URL(context.request.url).searchParams.get("id");
  if (!id) return json({ ok: false, error: "missing_id" }, 400);

  const ok = await sbDelete(context.env, TABLE, `id=eq.${encodeURIComponent(id)}`);
  if (!ok) return json({ ok: false, error: "delete_failed" }, 500);

  return json({ ok: true }, 200);
}
