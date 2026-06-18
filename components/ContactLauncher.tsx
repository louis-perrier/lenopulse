"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n/types";
import { IconChat, IconMail, IconCalendar, IconClose } from "./Icons";

// Bulle de contact flottante. Raccourci unique vers les trois voies de contact
// (assistant IA, formulaire mail, reservation), qui vivent plus bas en sections.
// Elle ne duplique aucune logique : chaque entree fait simplement defiler vers la
// section concernee. Remplace l'ancienne MobileCtaBar (un seul element flottant,
// bureau et mobile). Apparait apres un debut de scroll pour ne pas masquer le hero.
export default function ContactLauncher({ dict }: { dict: Dictionary }) {
  const l = dict.launcher;
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

  const items = [
    { href: "#assistant", label: l.chat, Icon: IconChat },
    { href: "#contact", label: l.email, Icon: IconMail },
    { href: "#booking", label: l.booking, Icon: IconCalendar },
  ];

  return (
    <div
      ref={containerRef}
      className={`fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      {/* Mini-menu des trois voies de contact */}
      {open && (
        <div className="w-60 overflow-hidden rounded-2xl border border-border bg-surface shadow-lg shadow-black/40">
          <p className="border-b border-border px-4 py-3 text-xs font-medium uppercase tracking-wider text-ink-faint">
            {l.title}
          </p>
          <nav className="flex flex-col p-2">
            {items.map(({ href, label, Icon }) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-ink transition-colors hover:bg-surface-raised hover:text-primary"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-raised text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Bouton flottant */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={open ? dict.common.close : l.open}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-background shadow-lg shadow-black/40 transition-colors hover:bg-primary-hover"
      >
        {open ? <IconClose className="h-6 w-6" /> : <IconChat className="h-6 w-6" />}
      </button>
    </div>
  );
}
