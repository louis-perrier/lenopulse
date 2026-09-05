"use client";

import { useEffect, useState } from "react";
import type { SVGProps } from "react";
import type { PortfolioAutomation } from "@/lib/portfolio";
import { copierTexte, lienDirect, telechargerWorkflow } from "@/lib/automations";

// Les trois actions d'un scenario, partagees par la carte de la grille et la
// ligne du catalogue. Un hook plutot qu'une barre de boutons parametree : la
// logique est la meme, la presentation non, la carte libelle ce que la ligne
// reduit a une icone.

export type EtatAction = "repos" | "ok" | "echec";

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export function IconePartage(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="17.5" cy="5.5" r="2.5" />
      <circle cx="6.5" cy="12" r="2.5" />
      <circle cx="17.5" cy="18.5" r="2.5" />
      <path d="m8.8 10.7 6.4-3.9m-6.4 6.5 6.4 3.9" />
    </svg>
  );
}

export function IconeTelecharger(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4v11m-4.5-4.5L12 15l4.5-4.5M5 19.5h14" />
    </svg>
  );
}

export function IconeJouer(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M10.2 8.7 15.5 12l-5.3 3.3z" />
    </svg>
  );
}

export function IconeCopie(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="9" y="9" width="10.5" height="10.5" rx="2" />
      <path d="M15 6.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v7.5A1.5 1.5 0 0 0 6 15h.5" />
    </svg>
  );
}

export function IconeCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export function IconeLoupe(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="m19.5 19.5-4.2-4.2" />
    </svg>
  );
}

export function IconeFermer(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="max-w-full truncate rounded border border-border bg-surface px-2 py-1 font-mono text-[10.5px] text-ink-soft">
      {children}
    </span>
  );
}

export const classeBoutonIcone =
  "inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-border text-ink-soft transition-colors hover:border-primary hover:text-accent";

export function useAutomationActions(a: PortfolioAutomation) {
  const [etatCopie, setEtatCopie] = useState<EtatAction>("repos");
  const [etatPartage, setEtatPartage] = useState<EtatAction>("repos");

  const workflow = a.workflow_json;
  const guide = a.guide_url;

  // Seul le succes s'efface. Un echec porte une consigne de repli, il reste
  // affiche jusqu'au prochain essai.
  useEffect(() => {
    if (etatCopie !== "ok") return;
    const t = setTimeout(() => setEtatCopie("repos"), 2200);
    return () => clearTimeout(t);
  }, [etatCopie]);

  useEffect(() => {
    if (etatPartage !== "ok") return;
    const t = setTimeout(() => setEtatPartage("repos"), 2200);
    return () => clearTimeout(t);
  }, [etatPartage]);

  const copierWorkflow = async () => {
    if (!workflow) return;
    setEtatCopie((await copierTexte(workflow)) ? "ok" : "echec");
  };

  const telecharger = () => {
    if (!workflow) return;
    telechargerWorkflow(a.name, workflow);
  };

  const partager = async () => {
    setEtatPartage((await copierTexte(lienDirect(a))) ? "ok" : "echec");
  };

  return { workflow, guide, etatCopie, etatPartage, copierWorkflow, telecharger, partager };
}
