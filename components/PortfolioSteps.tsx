"use client";

import { motion } from "framer-motion";
import { portfolioConfig as cfg } from "@/lib/portfolio";
import Reveal from "./Reveal";

// Le rail vertical est pose en absolu et cale sur le centre des pastilles :
// left-3.5 vaut la moitie de leur w-7, changer l'un oblige a changer l'autre.
export default function PortfolioSteps() {
  return (
    <div className="relative">
      <motion.span
        aria-hidden
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-3.5 top-3 h-[calc(100%-3rem)] w-px -translate-x-1/2 origin-top bg-linear-to-b from-primary/70 via-primary/30 to-transparent"
      />

      <ol className="grid gap-4">
        {cfg.steps.map((s, i) => (
          <li key={s.title}>
            <Reveal
              delay={i * 0.1}
              className="grid grid-cols-[1.75rem_1fr] items-start gap-x-4 sm:gap-x-6"
            >
              <span
                className={`mt-3 flex h-7 w-7 items-center justify-center rounded-full border font-mono text-[11px] font-semibold ${
                  i === 0
                    ? "border-primary bg-primary text-background"
                    : "border-primary/45 bg-background text-primary"
                }`}
              >
                {i + 1}
              </span>

              <article className="card-hairline rounded-2xl border border-border bg-surface p-5 sm:p-6.5">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">
                  {s.eyebrow}
                </span>
                <h3 className="mt-2 text-[18px] font-semibold text-ink sm:text-[19px]">{s.title}</h3>
                <p className="mt-2.5 max-w-[76ch] text-[14.5px] leading-relaxed text-ink-soft sm:text-[15px]">
                  {s.text}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1.5 font-mono text-[11.5px] text-ink-soft">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                  {s.note}
                </span>
              </article>
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  );
}
