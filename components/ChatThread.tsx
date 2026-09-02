"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/chat";

// Hauteur max pilotee par className selon le contexte (section large ou bulle).
export default function ChatThread({
  messages,
  loading,
  greeting,
  thinking,
  className = "",
}: {
  messages: ChatMessage[];
  loading: boolean;
  greeting: string;
  thinking: string;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  return (
    <div
      ref={scrollRef}
      className={`flex flex-col gap-3 overflow-y-auto pr-1 ${className}`}
    >
      <p className="max-w-[85%] self-start whitespace-pre-wrap rounded-2xl rounded-bl-md bg-surface-raised px-4 py-3 text-sm leading-relaxed text-ink">
        {greeting}
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
          <span className="animate-pulse">{thinking}</span>
        </p>
      )}
    </div>
  );
}
