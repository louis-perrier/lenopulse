// Jeton de session admin signe (HMAC SHA-256, Web Crypto). Aucun stockage serveur :
// le jeton porte sa date d'expiration et sa signature. Utilise par les fonctions
// admin pour authentifier Louis apres saisie du mot de passe.

function b64urlFromString(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlToString(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Comparaison a temps constant (evite les attaques temporelles).
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createToken(secret: string, ttlSeconds: number): Promise<string> {
  const payload = b64urlFromString(JSON.stringify({ exp: Date.now() + ttlSeconds * 1000 }));
  const sig = await hmacHex(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifyToken(secret: string, token: string | null): Promise<boolean> {
  if (!token || !token.includes(".")) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = await hmacHex(secret, payload);
  if (!timingSafeEqual(expected, sig)) return false;
  try {
    const parsed = JSON.parse(b64urlToString(payload)) as { exp?: number };
    return typeof parsed.exp === "number" && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

// Lit un cookie nomme dans l'en-tete Cookie.
export function getCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(/;\s*/)) {
    const idx = part.indexOf("=");
    if (idx > -1 && part.slice(0, idx) === name) {
      return decodeURIComponent(part.slice(idx + 1));
    }
  }
  return null;
}
