"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n/types";
import { useAssistantChat } from "./AssistantChatProvider";
import ChatThread from "./ChatThread";
import ChatComposer from "./ChatComposer";
import { IconChat, IconMail, IconCalendar, IconClose, IconCheck } from "./Icons";

// Le panneau ouvre le mini-chat, qui partage sa session avec la section assistant.
// Apparait apres un debut de scroll pour ne pas masquer le hero.
export default function ContactLauncher({ dict }: { dict: Dictionary }) {
  const l = dict.launcher;
  const a = dict.assistant;
  const { messages, loading, error, briefReady, send } = useAssistantChat();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reveal au scroll (meme seuil que l'ancienne barre mobile).
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fermeture sur Echap et sur clic exterieur.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div
      ref={containerRef}
      className={`fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      {/* Panneau de chat direct */}
      {open && (
        <div
          role="dialog"
          aria-label={a.kicker}
          className="flex w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-lg shadow-ink/20 sm:w-[22rem]"
        >
          {/* En-tete */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-ink">{a.kicker}</p>
            <button
              type="button"
              onClick={close}
              aria-label={dict.common.close}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface-raised hover:text-primary"
            >
              <IconClose className="h-5 w-5" />
            </button>
          </div>

          {/* Corps : fil, brief, suggestions, erreur, saisie */}
          <div className="flex flex-col gap-3 p-4">
            <ChatThread
              messages={messages}
              loading={loading}
              greeting={a.greeting}
              thinking={a.thinking}
              className="max-h-[18rem]"
            />

            {/* Brief pret : invitation a reserver (section deverrouillee) */}
            {briefReady && (
              <div className="rounded-xl border border-border-strong bg-surface-raised p-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-background">
                    <IconCheck className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-semibold text-ink">{a.briefTitle}</p>
                </div>
                <a
                  href="#booking"
                  onClick={close}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-primary-hover"
                >
                  {l.booking}
                </a>
              </div>
            )}

            {/* Suggestions de demarrage */}
            {messages.length === 0 && !loading && (
              <div className="flex flex-wrap gap-2">
                {a.starters.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => send(starter)}
                    className="rounded-full border border-border bg-surface-raised px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-primary hover:text-primary"
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
                className="rounded-xl border border-border-strong bg-surface-raised px-4 py-3 text-sm text-primary"
              >
                {error === "unavailable" ? a.unavailable : a.error}
              </p>
            )}

            <ChatComposer dict={dict} onSend={send} disabled={loading} />
          </div>

          {/* Pied : raccourcis mail et reservation vers leurs sections */}
          <div className="grid grid-cols-2 gap-2 border-t border-border p-2">
            <a
              href="#contact"
              onClick={close}
              className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-raised hover:text-primary"
            >
              <IconMail className="h-4 w-4" />
              {l.email}
            </a>
            <a
              href="#booking"
              onClick={close}
              className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-raised hover:text-primary"
            >
              <IconCalendar className="h-4 w-4" />
              {l.booking}
            </a>
          </div>
        </div>
      )}

      {/* Bouton flottant */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={open ? dict.common.close : l.open}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-background shadow-lg shadow-ink/20 transition-colors hover:bg-primary-hover"
      >
        {open ? <IconClose className="h-6 w-6" /> : <IconChat className="h-6 w-6" />}
      </button>
    </div>
  );
}
