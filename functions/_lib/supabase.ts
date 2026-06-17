// Helpers d'acces a Supabase via l'API REST PostgREST, pour les fonctions
// Cloudflare Pages. Aucune dependance : on utilise fetch et la cle service_role
// (jamais exposee au navigateur). La RLS refuse tout par defaut, seule la cle
// service_role lit et ecrit.
//
// Le dossier `functions/_lib` (prefixe underscore) n'est pas route par Cloudflare
// Pages ; il sert uniquement de module partage importe par les fonctions.

export interface SupabaseEnv {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

// Vrai seulement si la persistance est configuree. Sinon les fonctions
// fonctionnent quand meme (la persistance est best-effort, jamais bloquante).
export function hasSupabase(env: SupabaseEnv): boolean {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

function headers(env: SupabaseEnv): Record<string, string> {
  const key = env.SUPABASE_SERVICE_ROLE_KEY as string;
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

// Upsert (insert ou mise a jour sur conflit de cle). `onConflict` est la colonne
// de conflit (ex. "id"). Renvoie true si l'operation a reussi.
export async function sbUpsert(
  env: SupabaseEnv,
  table: string,
  row: Record<string, unknown>,
  onConflict: string
): Promise<boolean> {
  if (!hasSupabase(env)) return false;
  try {
    const url = `${env.SUPABASE_URL}/rest/v1/${table}?on_conflict=${encodeURIComponent(
      onConflict
    )}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        ...headers(env),
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(row),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Lecture filtree via une chaine de requete PostgREST (ex.
// "select=*&order=start_time.asc&start_time=gte.2026-01-01"). Renvoie le tableau
// de lignes, ou un tableau vide en cas d'echec.
export async function sbSelect<T = Record<string, unknown>>(
  env: SupabaseEnv,
  table: string,
  query: string
): Promise<T[]> {
  if (!hasSupabase(env)) return [];
  try {
    const sep = query ? "?" : "";
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}${sep}${query}`, {
      method: "GET",
      headers: headers(env),
    });
    if (!res.ok) return [];
    return (await res.json()) as T[];
  } catch {
    return [];
  }
}
