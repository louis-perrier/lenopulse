import type { Dictionary } from "@/lib/i18n/types";
import Reveal from "./Reveal";

export default function Problem({ dict }: { dict: Dictionary }) {
  const p = dict.problem;

  return (
    <section id="problem" className="relative border-t border-border/60 bg-surface/40">
      <div className="mx-auto max-w-3xl px-6 py-24 sm:py-32">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
            {p.title}
          </h2>
          <p className="mt-5 text-lg text-ink-soft">{p.intro}</p>
        </Reveal>

        <ul className="mt-10 space-y-4">
          {p.points.map((point, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <li className="flex gap-4 rounded-xl border border-border bg-surface p-5">
                <span
                  aria-hidden
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                />
                <span className="text-ink-soft">{point}</span>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
