"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

// Titre revele par masque : le texte monte depuis le bas dans un conteneur
// overflow-hidden. A placer a l'interieur de la balise de titre (h1 / h2) pour
// conserver la semantique et les styles typographiques du parent.
// py / -my compensent le clipping des jambages et accents au repos quand le
// titre utilise un interlignage serre.
//
// Important : le declenchement est observe sur le conteneur EXTERIEUR (jamais
// decoupe) via useInView, et non sur le texte interieur. Au repos le texte est
// translate de 115% donc entierement decoupe par overflow-hidden : un observer
// pose dessus le verrait toujours "hors champ" et n'animerait jamais (le titre
// resterait invisible). En "animations reduites", la translation est neutralisee.
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
