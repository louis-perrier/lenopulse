"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Dictionary } from "@/lib/i18n/types";
import { BRIEF_META_KEY, bookingConfig } from "@/lib/booking";
import Reveal from "./Reveal";
import RevealTitle from "./RevealTitle";
import { IconArrow, IconCheck, IconLock } from "./Icons";

// L'embed Cal.com est charge uniquement cote client (jamais au prerender statique),
// pour ne pas evaluer le paquet au build.
const Cal = dynamic(() => import("@calcom/embed-react"), { ssr: false });

// Cal.com recoit metadata.briefId (= sessionId) pour relier la reservation au brief
// cote serveur. Lien vide = Cal.com pas configure, on renvoie vers le formulaire.
export default function BookingGate({
  dict,
  briefReady,
  sessionId,
}: {
  dict: Dictionary;
  briefReady: boolean;
  sessionId: string;
}) {
  const b = dict.booking;
  const [booked, setBooked] = useState(false);
  const enabled = briefReady && bookingConfig.calLink.length > 0;

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    (async () => {
      try {
        const { getCalApi } = await import("@calcom/embed-react");
        const cal = await getCalApi({ namespace: bookingConfig.namespace });
        if (!active) return;
        cal("ui", {
          theme: bookingConfig.theme,
          hideEventTypeDetails: false,
          layout: "month_view",
        });
        cal("on", {
          action: "bookingSuccessful",
          callback: () => setBooked(true),
        });
      } catch {
        // Embed indisponible : l'iframe Cal.com gere son propre etat, repli silencieux.
      }
    })();
    return () => {
      active = false;
    };
  }, [enabled]);

  const config: Record<string, string> = {
    theme: bookingConfig.theme,
    layout: "month_view",
  };
  if (sessionId) config[`metadata[${BRIEF_META_KEY}]`] = sessionId;

  return (
    <section id="booking" className="relative border-t border-border/60">
      <div className="mx-auto max-w-3xl px-6 py-24 sm:py-32">
        <div className="text-center">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
              {b.kicker}
            </p>
          </Reveal>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
            <RevealTitle>{b.title}</RevealTitle>
          </h2>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-soft">{b.subtitle}</p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="mt-12">
            {booked ? (
              <div
                aria-live="polite"
                className="mx-auto flex max-w-xl items-center gap-4 rounded-2xl border border-border-strong bg-surface-raised px-6 py-6"
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-background">
                  <IconCheck className="h-5 w-5" />
                </span>
                <p className="font-medium text-ink">{b.booked}</p>
              </div>
            ) : !briefReady ? (
              <div className="mx-auto max-w-xl rounded-2xl border border-border bg-surface px-6 py-10 text-center">
                <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-border text-ink-soft">
                  <IconLock className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-ink">
                  {b.lockedTitle}
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">{b.lockedText}</p>
                <a
                  href="#assistant"
                  className="group mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-semibold text-background transition-colors hover:bg-primary-hover"
                >
                  {b.lockedCta}
                  <IconArrow className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            ) : !bookingConfig.calLink ? (
              <p className="mx-auto max-w-xl rounded-2xl border border-border-strong bg-surface-raised px-6 py-6 text-center text-sm text-ink-soft">
                {b.unavailable}
              </p>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                <Cal
                  namespace={bookingConfig.namespace}
                  calLink={bookingConfig.calLink}
                  config={config}
                  style={{ width: "100%", height: "100%", minHeight: "640px", overflow: "scroll" }}
                />
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
