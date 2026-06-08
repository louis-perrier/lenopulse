import type { Dictionary } from "@/lib/i18n/types";
import Reveal from "./Reveal";

export default function About({ dict }: { dict: Dictionary }) {
  const a = dict.about;

  return (
    <section id="about" className="relative border-t border-border/60 bg-surface/40">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 sm:py-32 lg:grid-cols-2">
        <Reveal>
          {/* Placeholder de portrait. A remplacer par une vraie photo de Louis. */}
          <div className="card-hairline relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-linear-to-br from-[#221a09] to-[#0b0a07]">
            <div className="grain" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display text-7xl font-bold text-gradient-gold">
              L
            </span>
            <span className="absolute inset-0 ring-1 ring-inset ring-primary/10" />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
            {a.title}
          </h2>
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
    </section>
  );
}
