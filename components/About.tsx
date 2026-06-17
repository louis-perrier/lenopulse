"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { Dictionary } from "@/lib/i18n/types";
import Reveal from "./Reveal";
import RevealTitle from "./RevealTitle";

export default function About({ dict }: { dict: Dictionary }) {
  const a = dict.about;

  // Parallaxe douce de la photo. L'image deborde le cadre (overscan) pour qu'aucun
  // bord ne se decouvre pendant le mouvement.
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [36, -36]);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative section-light overflow-hidden"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 sm:py-32 lg:grid-cols-2">
        <Reveal direction="left">
          <div className="card-hairline relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-3xl border border-border">
            <motion.div style={{ y: photoY }} className="absolute inset-x-0 -inset-y-[10%]">
              <Image
                src="/louis.png"
                alt={a.photoAlt}
                fill
                sizes="24rem"
                className="object-cover"
              />
            </motion.div>
            <span className="absolute inset-0 ring-1 ring-inset ring-primary/10" />
          </div>
        </Reveal>

        <div>
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
            <RevealTitle>{a.title}</RevealTitle>
          </h2>
          <Reveal delay={0.1} direction="right">
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">{a.body}</p>

            <div className="mt-8">
              <p className="text-sm font-medium uppercase tracking-wider text-ink-faint">
                {a.languagesLabel}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {a.languages.map((language) => (
                  <span
                    key={language}
                    className="rounded-full border border-border-strong bg-surface px-4 py-1.5 text-sm text-ink"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
