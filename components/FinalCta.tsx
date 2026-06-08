import type { Dictionary } from "@/lib/i18n/types";
import Reveal from "./Reveal";
import { IconArrow } from "./Icons";

export default function FinalCta({ dict }: { dict: Dictionary }) {
  const f = dict.finalCta;

  return (
    <section className="relative overflow-hidden border-t border-border/60">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="glow-gold absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="grain" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 py-28 text-center sm:py-36">
        <Reveal>
          <h2 className="mx-auto max-w-2xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
            {f.title}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft">{f.subtitle}</p>

          <div className="mt-10 flex justify-center">
            <a
              href="#contact"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-background transition-colors hover:bg-primary-hover"
            >
              {f.cta}
              <IconArrow className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          <p className="mt-6 text-sm text-ink-faint">{f.reassurance}</p>
        </Reveal>
      </div>
    </section>
  );
}
