"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n/types";
import {
  type Brief,
  type ChatMessage,
  MAX_INPUT,
  clearSession,
  loadSession,
  newSessionId,
  saveSession,
} from "@/lib/chat";
import Reveal from "./Reveal";
import RevealTitle from "./RevealTitle";
import BookingGate from "./BookingGate";
import { IconArrow, IconCheck } from "./Icons";

type ErrorKind = "error" | "unavailable" | null;

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

const fieldClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-ink placeholder:text-ink-faint transition-colors focus:border-primary";

export default function Assistant({
  lang,
  dict,
}: {
  lang: string;
  dict: Dictionary;
}) {
  const a = dict.assistant;
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [company, setCompany] = useState(""); // honeypot anti-bot
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorKind>(null);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [briefReady, setBriefReady] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Defilement automatique vers le dernier message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, briefReady]);

  const send = async (content: string) => {
    const text = content.trim();
    if (!text || loading) return;
    setError(null);
    const next: ChatMessage[] = [
      ...messages,
      { role: "user", content: text.slice(0, MAX_INPUT) },
    ];
    setMessages(next);
    setInput("");
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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const restart = () => {
    clearSession();
    setSessionId(newSessionId());
    setMessages([]);
    setBrief(null);
    setBriefReady(false);
    setError(null);
    setInput("");
  };

  const briefRows: { key: string; label: string; value: string }[] = brief
    ? [
        { key: "problem", label: a.briefFields.problem, value: brief.problem },
        { key: "target", label: a.briefFields.target, value: brief.target },
        { key: "scope", label: a.briefFields.scope, value: brief.scope },
        { key: "budget", label: a.briefFields.budget, value: brief.budget },
        { key: "timeline", label: a.briefFields.timeline, value: brief.timeline },
        { key: "nextStep", label: a.briefFields.nextStep, value: brief.nextStep },
      ]
    : [];

  return (
    <>
    <section id="assistant" className="relative border-t border-border/60">
      <div className="mx-auto max-w-3xl px-6 py-24 sm:py-32">
        <div className="text-center">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
              {a.kicker}
            </p>
          </Reveal>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
            <RevealTitle>{a.title}</RevealTitle>
          </h2>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-soft">{a.subtitle}</p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="mt-12 rounded-2xl border border-border bg-surface p-4 sm:p-6">
            {/* Fil de la conversation */}
            <div
              ref={scrollRef}
              className="flex max-h-[26rem] flex-col gap-3 overflow-y-auto pr-1"
            >
              <p className="max-w-[85%] self-start whitespace-pre-wrap rounded-2xl rounded-bl-md bg-surface-raised px-4 py-3 text-sm leading-relaxed text-ink">
                {a.greeting}
              </p>
              {messages.map((m, i) => (
                <p
                  key={i}
                  className={
                    m.role === "user"
                      ? "max-w-[85%] self-end whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-relaxed text-background"
                      : "max-w-[85%] self-start whitespace-pre-wrap rounded-2xl rounded-bl-md bg-surface-raised px-4 py-3 text-sm leading-relaxed text-ink"
                  }
                >
                  {m.content}
                </p>
              ))}
              {loading && (
                <p className="max-w-[85%] self-start rounded-2xl rounded-bl-md bg-surface-raised px-4 py-3 text-sm leading-relaxed text-ink-soft">
                  <span className="animate-pulse">{a.thinking}</span>
                </p>
              )}
            </div>

            {/* Synthese de brief, une fois le projet cadre */}
            {briefReady && brief && (
              <div className="mt-4 rounded-2xl border border-border-strong bg-surface-raised p-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-background">
                    <IconCheck className="h-4 w-4" />
                  </span>
                  <h3 className="font-display text-xl font-semibold text-ink">
                    {a.briefTitle}
                  </h3>
                </div>
                <p className="mt-3 text-sm text-ink-soft">{a.briefIntro}</p>
                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                  {briefRows
                    .filter((row) => row.value)
                    .map((row) => (
                      <div key={row.key}>
                        <dt className="text-xs font-medium uppercase tracking-wider text-ink-faint">
                          {row.label}
                        </dt>
                        <dd className="mt-1 text-sm text-ink">{row.value}</dd>
                      </div>
                    ))}
                </dl>
                <a
                  href="#booking"
                  className="group mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-semibold text-background transition-colors hover:bg-primary-hover"
                >
                  {a.briefCta}
                  <IconArrow className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            )}

            {/* Suggestions de demarrage */}
            {messages.length === 0 && !loading && (
              <div className="mt-4 flex flex-wrap gap-2">
                {a.starters.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => send(starter)}
                    className="rounded-full border border-border bg-surface-raised px-4 py-2 text-sm text-ink-soft transition-colors hover:border-primary hover:text-primary"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            )}

            {/* Message d'erreur ou de repli */}
            {error && (
              <p
                aria-live="polite"
                className="mt-4 rounded-xl border border-border-strong bg-surface-raised px-4 py-3 text-sm text-primary"
              >
                {error === "unavailable" ? a.unavailable : a.error}
              </p>
            )}

            {/* Saisie */}
            <form onSubmit={onSubmit} className="mt-4 flex items-end gap-2">
              {/* Champ piege anti-bot : invisible, hors tabulation. */}
              <input
                type="text"
                name="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
              />
              <textarea
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={a.inputPlaceholder}
                aria-label={a.inputPlaceholder}
                maxLength={MAX_INPUT}
                className={`${fieldClass} resize-none`}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label={a.send}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-background transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                <IconArrow className="h-5 w-5" />
              </button>
            </form>

            {/* Pied : mention et reinitialisation */}
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-xs text-ink-faint">{a.disclaimer}</p>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={restart}
                  className="shrink-0 text-xs font-medium text-ink-soft underline-offset-2 transition-colors hover:text-primary hover:underline"
                >
                  {a.restart}
                </button>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
    <BookingGate dict={dict} briefReady={briefReady} sessionId={sessionId} />
    </>
  );
}
