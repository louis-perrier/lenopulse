"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { Dictionary } from "@/lib/i18n/types";
import Reveal from "./Reveal";
import RevealTitle from "./RevealTitle";
import { IconArrow } from "./Icons";

export default function FinalCta({ dict }: { dict: Dictionary }) {
  const f = dict.finalCta;

  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const haloY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [70, -70]);
  const haloScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0.9, 1.1]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden border-t border-border/60">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <motion.div
          style={{ y: haloY, scale: haloScale }}
          className="glow-gold absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        />
        <div className="grain" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 py-28 text-center sm:py-36">
        <h2 className="mx-auto max-w-2xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
          <RevealTitle>{f.title}</RevealTitle>
        </h2>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft">{f.subtitle}</p>

          <div className="mt-10 flex justify-center">
            <a
              href="#contact"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-background transition-colors hover:bg-primary-hover"
            >
              {f.cta}
              <IconArrow className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          <p className="mt-6 text-sm text-ink-faint">{f.reassurance}</p>
        </Reveal>
      </div>
    </section>
  );
}
