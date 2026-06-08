import type { LegalPageContent } from "@/lib/legal";
import { IconArrow } from "./Icons";

export default function LegalPage({
  lang,
  content,
}: {
  lang: string;
  content: LegalPageContent;
}) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-28 sm:py-32">
      <a
        href={`/${lang}/`}
        className="inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-primary"
      >
        <IconArrow className="h-4 w-4 rotate-180" />
        {content.back}
      </a>

      <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {content.title}
      </h1>

      <p className="mt-4 rounded-xl border border-border-strong bg-surface px-4 py-3 text-sm text-ink-soft">
        {content.note}
      </p>

      <div className="mt-10 space-y-8">
        {content.blocks.map((block) => (
          <section key={block.heading}>
            <h2 className="text-lg font-semibold text-ink">{block.heading}</h2>
            <p className="mt-2 leading-relaxed text-ink-soft">{block.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
