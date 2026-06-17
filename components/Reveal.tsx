"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "left" | "right" | "scale";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  direction?: Direction;
  className?: string;
};

// Decalage de depart selon la direction. Tout reste en transform et opacity.
const offsets: Record<Direction, { x?: number; y?: number; scale?: number }> = {
  up: { y: 24 },
  left: { x: -40 },
  right: { x: 40 },
  scale: { y: 16, scale: 0.96 },
};

// Apparition au scroll, reutilisable. Le respect de prefers-reduced-motion est
// assure globalement par MotionConfig (components/Motion.tsx).
export default function Reveal({
  children,
  delay = 0,
  direction = "up",
  className,
}: RevealProps) {
  // En mode "animations reduites", on garde le fondu (opacite) mais on supprime le
  // decalage de position, pour ne pas laisser le contenu legerement deplace.
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...(reduce ? {} : offsets[direction]) }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
