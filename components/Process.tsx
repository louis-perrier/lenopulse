"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/lib/i18n/types";
import Reveal from "./Reveal";
import RevealTitle from "./RevealTitle";

export default function Process({ dict }: { dict: Dictionary }) {
  const p = dict.process;

  return (
    <section id="process" className="relative section-light">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
            <RevealTitle>{p.title}</RevealTitle>
          </h2>
          <Reveal delay={0.1}>
            <p className="mt-4 text-lg text-ink-soft">{p.subtitle}</p>
          </Reveal>
        </div>

        <div className="relative mt-14 pl-6 md:pl-0 md:pt-12">
          {/* Trait dore qui se trace entre les etapes : horizontal en desktop. */}
          <motion.span
            aria-hidden
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-0 hidden h-px w-full origin-left bg-linear-to-r from-primary/0 via-primary to-primary/0 md:block"
          />
          {/* Variante verticale en mobile. */}
          <motion.span
            aria-hidden
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-0 h-full w-px origin-top bg-linear-to-b from-primary/0 via-primary to-primary/0 md:hidden"
          />

          <div className="grid gap-5 md:grid-cols-3">
            {p.steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.12}>
                <article className="relative h-full rounded-2xl border border-border bg-surface p-7">
                  <span className="font-display text-5xl font-semibold text-gradient-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {step.description}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
