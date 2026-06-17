// Types et utilitaires de l'assistant IA de cadrage (cote client).
// La fonction Cloudflare functions/api/chat.ts est volontairement autonome
// (elle ne partage pas ce fichier) pour rester simple a deployer.

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

// Synthese structuree produite par l'IA une fois le projet cadre.
export interface Brief {
  problem: string;
  target: string;
  scope: string;
  budget: string;
  timeline: string;
  nextStep: string;
}

export interface StoredSession {
  sessionId: string;
  locale: string;
  identity?: { name?: string; email?: string };
  messages: ChatMessage[];
  brief: Brief | null;
  briefReady: boolean;
  updatedAt: number;
}

const STORAGE_KEY = "lenopulse_session_v1";

// Longueur maximale d'un message saisi cote client (le serveur revalide).
export const MAX_INPUT = 2000;

function uuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Repli simple si randomUUID est indisponible.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function newSessionId(): string {
  return uuid();
}

export function loadSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed || typeof parsed.sessionId !== "string" || !Array.isArray(parsed.messages)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(session: StoredSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...session, updatedAt: Date.now() })
    );
  } catch {
    // Stockage indisponible (mode prive, quota) : on ignore silencieusement.
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
