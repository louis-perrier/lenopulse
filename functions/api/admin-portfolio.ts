// Cloudflare Pages Function. Gestion des projets du portfolio depuis /admin.
// Protege par le cookie de session admin (meme mecanisme que admin-bookings).
//
//   GET    /api/admin-portfolio           tous les projets (brouillons compris) et
//                                         les capacites techniques
//   POST   /api/admin-portfolio           cree un projet (renvoie la ligne creee)
//   POST   /api/admin-portfolio  {action:"reorder", ids:[...]}         reordonne
//   POST   /api/admin-portfolio  {action:"capabilities", groups:[...]} enregistre les
//                                         capacites (cle portfolio_capabilities de app_config)
//   PUT    /api/admin-portfolio           met a jour un projet (body.id requis)
//   DELETE /api/admin-portfolio?id=<uuid> supprime un projet
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
  sbUpsert,
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
const TABLE = "portfolio_projects";

const SPANS = ["wide", "half"];
const IMAGE_KINDS = ["image", "logo", "abstract"];

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// Verifie le cookie de session. Renvoie une reponse d'erreur, ou null si l'acces
// est autorise.
async function guard(context: RequestContext): Promise<Response | null> {
  const { request, env } = context;
  if (!env.ADMIN_TOKEN_SECRET) {
    return json({ ok: false, error: "server_not_configured" }, 500);
  }
  const token = getCookie(request.headers.get("Cookie"), COOKIE);
  if (!(await verifyToken(env.ADMIN_TOKEN_SECRET, token))) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }
  if (!hasSupabase(env)) {
    return json({ ok: false, error: "supabase_not_configured" }, 500);
  }
  return null;
}

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

// N'accepte qu'une adresse http(s), pour eviter d'injecter un javascript: dans la page.
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

function choice(value: unknown, allowed: string[], fallback: string): string {
  return typeof value === "string" && allowed.includes(value) ? value : fallback;
}

// Construit la ligne a ecrire a partir du corps de la requete. Seules les colonnes
// connues passent : rien d'autre ne peut etre injecte depuis le navigateur.
function toRow(body: Record<string, unknown>): Record<string, unknown> {
  return {
    name: text(body.name, 120) ?? "Sans titre",
    tag: text(body.tag, 60),
    line: text(body.line, 200),
    stack: list(body.stack),
    url: link(body.url),
    image_url: link(body.image_url),
    image_kind: choice(body.image_kind, IMAGE_KINDS, "image"),
    span: choice(body.span, SPANS, "half"),
    featured: body.featured !== false,
    published: body.published === true,
    problem: text(body.problem, 2000),
    built: text(body.built, 2000),
    decisions: text(body.decisions, 2000),
    result: text(body.result, 2000),
    status: text(body.status, 300),
  };
}

export async function onRequestGet(context: RequestContext): Promise<Response> {
  const blocked = await guard(context);
  if (blocked) return blocked;

  const [projects, config] = await Promise.all([
    sbSelect(context.env, TABLE, "select=*&order=position.asc&order=created_at.asc"),
    sbSelect<{ value: unknown }>(
      context.env,
      "app_config",
      "key=eq.portfolio_capabilities&select=value"
    ),
  ]);

  return json({ ok: true, projects, capabilities: config[0]?.value ?? [] }, 200);
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

  // Capacites techniques : un tableau de groupes, remplace en bloc.
  if (body.action === "capabilities") {
    const raw = Array.isArray(body.groups) ? body.groups : [];
    const groups = raw
      .map((g) => {
        const entry = g as { group?: unknown; items?: unknown };
        const name = typeof entry.group === "string" ? entry.group.trim().slice(0, 60) : "";
        const items = Array.isArray(entry.items)
          ? entry.items
              .map((i) => (typeof i === "string" ? i.trim().slice(0, 40) : ""))
              .filter(Boolean)
              .slice(0, 20)
          : [];
        return name ? { group: name, items } : null;
      })
      .filter(Boolean)
      .slice(0, 12);

    const ok = await sbUpsert(
      context.env,
      "app_config",
      { key: "portfolio_capabilities", value: groups, updated_at: new Date().toISOString() },
      "key"
    );
    if (!ok) return json({ ok: false, error: "capabilities_failed" }, 500);
    return json({ ok: true }, 200);
  }

  // Reordonnancement : on recoit la liste des identifiants dans le nouvel ordre.
  if (body.action === "reorder") {
    const ids = Array.isArray(body.ids) ? body.ids : [];
    let rank = 0;
    for (const id of ids) {
      if (typeof id !== "string") continue;
      const ok = await sbPatch(context.env, TABLE, `id=eq.${encodeURIComponent(id)}`, {
        position: rank,
        updated_at: new Date().toISOString(),
      });
      if (!ok) return json({ ok: false, error: "reorder_failed" }, 500);
      rank += 1;
    }
    return json({ ok: true }, 200);
  }

  // Creation : le nouveau projet se place a la fin de la liste.
  const existing = await sbSelect<{ position: number }>(
    context.env,
    TABLE,
    "select=position&order=position.desc&limit=1"
  );
  const nextPosition = existing.length ? (existing[0].position ?? 0) + 1 : 0;

  const created = await sbInsert(context.env, TABLE, {
    ...toRow(body),
    position: nextPosition,
  });
  if (!created) return json({ ok: false, error: "create_failed" }, 500);

  return json({ ok: true, project: created }, 201);
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

  const ok = await sbPatch(context.env, TABLE, `id=eq.${encodeURIComponent(id)}`, {
    ...toRow(body),
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
