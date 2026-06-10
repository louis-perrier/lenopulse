import Image from "next/image";
import type { Dictionary } from "@/lib/i18n/types";
import Reveal from "./Reveal";

export default function About({ dict }: { dict: Dictionary }) {
  const a = dict.about;

  return (
    <section id="about" className="relative border-t border-border/60 bg-surface/40">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 sm:py-32 lg:grid-cols-2">
        <Reveal>
          <div className="card-hairline relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-3xl border border-border">
            <Image
              src="/louis.png"
              alt={a.photoAlt}
              fill
              sizes="24rem"
              className="object-cover"
            />
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
