// Lueur doree qui suit le curseur sur une carte. Throttle via requestAnimationFrame
// (une seule mise a jour par frame, quelle que soit la frequence des pointermove).
// On ecrit --mx / --my sur la carte survolee ; le rendu est gere en CSS
// (.spotlight-layer dans globals.css).
import type { PointerEvent } from "react";

let frame = 0;
let pending: { el: HTMLElement; x: number; y: number } | null = null;

export function trackSpotlight(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  pending = { el, x: e.clientX - rect.left, y: e.clientY - rect.top };
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    if (!pending) return;
    pending.el.style.setProperty("--mx", `${pending.x}px`);
    pending.el.style.setProperty("--my", `${pending.y}px`);
    pending = null;
  });
}
