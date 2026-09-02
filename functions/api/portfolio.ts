// Cache CDN de 30 s : une modification faite dans l'admin est visible partout en
// moins d'une demi minute, sans redeploiement.

import { type SupabaseEnv, hasSupabase, sbSelect } from "../_lib/supabase";

// Un groupe de capacites techniques, tel que stocke dans app_config.
interface CapabilityGroup {
  group: string;
  items: string[];
}

interface RequestContext {
  env: SupabaseEnv;
}

// Colonnes exposees publiquement. `published` et les horodatages restent internes.
const PUBLIC_FIELDS = [
  "id",
  "position",
  "featured",
  "span",
  "name",
  "tag",
  "line",
  "stack",
  "url",
  "image_url",
  "image_kind",
  "problem",
  "built",
  "decisions",
  "result",
  "status",
].join(",");

export async function onRequestGet(context: RequestContext): Promise<Response> {
  const { env } = context;

  // Sans Supabase configure, la page s'affiche vide plutot que cassee.
  if (!hasSupabase(env)) {
    return json({ ok: true, projects: [], capabilities: null });
  }

  const [projects, config] = await Promise.all([
    sbSelect(
      env,
      "portfolio_projects",
      `published=eq.true&select=${PUBLIC_FIELDS}&order=position.asc`
    ),
    sbSelect<{ value: CapabilityGroup[] }>(
      env,
      "app_config",
      "key=eq.portfolio_capabilities&select=value"
    ),
  ]);

  // capabilities a null : la page retombe sur la liste ecrite dans lib/portfolio.ts.
  const capabilities = config[0]?.value ?? null;

  return json({ ok: true, projects, capabilities });
}

function json(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=120",
    },
  });
}
