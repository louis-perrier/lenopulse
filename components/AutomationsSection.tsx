"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PortfolioAutomation } from "@/lib/portfolio";
import { ancre, cleDeLAncre, promouvoir } from "@/lib/automations";
import AutomationsCatalog from "./AutomationsCatalog";
import {
  Chip,
  IconeCheck,
  IconeJouer,
  IconeLoupe,
  IconePartage,
  IconeTelecharger,
  classeBoutonIcone,
  useAutomationActions,
} from "./AutomationActions";

// Section Automations de /portfolio. Des scenarios n8n reels, que le visiteur
// emporte sans rien donner en echange : ni email, ni compte. C'est la preuve la
// plus directe de la specialite, et un decideur peut la verifier lui-meme en
// collant le workflow dans son instance.
//
// Le workflow arrive avec la liste (voir functions/api/automations.ts) pour que
// la copie reste synchrone au clic. Safari annule l'ecriture dans le
// presse-papier des qu'une requete reseau s'intercale entre le clic et la copie.

// Deux rangees pleines sur grand ecran. Le reste passe par le catalogue.
const MAX_CARTES = 6;

function AutomationCard({ automation }: { automation: PortfolioAutomation }) {
  const { workflow, guide, etatCopie, etatPartage, copierWorkflow, telecharger, partager } =
    useAutomationActions(automation);

  const reste = automation.tools.length - 4;

  return (
    <article
      id={`a-${ancre(automation)}`}
      className="card-hairline flex scroll-mt-24 flex-col overflow-hidden rounded-2xl border border-border bg-surface"
    >
      {automation.image_url ? (
        <div className="aspect-[16/9] max-h-40 overflow-hidden border-b border-border bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={automation.image_url}
            alt={`${automation.name}, canvas n8n`}
            loading="lazy"
            className="h-full w-full object-cover object-top"
          />
        </div>
      ) : (
        // Meme hauteur que la capture, sinon le titre remonte et desaligne la rangee.
        <div
          className="pf-abstract aspect-[16/9] max-h-40 border-b border-border"
          aria-hidden="true"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-5">
        <div className="flex items-center gap-2">
          {/* Pas de majuscules ici : la marque s'ecrit n8n, jamais N8N. */}
          <span className="w-fit rounded-full border border-primary/30 px-2.5 py-[3px] font-mono text-[10px] tracking-[0.12em] text-primary">
            n8n
          </span>
          {automation.node_count !== null && (
            <span className="font-mono text-[11px] text-ink-faint">
              {automation.node_count} nodes
            </span>
          )}
        </div>

        <h3 className="line-clamp-2 font-display text-xl leading-tight font-semibold [overflow-wrap:anywhere] text-ink">
          {automation.name}
        </h3>

        {automation.summary && (
          <p className="line-clamp-3 text-[15px] font-medium [overflow-wrap:anywhere] text-ink">
            {automation.summary}
          </p>
        )}

        {automation.tools.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
            {automation.tools.slice(0, 4).map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
            {reste > 0 && (
              <span className="rounded border border-border/60 px-2 py-1 font-mono text-[10.5px] text-ink-faint">
                +{reste}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border/60 px-4 py-3.5">
        {workflow && (
          <button
            type="button"
            onClick={() => void copierWorkflow()}
            className="inline-flex min-h-10 items-center rounded-full bg-primary px-4 text-[13px] font-semibold text-background transition-colors hover:bg-primary-hover"
          >
            {etatCopie === "ok" ? "Copied, paste it in n8n" : "Copy workflow"}
          </button>
        )}

        <div className={`flex items-center gap-1.5 ${workflow ? "ml-auto" : ""}`}>
          {workflow && (
            <button
              type="button"
              onClick={telecharger}
              title="Download the workflow as .json"
              aria-label="Download the workflow as .json"
              className={classeBoutonIcone}
            >
              <IconeTelecharger className="h-4 w-4" />
            </button>
          )}
          {guide && (
            <a
              href={guide}
              target="_blank"
              rel="noopener noreferrer"
              title="Watch the walkthrough, opens in a new tab"
              aria-label="Watch the walkthrough, opens in a new tab"
              className={classeBoutonIcone}
            >
              <IconeJouer className="h-4 w-4" />
            </a>
          )}
          <button
            type="button"
            onClick={() => void partager()}
            title="Copy the direct link to this automation"
            aria-label={
              etatPartage === "ok" ? "Link copied" : "Copy the direct link to this automation"
            }
            className={classeBoutonIcone}
          >
            {etatPartage === "ok" ? (
              <IconeCheck className="h-4 w-4 text-primary" />
            ) : (
              <IconePartage className="h-4 w-4" />
            )}
          </button>
        </div>

        {etatCopie === "echec" && (
          <span className="basis-full font-mono text-[11px] text-primary">
            Copy blocked. Use Download instead.
          </span>
        )}
        {etatPartage === "echec" && (
          <span className="basis-full font-mono text-[11px] text-primary">
            Link copy blocked by your browser.
          </span>
        )}
      </div>
    </article>
  );
}

function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="h-40 bg-surface-raised" />
      <div className="grid gap-3 p-5">
        <div className="h-3 w-16 rounded bg-surface-raised" />
        <div className="h-5 w-2/3 rounded bg-surface-raised" />
        <div className="h-4 w-1/2 rounded bg-surface-raised" />
      </div>
    </div>
  );
}

export default function AutomationsSection() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [automations, setAutomations] = useState<PortfolioAutomation[]>([]);
  const [promue, setPromue] = useState<string | null>(null);
  const [catalogueOuvert, setCatalogueOuvert] = useState(false);
  const fermerCatalogue = useCallback(() => setCatalogueOuvert(false), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/automations");
        if (!res.ok) throw new Error("bad_status");
        const data = (await res.json()) as { automations?: PortfolioAutomation[] };
        if (cancelled) return;
        setAutomations(data.automations ?? []);
        // Pose dans le meme lot que la liste : le premier rendu affiche donc
        // deja la carte visee, et l'effet d'ancrage la trouve du premier coup.
        setPromue(cleDeLAncre());
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibles = useMemo(
    () => promouvoir(automations, promue, MAX_CARTES).slice(0, MAX_CARTES),
    [automations, promue]
  );

  // Lien direct vers un scenario, du type /portfolio#a-invoice-reminder, envoye
  // dans une candidature. Le navigateur ne peut pas resoudre l'ancre tout seul :
  // au moment ou il lit l'URL la liste n'est pas chargee et la carte n'existe
  // pas. On descend donc nous-memes, une fois le rendu fait.
  useEffect(() => {
    if (status !== "ready" || !promue) return;
    if (!automations.some((a) => ancre(a) === promue)) return;
    const carte = document.getElementById(`a-${promue}`);
    if (!carte) return;

    const anime = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    carte.scrollIntoView({ behavior: anime ? "smooth" : "auto", block: "center" });

    // L'eclat attend que la carte soit arrivee au centre. Un defilement fluide
    // dure plus longtemps que l'animation, et elle serait deja eteinte a
    // l'arrivee. La marge negative reduit la zone de detection a la bande
    // centrale, ce qui reste vrai meme si la carte depasse la hauteur de l'ecran.
    let t = 0;
    const vue = new IntersectionObserver(
      (entrees) => {
        if (!entrees.some((e) => e.isIntersecting)) return;
        vue.disconnect();
        carte.classList.add("pf-flash");
        t = window.setTimeout(() => carte.classList.remove("pf-flash"), 2600);
      },
      { rootMargin: "-25% 0px -25% 0px" }
    );
    vue.observe(carte);

    return () => {
      vue.disconnect();
      if (t) clearTimeout(t);
      carte.classList.remove("pf-flash");
    };
  }, [status, promue, automations]);

  // Rien de publie, rien a montrer : la section disparait plutot que d'afficher
  // un bloc vide sur une page destinee a convaincre.
  if (status === "ready" && automations.length === 0) return null;
  if (status === "error") return null;

  return (
    <section className="mx-auto max-w-[1180px] px-5 pt-11 sm:px-8 sm:pt-16">
      <h2 className="pb-2 font-display text-[clamp(1.625rem,6.4vw,2.125rem)] font-semibold text-ink">
        Automations you can take
      </h2>
      <p className="pb-5.5 max-w-[52ch] text-sm text-ink-soft">
        Simplified from real client builds. Copy, paste in your n8n, run. No sign up.
      </p>
      <div className="pf-rule mb-7" />

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {status === "loading" ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          visibles.map((a) => <AutomationCard key={a.id} automation={a} />)
        )}
      </div>

      {status === "ready" && automations.length > MAX_CARTES && (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setCatalogueOuvert(true)}
              aria-haspopup="dialog"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-primary/40 bg-surface px-5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-background sm:w-auto"
            >
              <IconeLoupe className="h-4 w-4" />
              Browse all {automations.length} automations
            </button>
            <p className="text-xs text-ink-soft">
              Search by tool, filter, and grab any of them.
            </p>
          </div>

          <AutomationsCatalog
            automations={automations}
            open={catalogueOuvert}
            onClose={fermerCatalogue}
          />
        </>
      )}
    </section>
  );
}
