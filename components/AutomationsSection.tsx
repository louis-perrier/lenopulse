"use client";

import { useEffect, useState } from "react";
import type { PortfolioAutomation } from "@/lib/portfolio";

// Section Automations de /portfolio. Des scenarios n8n reels, que le visiteur
// emporte sans rien donner en echange : ni email, ni compte. C'est la preuve la
// plus directe de la specialite, et un decideur peut la verifier lui-meme en
// collant le workflow dans son instance.
//
// Le workflow arrive avec la liste (voir functions/api/automations.ts) pour que
// la copie reste synchrone au clic. Safari annule l'ecriture dans le
// presse-papier des qu'une requete reseau s'intercale entre le clic et la copie.

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="max-w-full truncate rounded border border-border bg-surface px-2 py-1 font-mono text-[10.5px] text-ink-soft">
      {children}
    </span>
  );
}

// "Invoice reminder" devient "invoice-reminder.json".
function fileName(name: string): string {
  const base =
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "workflow";
  return `${base}.json`;
}

// Cle de l'ancre dans l'URL. Le slug vient de la base et ne bouge plus une fois
// pose ; l'id ne sert que si une ligne ancienne n'en a pas encore.
function ancre(a: PortfolioAutomation): string {
  return a.slug ?? a.id;
}

function IconeExterne() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M4.5 1.5h6v6M10.5 1.5 5 7M9 8v2.5H1.5V3H4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AutomationCard({ automation }: { automation: PortfolioAutomation }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const workflow = automation.workflow_json;
  const guide = automation.guide_url;

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(t);
  }, [copied]);

  // Methode historique, utilisee quand l'API presse-papier est refusee : elle
  // couvre les navigateurs anciens et les pages servies hors HTTPS, ou
  // navigator.clipboard n'existe pas.
  const copieDeSecours = (texte: string): boolean => {
    const zone = document.createElement("textarea");
    zone.value = texte;
    zone.setAttribute("readonly", "");
    zone.style.position = "fixed";
    zone.style.top = "-1000px";
    document.body.appendChild(zone);
    zone.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    zone.remove();
    return ok;
  };

  const copy = async () => {
    if (!workflow) return;
    setFailed(false);
    try {
      await navigator.clipboard.writeText(workflow);
      setCopied(true);
      return;
    } catch {
      // On tente la methode historique avant d'abandonner.
    }
    if (copieDeSecours(workflow)) setCopied(true);
    else setFailed(true);
  };

  const download = () => {
    if (!workflow) return;
    const url = URL.createObjectURL(new Blob([workflow], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName(automation.name);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <article
      id={`a-${ancre(automation)}`}
      className="card-hairline flex scroll-mt-24 flex-col overflow-hidden rounded-2xl border border-border bg-surface"
    >
      {automation.image_url ? (
        <div className="aspect-[16/9] overflow-hidden border-b border-border bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={automation.image_url}
            alt={`${automation.name}, canvas n8n`}
            loading="lazy"
            className="h-full w-full object-cover object-top"
          />
        </div>
      ) : (
        <div className="pf-abstract aspect-[21/9] border-b border-border" aria-hidden="true" />
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

        {automation.description && (
          <p className="line-clamp-4 text-sm leading-relaxed [overflow-wrap:anywhere] text-ink-soft">
            {automation.description}
          </p>
        )}

        {automation.tools.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
            {automation.tools.slice(0, 6).map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
        )}
      </div>

      {(workflow || guide) && (
        <div className="flex flex-wrap items-center gap-2.5 border-t border-border/60 px-5 py-4">
          {workflow && (
            <>
              <button
                type="button"
                onClick={copy}
                className="inline-flex min-h-10 items-center rounded-full bg-primary px-4 text-[13px] font-semibold text-background transition-colors hover:bg-primary-hover"
              >
                {copied ? "Copied, paste it in n8n" : "Copy workflow"}
              </button>
              <button
                type="button"
                onClick={download}
                className="inline-flex min-h-10 items-center rounded-full border border-border px-4 text-[13px] font-semibold text-ink transition-colors hover:border-primary hover:text-accent"
              >
                Download .json
              </button>
            </>
          )}
          {failed && (
            <span className="font-mono text-[11px] text-primary">
              Copy blocked. Use Download instead.
            </span>
          )}
          {guide && (
            <a
              href={guide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:text-accent sm:ml-auto"
            >
              Watch the walkthrough
              <IconeExterne />
            </a>
          )}
        </div>
      )}
    </article>
  );
}

function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="aspect-[16/9] bg-surface-raised" />
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/automations");
        if (!res.ok) throw new Error("bad_status");
        const data = (await res.json()) as { automations?: PortfolioAutomation[] };
        if (cancelled) return;
        setAutomations(data.automations ?? []);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Lien direct vers un scenario, du type /portfolio#a-invoice-reminder, envoye
  // dans une candidature. Le navigateur ne peut pas resoudre l'ancre tout seul :
  // au moment ou il lit l'URL la liste n'est pas chargee et la carte n'existe
  // pas. On descend donc nous-memes, une fois le rendu fait.
  useEffect(() => {
    if (status !== "ready" || automations.length === 0) return;
    const brut = window.location.hash;
    if (!brut.startsWith("#a-")) return;
    const cle = decodeURIComponent(brut.slice(3));
    if (!automations.some((a) => ancre(a) === cle)) return;
    const carte = document.getElementById(`a-${cle}`);
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
  }, [status, automations]);

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

      <div className="grid gap-3.5 lg:grid-cols-2">
        {status === "loading" ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          automations.map((a) => <AutomationCard key={a.id} automation={a} />)
        )}
      </div>
    </section>
  );
}
