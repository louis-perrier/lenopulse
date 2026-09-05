"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PortfolioAutomation } from "@/lib/portfolio";
import type { TriAutomations } from "@/lib/automations";
import { construireIndex, facettesOutils, filtrerTrier } from "@/lib/automations";
import {
  IconeCheck,
  IconeCopie,
  IconeFermer,
  IconeJouer,
  IconeLoupe,
  IconePartage,
  IconeTelecharger,
  classeBoutonIcone,
  useAutomationActions,
} from "./AutomationActions";

// Catalogue complet des scenarios, ouvert depuis la grille de /portfolio quand
// elle ne montre plus tout. Des lignes et non des cartes : vingt cartes sont un
// mur, vingt lignes se parcourent.
//
// Le panneau reste monte une fois ouvert pour que recherche et filtres survivent
// a une fermeture, d'ou le inert qui le sort de la tabulation quand il est clos.

const PAR_PAGE = 20;
const FACETTES_VISIBLES = 8;

const SELECTEUR_FOCUS =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

function Vignette({ a }: { a: PortfolioAutomation }) {
  if (!a.image_url) {
    return (
      <div
        className="pf-abstract h-14 w-20 flex-none rounded-lg border border-border"
        aria-hidden="true"
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={a.image_url}
      alt=""
      loading="lazy"
      className="h-14 w-20 flex-none rounded-lg border border-border object-cover object-top"
    />
  );
}

function LigneCatalogue({ a }: { a: PortfolioAutomation }) {
  const { workflow, guide, etatCopie, etatPartage, copierWorkflow, telecharger, partager } =
    useAutomationActions(a);

  const reste = a.tools.length - 5;
  const echec = etatCopie === "echec" || etatPartage === "echec";

  return (
    <li className="grid grid-cols-[auto_1fr] items-start gap-3 rounded-xl border border-border bg-surface p-3 sm:grid-cols-[auto_1fr_auto]">
      <Vignette a={a} />

      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-[15px] font-semibold [overflow-wrap:anywhere] text-ink">
            {a.name}
          </span>
          {a.node_count !== null && (
            <span className="font-mono text-[11px] text-ink-faint">{a.node_count} nodes</span>
          )}
        </div>

        {a.summary && (
          <p className="mt-0.5 line-clamp-2 text-[13px] [overflow-wrap:anywhere] text-ink-soft">
            {a.summary}
          </p>
        )}

        {a.tools.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {a.tools.slice(0, 5).map((t) => (
              <span
                key={t}
                className="max-w-full truncate rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-ink-soft"
              >
                {t}
              </span>
            ))}
            {reste > 0 && (
              <span className="rounded border border-border/60 px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">
                +{reste}
              </span>
            )}
          </div>
        )}

        {echec && (
          <p className="mt-2 font-mono text-[11px] text-primary">
            Copy blocked by your browser. Use the download button.
          </p>
        )}
      </div>

      <div className="col-span-2 flex items-center gap-1.5 sm:col-span-1">
        {workflow && (
          <>
            <button
              type="button"
              onClick={() => void copierWorkflow()}
              title="Copy the workflow to the clipboard"
              aria-label={etatCopie === "ok" ? "Workflow copied" : "Copy the workflow"}
              className={classeBoutonIcone}
            >
              {etatCopie === "ok" ? (
                <IconeCheck className="h-4 w-4 text-primary" />
              ) : (
                <IconeCopie className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={telecharger}
              title="Download the workflow as .json"
              aria-label="Download the workflow as .json"
              className={classeBoutonIcone}
            >
              <IconeTelecharger className="h-4 w-4" />
            </button>
          </>
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
    </li>
  );
}

function PastilleFiltre({
  actif,
  onClick,
  disabled,
  children,
}: {
  actif: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={actif}
      className={`inline-flex min-h-9 items-center rounded-full border px-3 text-[12.5px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        actif
          ? "border-primary/40 bg-primary/15 text-primary"
          : "border-border text-ink-soft hover:border-primary/40 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export default function AutomationsCatalog({
  automations,
  open,
  onClose,
}: {
  automations: PortfolioAutomation[];
  open: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [outils, setOutils] = useState<string[]>([]);
  const [avecDemo, setAvecDemo] = useState(false);
  const [avecWorkflow, setAvecWorkflow] = useState(false);
  const [tri, setTri] = useState<TriAutomations>("position");
  const [page, setPage] = useState(0);
  const [toutesFacettes, setToutesFacettes] = useState(false);

  const panneau = useRef<HTMLElement>(null);
  const champ = useRef<HTMLInputElement>(null);
  const zone = useRef<HTMLDivElement>(null);

  const index = useMemo(() => construireIndex(automations), [automations]);

  const filtrees = useMemo(
    () => filtrerTrier(automations, { q, outils, avecDemo, avecWorkflow, tri }, index),
    [automations, q, outils, avecDemo, avecWorkflow, tri, index]
  );

  // Comptes calcules sur ce que les autres criteres laissent passer : une
  // combinaison qui ne donnerait rien est desactivee avant d'etre cliquable.
  // Un outil present partout ne separe rien, il prend juste la premiere place.
  const facettes = useMemo(() => {
    const dispo = new Map(
      facettesOutils(filtrees).map((f) => [f.nom, f.n] as [string, number])
    );
    return facettesOutils(automations)
      .filter((f) => f.n < automations.length)
      .map((f) => ({ ...f, dispo: dispo.get(f.nom) ?? 0 }));
  }, [automations, filtrees]);

  const cochees = facettes.filter((f) => outils.includes(f.nom));
  const autres = facettes.filter((f) => !outils.includes(f.nom));
  const visiblesFacettes = toutesFacettes ? autres : autres.slice(0, FACETTES_VISIBLES);
  const cacheesFacettes = autres.length - visiblesFacettes.length;

  const total = filtrees.length;
  const pages = Math.max(1, Math.ceil(total / PAR_PAGE));
  const pageSure = Math.min(page, pages - 1);
  const tranche = filtrees.slice(pageSure * PAR_PAGE, pageSure * PAR_PAGE + PAR_PAGE);
  const filtreActif = q !== "" || outils.length > 0 || avecDemo || avecWorkflow;

  const remonter = () => zone.current?.scrollTo({ top: 0 });

  const changerQ = (v: string) => {
    setQ(v);
    setPage(0);
    remonter();
  };
  const basculerOutil = (nom: string) => {
    setOutils((p) => (p.includes(nom) ? p.filter((o) => o !== nom) : [...p, nom]));
    setPage(0);
    remonter();
  };
  const basculerDemo = () => {
    setAvecDemo((p) => !p);
    setPage(0);
    remonter();
  };
  const basculerWorkflow = () => {
    setAvecWorkflow((p) => !p);
    setPage(0);
    remonter();
  };
  const changerTri = (v: TriAutomations) => {
    setTri(v);
    setPage(0);
    remonter();
  };
  const toutEffacer = () => {
    setQ("");
    setOutils([]);
    setAvecDemo(false);
    setAvecWorkflow(false);
    setPage(0);
    remonter();
    champ.current?.focus();
  };
  const allerPage = (n: number) => {
    setPage(n);
    remonter();
  };

  // Echap, verrou du defilement de la page, et piege a focus : le panneau reste
  // dans le DOM une fois ouvert, rien ne l'en sortirait tout seul.
  useEffect(() => {
    if (!open) return;
    const precedent = document.activeElement as HTMLElement | null;
    champ.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panneau.current) return;
      const cibles = [...panneau.current.querySelectorAll<HTMLElement>(SELECTEUR_FOCUS)];
      if (cibles.length === 0) return;
      const premier = cibles[0];
      const dernier = cibles[cibles.length - 1];
      if (!e.shiftKey && document.activeElement === dernier) {
        e.preventDefault();
        premier.focus();
      } else if (e.shiftKey && document.activeElement === premier) {
        e.preventDefault();
        dernier.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const precedentOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = precedentOverflow;
      precedent?.focus();
    };
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-90 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        ref={panneau}
        role="dialog"
        aria-modal="true"
        aria-label="All automations"
        inert={!open}
        data-open={open}
        className="pf-sheet fixed inset-x-0 bottom-0 z-91 flex max-h-[92vh] flex-col overflow-hidden rounded-t-2xl border-t border-border bg-surface lg:inset-y-0 lg:right-0 lg:left-auto lg:max-h-none lg:w-[min(920px,96vw)] lg:rounded-none lg:border-t-0 lg:border-l"
      >
        <header className="flex flex-none items-center justify-between gap-3 border-b border-border/60 px-4 py-3.5 sm:px-6">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-ink">All automations</h2>
            <p className="text-xs text-ink-soft">
              Copy the workflow, download it, or send someone the direct link.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close the catalog"
            className={`${classeBoutonIcone} flex-none`}
          >
            <IconeFermer className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-none border-b border-border/60 px-4 py-3.5 sm:px-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-52 flex-1">
              <IconeLoupe className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input
                ref={champ}
                type="text"
                value={q}
                onChange={(e) => changerQ(e.target.value)}
                aria-label="Search automations"
                placeholder="Search name, summary, tools"
                className="min-h-11 w-full rounded-full border border-border bg-surface-muted pr-4 pl-10 text-sm text-ink transition-colors placeholder:text-ink-faint focus:border-primary"
              />
            </div>

            <select
              value={tri}
              onChange={(e) => changerTri(e.target.value as TriAutomations)}
              aria-label="Sort automations"
              className="min-h-11 rounded-full border border-border bg-surface-muted px-3 text-sm text-ink transition-colors [color-scheme:dark] focus:border-primary"
            >
              <option value="position">Curated order</option>
              <option value="az">A to Z</option>
              <option value="noeuds">Most nodes</option>
            </select>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <PastilleFiltre actif={avecDemo} onClick={basculerDemo}>
              With walkthrough
            </PastilleFiltre>
            <PastilleFiltre actif={avecWorkflow} onClick={basculerWorkflow}>
              Downloadable
            </PastilleFiltre>
          </div>

          {facettes.length > 0 && (
            <div
              className={`mt-2.5 flex flex-wrap gap-2 ${
                toutesFacettes ? "max-h-32 overflow-y-auto" : ""
              }`}
            >
              {[...cochees, ...visiblesFacettes].map((f) => (
                <PastilleFiltre
                  key={f.nom}
                  actif={outils.includes(f.nom)}
                  disabled={f.dispo === 0 && !outils.includes(f.nom)}
                  onClick={() => basculerOutil(f.nom)}
                >
                  <span className="max-w-40 truncate">{f.nom}</span>
                  <span className="ml-1.5 font-mono text-[10.5px] opacity-70">{f.dispo}</span>
                </PastilleFiltre>
              ))}
              {(cacheesFacettes > 0 || toutesFacettes) && (
                <button
                  type="button"
                  onClick={() => setToutesFacettes((p) => !p)}
                  className="min-h-9 text-[12.5px] font-medium text-ink-soft underline-offset-2 transition-colors hover:text-primary hover:underline"
                >
                  {toutesFacettes ? "Show fewer tools" : `+${cacheesFacettes} more tools`}
                </button>
              )}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p aria-live="polite" className="font-mono text-[11.5px] text-ink-faint">
              {total} result{total === 1 ? "" : "s"}
            </p>
            {filtreActif && (
              <button
                type="button"
                onClick={toutEffacer}
                className="text-[12px] font-medium text-primary underline-offset-2 transition-colors hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div ref={zone} className="min-h-0 flex-1 overflow-y-auto px-4 py-3.5 sm:px-6">
          {tranche.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-soft">
              No automation matches these filters.
            </p>
          ) : (
            <ul className="space-y-2">
              {tranche.map((a) => (
                <LigneCatalogue key={a.id} a={a} />
              ))}
            </ul>
          )}
        </div>

        <footer className="flex flex-none flex-wrap items-center justify-between gap-3 border-t border-border/60 px-4 py-3 sm:px-6">
          <span className="font-mono text-[11.5px] text-ink-faint">
            {total === 0
              ? "Nothing to show"
              : `${pageSure * PAR_PAGE + 1}-${Math.min(total, (pageSure + 1) * PAR_PAGE)} of ${total}`}
          </span>
          {pages > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => allerPage(pageSure - 1)}
                disabled={pageSure === 0}
                className="min-h-10 rounded-full border border-border px-4 text-[13px] font-medium text-ink transition-colors hover:border-primary hover:text-primary disabled:opacity-30"
              >
                Previous
              </button>
              <span className="font-mono text-[11.5px] text-ink-faint">
                {pageSure + 1} / {pages}
              </span>
              <button
                type="button"
                onClick={() => allerPage(pageSure + 1)}
                disabled={pageSure >= pages - 1}
                className="min-h-10 rounded-full border border-border px-4 text-[13px] font-medium text-ink transition-colors hover:border-primary hover:text-primary disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </footer>
      </aside>
    </>
  );
}
