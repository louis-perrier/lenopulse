"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

// Fait respecter prefers-reduced-motion a toutes les animations framer-motion
// (reveals, parallaxe, masques, trace du Process). Le @media de globals.css ne
// neutralise que les animations CSS, pas celles pilotees en JS.
export default function Motion({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
