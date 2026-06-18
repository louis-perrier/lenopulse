"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  type Brief,
  type ChatMessage,
  MAX_INPUT,
  clearSession,
  loadSession,
  newSessionId,
  saveSession,
} from "@/lib/chat";

// Source de verite unique de l'assistant IA. L'etat de la conversation (session,
// messages, brief, deverrouillage de la reservation) vit ici, pas dans un composant
// precis. La section assistant et la bulle flottante consomment le meme contexte :
// une seule conversation, partagee en direct, et un seul `briefReady` qui deverrouille
// la reservation partout. La persistance localStorage reste deleguee a lib/chat.ts.

export type ChatErrorKind = "error" | "unavailable" | null;

// Convertit le brief renvoye par le serveur en objet typé, champs manquants vides.
function asBrief(raw: Record<string, unknown>): Brief {
  const get = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string) : "");
  return {
    problem: get("problem"),
    target: get("target"),
    scope: get("scope"),
    budget: get("budget"),
    timeline: get("timeline"),
    nextStep: get("nextStep"),
  };
}

interface AssistantChatValue {
  messages: ChatMessage[];
  loading: boolean;
  error: ChatErrorKind;
  brief: Brief | null;
  briefReady: boolean;
  sessionId: string;
  send: (content: string, company?: string) => void;
  restart: () => void;
}

const AssistantChatContext = createContext<AssistantChatValue | null>(null);

export function useAssistantChat(): AssistantChatValue {
  const ctx = useContext(AssistantChatContext);
  if (!ctx) {
    throw new Error("useAssistantChat doit etre utilise dans AssistantChatProvider");
  }
  return ctx;
}

export default function AssistantChatProvider({
  lang,
  children,
}: {
  lang: string;
  children: ReactNode;
}) {
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ChatErrorKind>(null);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [briefReady, setBriefReady] = useState(false);

  // Reprise de la session depuis le navigateur (memoire locale, zero friction).
  useEffect(() => {
    const stored = loadSession();
    if (stored && stored.locale === lang) {
      setSessionId(stored.sessionId);
      setMessages(stored.messages);
      setBrief(stored.brief);
      setBriefReady(stored.briefReady);
    } else {
      setSessionId(newSessionId());
    }
  }, [lang]);

  // Miroir localStorage a chaque evolution (Supabase deviendra la source de verite en phase 2).
  useEffect(() => {
    if (!sessionId) return;
    saveSession({
      sessionId,
      locale: lang,
      messages,
      brief,
      briefReady,
      updatedAt: Date.now(),
    });
  }, [sessionId, lang, messages, brief, briefReady]);

  const send = async (content: string, company = "") => {
    const text = content.trim();
    if (!text || loading) return;
    setError(null);
    const next: ChatMessage[] = [
      ...messages,
      { role: "user", content: text.slice(0, MAX_INPUT) },
    ];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, locale: lang, messages: next, company }),
      });
      if (!res.ok) {
        // 404 = fonction absente (cas de `next dev`) : repli vers le formulaire.
        setError(res.status === 404 ? "unavailable" : "error");
        return;
      }
      const data = (await res.json()) as {
        ok?: boolean;
        reply?: string;
        briefReady?: boolean;
        brief?: Record<string, unknown> | null;
      };
      if (!data.ok) {
        setError("error");
        return;
      }
      if (typeof data.reply === "string" && data.reply.length > 0) {
        setMessages((m) => [...m, { role: "assistant", content: data.reply as string }]);
      }
      if (data.briefReady && data.brief) {
        setBrief(asBrief(data.brief));
        setBriefReady(true);
      }
    } catch {
      setError("unavailable");
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    clearSession();
    setSessionId(newSessionId());
    setMessages([]);
    setBrief(null);
    setBriefReady(false);
    setError(null);
  };

  const value: AssistantChatValue = {
    messages,
    loading,
    error,
    brief,
    briefReady,
    sessionId,
    send,
    restart,
  };

  return (
    <AssistantChatContext.Provider value={value}>
      {children}
    </AssistantChatContext.Provider>
  );
}
