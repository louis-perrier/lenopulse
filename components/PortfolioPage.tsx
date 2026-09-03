"use client";

import { useCallback, useEffect, useState } from "react";
import { portfolioConfig as cfg, type PortfolioProject } from "@/lib/portfolio";
import AutomationsSection from "./AutomationsSection";

// Groupe de capacites tel que renvoye par /api/portfolio. La liste vit dans
// app_config et s'edite depuis /admin ; en son absence, on retombe sur celle
// ecrite dans lib/portfolio.ts.
interface CapabilityGroup {
  group: string;
  items: readonly string[];
}

// Page exportee en statique : les projets se chargent cote navigateur, d'ou les
// etats vide, en cours et en erreur affiches explicitement.

// petits blocs

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="max-w-full truncate rounded border border-border bg-surface px-2 py-1 font-mono text-[10.5px] text-ink-soft">
      {children}
    </span>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">
      {children}
    </span>
  );
}

// Rapport 16/9 impose : c'est celui des captures, un cadre carre les rognerait.
// Les grandes tuiles passent en deux colonnes a partir de 1024 px.
function Shot({
  project,
  wide,
  inverse,
}: {
  project: PortfolioProject;
  wide: boolean;
  inverse: boolean;
}) {
  // Une capture garde son 16/9 natif. Un logo ou un motif n'ont pas d'information
  // a montrer sur cette hauteur : leur cadre est plus bas, ce qui evite un grand
  // vide et laisse la vedette aux vraies captures.
  const ratio = project.image_kind === "image" && project.image_url
    ? "aspect-[16/9]"
    : "aspect-[16/9] sm:aspect-[21/9]";

  // Grande tuile : l'image se place a droite ou a gauche selon l'alternance, et
  // le filet de separation change de cote avec elle.
  const place = inverse
    ? "lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:aspect-[16/9] lg:border-b-0 lg:border-r"
    : "lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:aspect-[16/9] lg:border-b-0 lg:border-l";

  const box = wide ? `${ratio} ${place}` : ratio;

  if (project.image_url && project.image_kind === "logo") {
    return (
      <div
        className={`${box} flex items-center justify-center overflow-hidden border-b border-border bg-gradient-to-br from-[#1a1508] to-[#0f0f16] p-[12%]`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.image_url}
          alt={project.name}
          loading="lazy"
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  if (project.image_url) {
    return (
      <div className={`${box} overflow-hidden border-b border-border bg-surface`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.image_url}
          alt={`${project.name}, capture d'ecran`}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  return <div className={`${box} pf-abstract border-b border-border`} aria-hidden="true" />;
}

// carte projet

function ProjectCard({
  project,
  onOpen,
  inverse = false,
}: {
  project: PortfolioProject;
  onOpen: (p: PortfolioProject) => void;
  inverse?: boolean;
}) {
  const wide = project.span === "wide";

  return (
    <button
      type="button"
      onClick={() => onOpen(project)}
      aria-haspopup="dialog"
      className={`group card-hairline flex flex-col overflow-hidden rounded-2xl border border-border bg-surface text-left transition-transform duration-200 hover:-translate-y-0.5 ${
        wide
          ? inverse
            ? "lg:col-span-6 lg:grid lg:grid-cols-[55%_45%] lg:grid-rows-[1fr_auto]"
            : "lg:col-span-6 lg:grid lg:grid-cols-[45%_55%] lg:grid-rows-[1fr_auto]"
          : "lg:col-span-3"
      }`}
    >
      <Shot project={project} wide={wide} inverse={inverse} />

      <div
        className={`flex min-w-0 flex-1 flex-col gap-2.5 p-5 ${
          wide
            ? inverse
              ? "lg:col-start-2 lg:row-start-1"
              : "lg:col-start-1 lg:row-start-1"
            : ""
        }`}
      >
        {project.tag && (
          <span className="w-fit rounded-full border border-primary/30 px-2.5 py-[3px] font-mono text-[10px] uppercase tracking-[0.12em] text-primary">
            {project.tag}
          </span>
        )}

        <h3 className="line-clamp-2 font-display text-xl leading-tight font-semibold [overflow-wrap:anywhere] text-ink transition-colors group-hover:text-accent">
          {project.name}
        </h3>

        {project.line && (
          <p className="line-clamp-3 text-[15px] font-medium [overflow-wrap:anywhere] text-ink">{project.line}</p>
        )}

        {/* La colonne de texte des grandes tuiles serait vide aux deux tiers avec
            la seule accroche. Le probleme, deja saisi dans la fiche, la remplit et
            fait travailler la carte : l'acheteur se reconnait avant de lire la
            solution. */}
        {wide && project.problem && (
          <p className="hidden text-sm leading-relaxed text-ink-soft lg:line-clamp-4">
            {project.problem}
          </p>
        )}

        {project.stack.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
            {project.stack.slice(0, 5).map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>
        )}
      </div>

      <div
        className={`flex items-center justify-between gap-3 border-t border-border/60 px-5 py-3 font-mono text-[11.5px] text-ink-faint ${
          wide
            ? inverse
              ? "lg:col-start-2 lg:row-start-2"
              : "lg:col-start-1 lg:row-start-2"
            : ""
        }`}
      >
        <span className="truncate">
          {project.url ? project.url.replace(/^https?:\/\//, "") : "Case study"}
        </span>
        <span className="flex-none text-primary">Read it {"->"}</span>
      </div>
    </button>
  );
}

// fiche detaillee

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid min-w-0 gap-2">
      <Label>{label}</Label>
      <p className="text-[14.5px] leading-relaxed [overflow-wrap:anywhere] text-ink-soft">{children}</p>
    </div>
  );
}

function Sheet({
  project,
  onClose,
}: {
  project: PortfolioProject | null;
  onClose: () => void;
}) {
  const open = project !== null;

  // Fermeture au clavier et blocage du defilement de la page derriere la fiche.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
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
        role="dialog"
        aria-modal="true"
        aria-label={project?.name ?? "Project"}
        aria-hidden={!open}
        data-open={open}
        className="pf-sheet fixed inset-x-0 bottom-0 z-91 flex max-h-[92vh] flex-col overflow-hidden rounded-t-2xl border-t border-border bg-surface lg:inset-y-0 lg:right-0 lg:left-auto lg:max-h-none lg:w-[min(560px,92vw)] lg:rounded-none lg:border-t-0 lg:border-l"
      >
        <div className="flex flex-none items-center justify-between gap-3 border-b border-border/60 px-5 py-3.5 lg:px-8">
          <Label>{project?.tag ?? "Project"}</Label>
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 rounded-full border border-border px-4 font-mono text-xs text-ink-soft transition-colors hover:border-primary hover:text-accent"
          >
            Close
          </button>
        </div>

        {project && (
          <div className="grid min-w-0 gap-6 overflow-y-auto px-5 pt-5 pb-9 lg:px-8 lg:pt-7 lg:pb-11">
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-semibold [overflow-wrap:anywhere] text-ink lg:text-3xl">
                {project.name}
              </h2>
              {project.line && <p className="mt-2.5 text-base [overflow-wrap:anywhere] text-ink">{project.line}</p>}
            </div>

            {project.problem && <Block label="The problem">{project.problem}</Block>}
            {project.built && <Block label="What I built">{project.built}</Block>}
            {project.decisions && (
              <Block label="Decisions and trade-offs">{project.decisions}</Block>
            )}
            {project.result && <Block label="Result">{project.result}</Block>}
            {project.status && <Block label="Status">{project.status}</Block>}

            {project.stack.length > 0 && (
              <div className="grid min-w-0 gap-2">
                <Label>Stack</Label>
                <div className="flex flex-wrap gap-1.5">
                  {project.stack.map((s) => (
                    <Chip key={s}>{s}</Chip>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2.5">
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center rounded-full border border-border px-4 text-[13px] font-semibold text-ink transition-colors hover:border-primary hover:text-accent"
                >
                  Open the live site
                </a>
              )}
              <a
                href={cfg.upworkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center rounded-full bg-primary px-4 text-[13px] font-semibold text-background transition-colors hover:bg-primary-hover"
              >
                Hire me on Upwork
              </a>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

// squelettes

function CardSkeleton({ wide }: { wide: boolean }) {
  return (
    <div
      className={`animate-pulse overflow-hidden rounded-2xl border border-border bg-surface ${
        wide ? "lg:col-span-6" : "lg:col-span-3"
      }`}
    >
      <div className="aspect-[16/9] bg-surface-raised" />
      <div className="grid gap-3 p-5">
        <div className="h-3 w-20 rounded bg-surface-raised" />
        <div className="h-5 w-2/3 rounded bg-surface-raised" />
        <div className="h-4 w-1/2 rounded bg-surface-raised" />
      </div>
    </div>
  );
}

// page

export default function PortfolioPage() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [openProject, setOpenProject] = useState<PortfolioProject | null>(null);
  const [capabilities, setCapabilities] = useState<readonly CapabilityGroup[]>(
    cfg.capabilities
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/portfolio");
        if (!res.ok) throw new Error("bad_status");
        const data = (await res.json()) as {
          projects?: PortfolioProject[];
          capabilities?: CapabilityGroup[] | null;
        };
        if (cancelled) return;
        setProjects(data.projects ?? []);
        if (data.capabilities && data.capabilities.length > 0) {
          setCapabilities(data.capabilities);
        }
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const close = useCallback(() => setOpenProject(null), []);

  const also = projects.filter((p) => !p.featured);

  // Les grandes tuiles alternent le cote de leur image. Le rang ne compte que les
  // grandes tuiles : ce qui se trouve entre elles n'a aucune influence, et rien
  // n'est a regler dans l'admin.
  let rangGrande = 0;
  const featured = projects
    .filter((p) => p.featured)
    .map((p) => {
      const inverse = p.span === "wide" && rangGrande++ % 2 === 1;
      return { projet: p, inverse };
    });

  return (
    <main className="relative min-h-screen">
      <div className="grain" aria-hidden="true" />

      {/* Barre du haut. Le bouton reste accessible a tout moment. */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex min-h-15 max-w-[1180px] items-center justify-between gap-3 px-5 sm:px-8">
          <span className="flex items-baseline gap-2 font-mono text-xs tracking-[0.18em]">
            <b className="font-semibold text-ink">LENOPULSE</b>
            <span className="tracking-[0.1em] text-ink-faint">/ portfolio</span>
          </span>
          <a
            href={cfg.upworkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center rounded-full bg-primary px-4 text-[13px] font-semibold text-background transition-colors hover:bg-primary-hover"
          >
            Hire me on Upwork
          </a>
        </div>
      </header>

      {/* Hero. Une these courte, puis les faits utiles a un acheteur. */}
      <section className="relative overflow-hidden">
        <div
          className="glow-gold absolute -top-45 -left-40 h-115 w-115 rounded-full"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[1180px] px-5 pt-11 pb-12 sm:px-8 sm:pt-16 sm:pb-16">
          <p className="font-mono text-[11px] font-medium tracking-[0.14em] uppercase text-primary">
            {cfg.eyebrow}
          </p>

          <h1 className="mt-4.5 max-w-[15ch] font-display text-[clamp(2rem,8.6vw,4.125rem)] leading-[1.08] font-semibold tracking-tight text-ink">
            {cfg.titleStart}
            <span className="text-gradient-gold">{cfg.titleHighlight}</span>
          </h1>

          <p className="mt-4.5 max-w-[54ch] text-base text-ink-soft sm:text-[17px]">
            {cfg.subtitle}
          </p>

          <div className="mt-6.5 flex flex-wrap items-center gap-3">
            <a
              href={cfg.upworkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-background transition-colors hover:bg-primary-hover"
            >
              Hire me on Upwork
            </a>
            <a
              href={`mailto:${cfg.email}?subject=Project%20enquiry`}
              className="inline-flex min-h-11 items-center font-mono text-[13px] text-ink-soft transition-colors hover:text-accent"
            >
              {cfg.email}
            </a>
          </div>

          <ul className="mt-7.5 flex flex-wrap gap-x-6.5 gap-y-4.5 border-t border-border/60 pt-4">
            {cfg.facts.map((f) => (
              <li key={f.label} className="grid gap-1 font-mono text-[13px] text-ink">
                <Label>{f.label}</Label>
                <span>{f.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Projets mis en avant */}
      <section className="mx-auto max-w-[1180px] px-5 py-11 sm:px-8 sm:py-16">
        <h2 className="pb-5.5 font-display text-[clamp(1.625rem,6.4vw,2.125rem)] font-semibold text-ink">
          Selected work
        </h2>
        <div className="pf-rule mb-7" />

        {status === "loading" && (
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-6">
            <CardSkeleton wide />
            <CardSkeleton wide={false} />
            <CardSkeleton wide={false} />
            <CardSkeleton wide />
          </div>
        )}

        {status === "error" && (
          <p className="rounded-xl border border-border bg-surface px-5 py-4 text-sm text-ink-soft">
            Projects could not be loaded right now. Reload the page, or reach me
            directly at{" "}
            <a href={`mailto:${cfg.email}`} className="text-primary hover:underline">
              {cfg.email}
            </a>
            .
          </p>
        )}

        {status === "ready" && featured.length === 0 && (
          <p className="rounded-xl border border-border bg-surface px-5 py-4 text-sm text-ink-soft">
            No project published yet.
          </p>
        )}

        {status === "ready" && featured.length > 0 && (
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-6">
            {featured.map(({ projet, inverse }) => (
              <ProjectCard
                key={projet.id}
                project={projet}
                onOpen={setOpenProject}
                inverse={inverse}
              />
            ))}
          </div>
        )}
      </section>

      {/* Realisations secondaires */}
      {status === "ready" && also.length > 0 && (
        <section className="mx-auto max-w-[1180px] px-5 pb-11 sm:px-8 sm:pb-16">
          <h2 className="pb-5.5 font-display text-[clamp(1.625rem,6.4vw,2.125rem)] font-semibold text-ink">
            Also built
          </h2>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {also.map((p) => {
              const inner = (
                <>
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image_url}
                      alt=""
                      loading="lazy"
                      className={`h-12 w-16 flex-none rounded-lg border border-border ${
                        p.image_kind === "logo"
                          ? "bg-gradient-to-br from-[#1a1508] to-[#0f0f16] object-contain p-2"
                          : "object-cover"
                      }`}
                    />
                  ) : (
                    <div
                      className="pf-abstract h-12 w-16 flex-none rounded-lg border border-border"
                      aria-hidden="true"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-[15px] font-semibold text-ink">{p.name}</div>
                    {p.line && (
                      <div className="line-clamp-2 text-[13.5px] [overflow-wrap:anywhere] text-ink-soft">{p.line}</div>
                    )}
                  </div>
                  <div className="max-w-[8rem] truncate text-right font-mono text-[11px] text-ink-faint sm:max-w-[12rem]">
                    {p.url ? p.url.replace(/^https?:\/\//, "") : (p.tag ?? "")}
                  </div>
                </>
              );

              const classes =
                "grid min-h-11 grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-primary/40";

              return p.url ? (
                <a
                  key={p.id}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={classes}
                >
                  {inner}
                </a>
              ) : (
                <div key={p.id} className={classes}>
                  {inner}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Scenarios n8n a emporter. La section se charge seule et disparait si
          rien n'est publie. */}
      <AutomationsSection />

      {/* Capacites techniques. Seule section en rupture claire : elle casse le
          bloc sombre du bas de page, comme Process et A propos sur la home. Les
          tokens de couleur sont redefinis localement par .section-light, donc les
          utilitaires des enfants basculent tout seuls. */}
      <section className="section-light">
        <div className="mx-auto max-w-[1180px] px-5 py-11 sm:px-8 sm:py-16">
          <h2 className="pb-5.5 font-display text-[clamp(1.625rem,6.4vw,2.125rem)] font-semibold text-ink">
            Capabilities
          </h2>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((c) => (
              <div key={c.group} className="grid gap-2 bg-surface-raised p-4.5">
                <Label>{c.group}</Label>
                <div className="flex flex-wrap gap-1.5">
                  {c.items.map((i) => (
                    <Chip key={i}>{i}</Chip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methode et appel a l'action */}
      <section className="relative mx-auto max-w-[1180px] overflow-hidden px-5 py-11 sm:px-8 sm:py-16">
        <div
          className="glow-gold absolute -right-50 -bottom-75 h-130 w-130 rounded-full"
          aria-hidden="true"
        />
        <div className="relative">
          <h2 className="pb-5.5 font-display text-[clamp(1.625rem,6.4vw,2.125rem)] font-semibold text-ink">
            How I work
          </h2>

          {/* Methode a gauche, la personne a droite. Sans avis clients sur Upwork,
              un visage rassure plus qu'un visuel decoratif. */}
          <div className="mb-8.5 grid gap-7 lg:grid-cols-[1fr_20rem] lg:items-center lg:gap-12">
            <div className="grid gap-1">
              {cfg.steps.map((s, i) => (
                <div
                  key={s}
                  className="grid grid-cols-[26px_1fr] items-center gap-3 border-t border-border/60 py-3.5"
                >
                  <span className="font-mono text-xs text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[15px] font-medium text-ink">{s}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/louis.png"
                alt="Louis Perrier"
                loading="lazy"
                className="h-16 w-16 flex-none rounded-full border border-primary/30 object-cover"
              />
              <div>
                <div className="text-[15px] font-semibold text-ink">Louis Perrier</div>
                <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">
                  You talk to the person who writes the code. No agency, no account
                  manager.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-gradient-to-b from-surface-raised to-surface px-5 py-6.5 text-center sm:px-8 sm:py-10">
            <h2 className="font-display text-[clamp(1.5rem,6.2vw,2rem)] font-semibold text-ink">
              What&apos;s next?
            </h2>
            <div className="mt-5.5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={cfg.upworkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-background transition-colors hover:bg-primary-hover"
              >
                Hire me on Upwork
              </a>
              <a
                href={`mailto:${cfg.email}?subject=Project%20enquiry`}
                className="inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm font-semibold text-ink transition-colors hover:border-primary hover:text-accent"
              >
                Email me directly
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-[1180px] border-t border-border/60 px-5 pt-5.5 pb-8.5 font-mono text-[11.5px] leading-relaxed text-ink-faint sm:px-8">
        {cfg.footer.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </footer>

      <Sheet project={openProject} onClose={close} />
    </main>
  );
}
