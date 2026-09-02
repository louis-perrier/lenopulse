"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

// A placer dans la balise de titre pour garder la semantique du parent.
// useInView observe le conteneur EXTERIEUR : au repos le texte est translate de
// 115%, donc decoupe par overflow-hidden, un observer dessus n'animerait jamais.
export default function RevealTitle({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const revealed = reduce || inView;

  return (
    <span
      ref={ref}
      className={`block overflow-hidden py-[0.1em] -my-[0.1em] ${className}`}
    >
      <motion.span
        className="block"
        initial={{ y: reduce ? "0%" : "115%" }}
        animate={{ y: revealed ? "0%" : "115%" }}
        transition={{
          duration: reduce ? 0 : 0.8,
          delay: reduce ? 0 : delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.span>
    </span>
  );
}
