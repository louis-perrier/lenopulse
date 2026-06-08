import type { Dictionary } from "@/lib/i18n/types";
import Reveal from "./Reveal";

export default function Process({ dict }: { dict: Dictionary }) {
  const p = dict.process;

  return (
    <section id="process" className="relative border-t border-border/60 bg-surface/40">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <Reveal className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
            {p.title}
          </h2>
          <p className="mt-4 text-lg text-ink-soft">{p.subtitle}</p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {p.steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1}>
              <article className="relative h-full rounded-2xl border border-border bg-surface p-7">
                <span className="font-display text-5xl font-semibold text-gradient-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 text-xl font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {step.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
