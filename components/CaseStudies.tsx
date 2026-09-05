"use client";

import { useState } from "react";
import type { Dictionary, WorkItem } from "@/lib/i18n/types";
import Reveal from "./Reveal";
import RevealTitle from "./RevealTitle";
import CaseVisual from "./CaseVisual";
import CaseStudyModal from "./CaseStudyModal";
import { trackSpotlight } from "@/lib/spotlight";
import { IconArrow } from "./Icons";

export default function CaseStudies({ dict }: { dict: Dictionary }) {
  const w = dict.work;
  const [selected, setSelected] = useState<{ item: WorkItem; index: number } | null>(
    null
  );

  return (
    <section id="work" className="relative border-t border-border/60">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
            <RevealTitle>{w.title}</RevealTitle>
          </h2>
          <Reveal delay={0.1}>
            <p className="mt-4 text-lg text-ink-soft">{w.subtitle}</p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {w.items.map((item, i) => (
            <Reveal key={item.id} delay={(i % 3) * 0.07} direction="scale">
              <button
                type="button"
                onClick={() => setSelected({ item, index: i })}
                onPointerMove={trackSpotlight}
                className="card-hairline group block h-full w-full overflow-hidden rounded-2xl border border-border bg-surface text-left transition duration-300 hover:-translate-y-1 hover:border-border-strong hover:shadow-[var(--shadow-lift)]"
              >
                <span aria-hidden className="spotlight-layer" />
                <CaseVisual item={item} index={i} className="h-40 w-full" />
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-ink">{item.name}</h3>
                  <p className="mt-1 text-sm text-ink-soft">{item.teaser}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    {dict.common.discover}
                    <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <CaseStudyModal
        item={selected?.item ?? null}
        index={selected?.index ?? 0}
        dict={dict}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
