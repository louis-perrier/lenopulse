import type { Dictionary } from "@/lib/i18n/types";

export default function Footer({ lang, dict }: { lang: string; dict: Dictionary }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <a
            href={`/${lang}/`}
            className="font-display text-xl font-semibold tracking-tight text-ink"
          >
            LENO<span className="text-gradient-gold">PULSE</span>
          </a>
          <p className="mt-2 max-w-xs text-sm text-ink-soft">{dict.footer.tagline}</p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <a
            href={`/${lang}/mentions-legales/`}
            className="text-ink-soft transition-colors hover:text-ink"
          >
            {dict.footer.legal}
          </a>
          <a
            href={`/${lang}/confidentialite/`}
            className="text-ink-soft transition-colors hover:text-ink"
          >
            {dict.footer.privacy}
          </a>
        </nav>
      </div>

      <div className="border-t border-border/40">
        <p className="mx-auto max-w-6xl px-6 py-5 text-xs text-ink-faint">
          {year} LENOPULSE. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
