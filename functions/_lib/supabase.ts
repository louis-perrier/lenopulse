// Acces Supabase via PostgREST avec la cle service_role, jamais exposee au
// navigateur. Le prefixe underscore de _lib empeche Cloudflare Pages de le router.

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

// Insertion d'une ligne. Renvoie la ligne creee (avec son id genere), ou null.
export async function sbInsert<T = Record<string, unknown>>(
  env: SupabaseEnv,
  table: string,
  row: Record<string, unknown>
): Promise<T | null> {
  if (!hasSupabase(env)) return null;
  try {
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { ...headers(env), Prefer: "return=representation" },
      body: JSON.stringify(row),
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as T[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

// Mise a jour ciblee. `query` est un filtre PostgREST (ex. "id=eq.<uuid>").
export async function sbPatch(
  env: SupabaseEnv,
  table: string,
  query: string,
  patch: Record<string, unknown>
): Promise<boolean> {
  if (!hasSupabase(env)) return false;
  try {
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}?${query}`, {
      method: "PATCH",
      headers: { ...headers(env), Prefer: "return=minimal" },
      body: JSON.stringify(patch),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Suppression ciblee. `query` est un filtre PostgREST (ex. "id=eq.<uuid>").
export async function sbDelete(
  env: SupabaseEnv,
  table: string,
  query: string
): Promise<boolean> {
  if (!hasSupabase(env)) return false;
  try {
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}?${query}`, {
      method: "DELETE",
      headers: { ...headers(env), Prefer: "return=minimal" },
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Envoi d'un fichier dans un bucket Storage public. Renvoie l'URL publique du
// fichier, ou null en cas d'echec. Le bucket doit exister et etre public.
export async function sbUploadPublic(
  env: SupabaseEnv,
  bucket: string,
  path: string,
  body: ArrayBuffer,
  contentType: string
): Promise<string | null> {
  if (!hasSupabase(env)) return null;
  try {
    const key = env.SUPABASE_SERVICE_ROLE_KEY as string;
    const res = await fetch(
      `${env.SUPABASE_URL}/storage/v1/object/${bucket}/${path}`,
      {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": contentType,
          "x-upsert": "true",
        },
        body,
      }
    );
    if (!res.ok) return null;
    return `${env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
  } catch {
    return null;
  }
}
