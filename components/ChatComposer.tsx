"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/types";
import { MAX_INPUT } from "@/lib/chat";
import { IconArrow } from "./Icons";

const fieldClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-ink placeholder:text-ink-faint transition-colors focus:border-primary";

// Zone de saisie partagee entre la section assistant et la bulle. Garde son brouillon
// (`input`) et son honeypot anti-bot en local : seule la conversation est partagee via
// le contexte, pas le champ en cours de frappe. Delegue l'envoi a `onSend`.
export default function ChatComposer({
  dict,
  onSend,
  disabled,
}: {
  dict: Dictionary;
  onSend: (text: string, company: string) => void;
  disabled: boolean;
}) {
  const a = dict.assistant;
  const [input, setInput] = useState("");
  const [company, setCompany] = useState(""); // honeypot anti-bot

  const submit = () => {
    if (disabled || !input.trim()) return;
    onSend(input, company);
    setInput("");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex items-end gap-2">
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
        disabled={disabled || !input.trim()}
        aria-label={a.send}
        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-background transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        <IconArrow className="h-5 w-5" />
      </button>
    </form>
  );
}
