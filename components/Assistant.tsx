"use client";

import type { Dictionary } from "@/lib/i18n/types";
import { useAssistantChat } from "./AssistantChatProvider";
import ChatThread from "./ChatThread";
import ChatComposer from "./ChatComposer";
import Reveal from "./Reveal";
import RevealTitle from "./RevealTitle";
import BookingGate from "./BookingGate";
import { IconArrow, IconCheck } from "./Icons";

// Section assistant IA (vue complete). L'etat de la conversation vit dans
// AssistantChatProvider : cette section et la bulle flottante partagent la meme
// conversation et le meme deverrouillage de reservation. Ici on assemble le fil
// (ChatThread), la saisie (ChatComposer), la carte de brief detaillee et la
// reservation gatee (BookingGate).
export default function Assistant({ dict }: { dict: Dictionary }) {
  const a = dict.assistant;
  const { messages, loading, error, brief, briefReady, sessionId, send, restart } =
    useAssistantChat();

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
            <ChatThread
              messages={messages}
              loading={loading}
              greeting={a.greeting}
              thinking={a.thinking}
              className="max-h-[26rem]"
            />

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
            <div className="mt-4">
              <ChatComposer dict={dict} onSend={send} disabled={loading} />
            </div>

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
