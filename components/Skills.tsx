import type { Dictionary } from "@/lib/i18n/types";
import Reveal from "./Reveal";
import { IconGlobe, IconLayers, IconBolt, IconCode } from "./Icons";

const icons = [IconGlobe, IconLayers, IconBolt, IconCode];

export default function Skills({ dict }: { dict: Dictionary }) {
  const s = dict.skills;

  return (
    <section id="expertise" className="relative border-t border-border/60">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <Reveal className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
            {s.title}
          </h2>
          <p className="mt-4 text-lg text-ink-soft">{s.subtitle}</p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {s.items.map((item, i) => {
            const Icon = icons[i] ?? IconGlobe;
            return (
              <Reveal key={item.title} delay={i * 0.07}>
                <article className="card-hairline group h-full rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-border-strong">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border-strong bg-surface-raised text-primary transition-colors group-hover:bg-primary group-hover:text-background">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {item.description}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
