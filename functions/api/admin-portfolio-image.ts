// Le fichier est renomme cote serveur : le nom d'origine n'est jamais repris tel
// quel, pour eviter les collisions et les caracteres douteux dans l'URL.

import { type SupabaseEnv, hasSupabase, sbUploadPublic } from "../_lib/supabase";
import { getCookie, verifyToken } from "../_lib/adminToken";

interface Env extends SupabaseEnv {
  ADMIN_TOKEN_SECRET?: string;
}

interface RequestContext {
  request: Request;
  env: Env;
}

const COOKIE = "lenopulse_admin";
const BUCKET = "portfolio";
const MAX_BYTES = 5 * 1024 * 1024; // 5 Mo, largement assez pour une capture d'ecran

// Types acceptes et extension de fichier correspondante.
const TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequestPost(context: RequestContext): Promise<Response> {
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

  let file: File | null = null;
  try {
    const form = await request.formData();
    const candidate = form.get("file");
    if (candidate instanceof File) file = candidate;
  } catch {
    return json({ ok: false, error: "invalid_body" }, 400);
  }

  if (!file) return json({ ok: false, error: "missing_file" }, 400);

  const extension = TYPES[file.type];
  if (!extension) return json({ ok: false, error: "unsupported_type" }, 415);
  if (file.size > MAX_BYTES) return json({ ok: false, error: "file_too_large" }, 413);

  const name = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
  const url = await sbUploadPublic(env, BUCKET, name, await file.arrayBuffer(), file.type);
  if (!url) return json({ ok: false, error: "upload_failed" }, 500);

  return json({ ok: true, url }, 201);
}
