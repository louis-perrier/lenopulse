"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { Dictionary } from "@/lib/i18n/types";
import RevealTitle from "./RevealTitle";
import { IconArrow, IconSpark } from "./Icons";

export default function Hero({ dict }: { dict: Dictionary }) {
  const h = dict.hero;

  // Parallaxe douce des halos pendant le scroll du hero (desactivee si l'utilisateur
  // prefere reduire les animations).
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const haloY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 140]);

  return (
    <section id="top" ref={sectionRef} className="relative overflow-hidden">
      {/* Decor de fond : halos dores flottants + grain. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <motion.div style={{ y: haloY }} className="absolute inset-0">
          <div className="glow-gold absolute -top-32 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 animate-float rounded-full blur-3xl" />
          <div className="glow-gold absolute -right-40 top-40 h-[30rem] w-[30rem] rounded-full opacity-60 blur-3xl" />
        </motion.div>
        <div className="grain" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-background" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 pb-24 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-1.5 text-xs font-medium tracking-wide text-ink-soft"
        >
          <IconSpark className="h-3.5 w-3.5 text-primary" />
          {h.kicker}
        </motion.div>

        <h1 className="mt-7 max-w-4xl font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl">
          <RevealTitle delay={0.08}>
            {h.titleLine1}{" "}
            <span className="text-gradient-gold">{h.titleHighlight}</span>
          </RevealTitle>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 max-w-2xl text-lg leading-relaxed text-ink-soft sm:text-xl"
        >
          {h.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
        >
          <a
            href="#contact"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-background transition-colors hover:bg-primary-hover"
          >
            {h.ctaPrimary}
            <IconArrow className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#work"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border-strong px-6 py-3.5 text-base font-medium text-ink transition-colors hover:border-primary hover:text-primary"
          >
            {h.ctaSecondary}
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-6 text-sm text-ink-faint"
        >
          {h.reassurance}
        </motion.p>
      </div>
    </section>
  );
}
