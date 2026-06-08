import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="font-display text-6xl font-semibold text-gradient-gold">404</span>
      <p className="mt-4 text-ink-soft">Cette page n&apos;existe pas.</p>
      <Link
        href="/fr/"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-primary-hover"
      >
        LOUAI
      </Link>
    </main>
  );
}
