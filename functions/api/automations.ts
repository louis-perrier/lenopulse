// Cloudflare Pages Function. Scenarios n8n publies, pour la section Automations
// de /portfolio. GET public, sans authentification.
//
// Le JSON du workflow est renvoye avec la liste plutot que sur demande : les
// scenarios sont courts, et la copie vers le presse-papier doit rester synchrone
// pour ne pas etre bloquee par Safari, qui invalide l'autorisation de copie des
// qu'une requete reseau s'intercale apres le clic.
//
// Variables d'environnement :
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY

import { type SupabaseEnv, hasSupabase, sbSelect } from "../_lib/supabase";

interface RequestContext {
  env: SupabaseEnv;
}

const PUBLIC_FIELDS = [
  "id",
  "position",
  "slug",
  "name",
  "summary",
  "description",
  "tools",
  "image_url",
  "guide_url",
  "workflow_json",
  "node_count",
].join(",");

export async function onRequestGet(context: RequestContext): Promise<Response> {
  const { env } = context;

  if (!hasSupabase(env)) {
    return json({ ok: true, automations: [] });
  }

  const automations = await sbSelect(
    env,
    "portfolio_automations",
    `published=eq.true&select=${PUBLIC_FIELDS}&order=position.asc`
  );

  return json({ ok: true, automations });
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
