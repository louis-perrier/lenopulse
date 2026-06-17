"use client";

import { useEffect, useMemo, useState } from "react";
import { IconArrow, IconCheck } from "./Icons";

// Vue admin reservee a Louis. Textes en francais en dur : outil interne, hors du
// systeme i18n du site public. Lit /api/admin-bookings (protege par cookie signe).

interface Brief {
  problem?: string;
  target?: string;
  scope?: string;
  budget?: string;
  timeline?: string;
  nextStep?: string;
}

interface SessionEmbed {
  brief: Brief | null;
  visitor_email: string | null;
  locale: string | null;
}

interface Booking {
  id: string;
  created_at: string;
  attendee_name: string | null;
  attendee_email: string | null;
  start_time: string | null;
  end_time: string | null;
  status: string;
  meeting_url: string | null;
  location: string | null;
  session: SessionEmbed | null;
}

interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  brief: Brief | null;
  visitor_email: string | null;
  locale: string | null;
  status: string;
}

const BRIEF_LABELS: { key: keyof Brief; label: string }[] = [
  { key: "problem", label: "Problème" },
  { key: "target", label: "Cible" },
  { key: "scope", label: "Solution envisagée" },
  { key: "budget", label: "Budget" },
  { key: "timeline", label: "Délai" },
  { key: "nextStep", label: "Prochaine étape" },
];

const LOCALE_LABELS: Record<string, string> = { fr: "FR", en: "EN", es: "ES" };

function localeLabel(locale: string | null): string {
  if (!locale) return "FR";
  return LOCALE_LABELS[locale] ?? locale.toUpperCase();
}

function normEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const e = email.trim().toLowerCase();
  return e || null;
}

// Email de reference d'une reservation : celui saisi dans Cal.com en priorite,
// sinon celui de la session liee (le visiteur a pu changer d'email en reservant).
function bookingEmail(b: Booking): string | null {
  return normEmail(b.attendee_email) ?? normEmail(b.session?.visitor_email ?? null);
}

function formatDate(iso: string | null): string {
  if (!iso) return "Date à confirmer";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(d);
}

// Sans date connue, on considere le rendez-vous comme a venir (a ne pas perdre).
function isPast(iso: string | null): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return t < Date.now();
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "warn" | "primary";
}) {
  const tones: Record<string, string> = {
    neutral: "border-border text-ink-faint",
    warn: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    primary: "border-primary/40 bg-primary/10 text-primary",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function Stat({
  value,
  label,
  highlight = false,
}: {
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface px-2 py-3">
      <p
        className={`font-display text-2xl font-semibold ${
          highlight && value > 0 ? "text-amber-300" : "text-ink"
        }`}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs text-ink-faint">{label}</p>
    </div>
  );
}

function BriefView({ brief }: { brief: Brief | null }) {
  const rows = brief ? BRIEF_LABELS.filter((r) => brief[r.key]) : [];
  if (rows.length === 0) {
    return <p className="text-sm text-ink-faint">Aucun brief associé.</p>;
  }
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {rows.map((r) => (
        <div key={r.key}>
          <dt className="text-xs font-medium uppercase tracking-wider text-ink-faint">
            {r.label}
          </dt>
          <dd className="mt-1 text-sm text-ink">{brief![r.key]}</dd>
        </div>
      ))}
    </dl>
  );
}

// Brief replie par defaut (cartes plus aerees), depliable au clic.
function CollapsibleBrief({ brief }: { brief: Brief | null }) {
  const count = brief ? BRIEF_LABELS.filter((r) => brief[r.key]).length : 0;
  return (
    <details className="group mt-5 border-t border-border pt-4">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-ink-soft transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
        <IconArrow className="h-4 w-4 transition-transform group-open:rotate-90" />
        {count > 0 ? `Voir le brief (${count})` : "Aucun brief associé"}
      </summary>
      <div className="mt-4">
        <BriefView brief={brief} />
      </div>
    </details>
  );
}

function BookingCard({
  booking,
  duplicate,
  joinable,
}: {
  booking: Booking;
  duplicate: boolean;
  joinable: boolean;
}) {
  return (
    <article
      className={`rounded-2xl border bg-surface-raised p-6 ${
        duplicate ? "border-amber-500/40 ring-1 ring-amber-500/20" : "border-border-strong"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-lg font-semibold text-ink">
              {formatDate(booking.start_time)}
            </p>
            <Badge>{localeLabel(booking.session?.locale ?? null)}</Badge>
            {booking.status === "rescheduled" && <Badge tone="primary">Reporté</Badge>}
            {duplicate && <Badge tone="warn">Doublon</Badge>}
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            {booking.attendee_name || "Sans nom"}
            {booking.attendee_email && (
              <>
                {" "}
                <a
                  href={`mailto:${booking.attendee_email}`}
                  className="text-primary underline-offset-2 hover:underline"
                >
                  {booking.attendee_email}
                </a>
              </>
            )}
          </p>
        </div>
        {joinable && booking.meeting_url && (
          <a
            href={booking.meeting_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-primary-hover"
          >
            Rejoindre l'appel
            <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        )}
      </div>
      <CollapsibleBrief brief={booking.session?.brief ?? null} />
    </article>
  );
}

function LeadCard({ lead, duplicate }: { lead: Lead; duplicate: boolean }) {
  return (
    <article
      className={`rounded-2xl border bg-surface p-6 ${
        duplicate ? "border-amber-500/40 ring-1 ring-amber-500/20" : "border-border"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-ink-soft">Cadré le {formatDate(lead.updated_at)}</p>
        <Badge>{localeLabel(lead.locale)}</Badge>
        {duplicate && <Badge tone="warn">Doublon</Badge>}
      </div>
      {lead.visitor_email && (
        <p className="mt-1 text-sm">
          <a
            href={`mailto:${lead.visitor_email}`}
            className="text-primary underline-offset-2 hover:underline"
          >
            {lead.visitor_email}
          </a>
        </p>
      )}
      <CollapsibleBrief brief={lead.brief} />
    </article>
  );
}

export default function AdminDashboard() {
  const [view, setView] = useState<"loading" | "login" | "ready">("loading");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  // Comptage des emails sur l'ensemble (RDV tous statuts + briefs sans RDV) pour
  // reperer les doublons : un meme email present plus d'une fois est signale.
  const emailCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of bookings) {
      const e = bookingEmail(b);
      if (e) m.set(e, (m.get(e) ?? 0) + 1);
    }
    for (const l of leads) {
      const e = normEmail(l.visitor_email);
      if (e) m.set(e, (m.get(e) ?? 0) + 1);
    }
    return m;
  }, [bookings, leads]);

  const duplicateCount = useMemo(
    () => Array.from(emailCounts.values()).filter((n) => n > 1).length,
    [emailCounts]
  );

  const loadData = async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/admin-bookings", { credentials: "same-origin" });
      if (res.status === 401) return false;
      if (!res.ok) {
        setError("Service indisponible. L'admin fonctionne une fois le site déployé.");
        return false;
      }
      const data = (await res.json()) as { bookings?: Booking[]; leads?: Lead[] };
      setBookings(data.bookings || []);
      setLeads(data.leads || []);
      return true;
    } catch {
      setError("Service indisponible. L'admin fonctionne une fois le site déployé.");
      return false;
    }
  };

  useEffect(() => {
    (async () => {
      const ok = await loadData();
      setView(ok ? "ready" : "login");
    })();
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });
      if (res.status === 401) {
        setError("Mot de passe incorrect.");
        return;
      }
      if (!res.ok) {
        setError("Service indisponible. L'admin fonctionne une fois le site déployé.");
        return;
      }
      setPassword("");
      const ok = await loadData();
      if (ok) setView("ready");
    } catch {
      setError("Service indisponible. L'admin fonctionne une fois le site déployé.");
    } finally {
      setSubmitting(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/admin-auth", { method: "DELETE", credentials: "same-origin" });
    } catch {
      // ignore
    }
    setBookings([]);
    setLeads([]);
    setView("login");
  };

  if (view === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="text-ink-soft">Chargement...</p>
      </main>
    );
  }

  if (view === "login") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <form
          onSubmit={login}
          className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8"
        >
          <h1 className="font-display text-2xl font-semibold text-ink">Espace admin</h1>
          <p className="mt-2 text-sm text-ink-soft">Réservé à Louis.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            aria-label="Mot de passe"
            autoFocus
            className="mt-6 w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-ink placeholder:text-ink-faint transition-colors focus:border-primary"
          />
          <button
            type="submit"
            disabled={submitting || !password}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-background transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Connexion..." : "Se connecter"}
          </button>
          {error && <p className="mt-4 text-center text-sm text-primary">{error}</p>}
        </form>
      </main>
    );
  }

  const isDup = (email: string | null): boolean =>
    !!email && (emailCounts.get(email) ?? 0) > 1;

  const active = bookings.filter((b) => b.status !== "cancelled");
  const cancelled = bookings.filter((b) => b.status === "cancelled");
  const upcoming = active.filter((b) => !isPast(b.start_time));
  const past = [...active.filter((b) => isPast(b.start_time))].reverse(); // plus recents d'abord
  const nextBooking = upcoming[0] ?? null; // l'API trie par start_time croissant

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold text-ink">Vos appels</h1>
        <button
          type="button"
          onClick={logout}
          className="text-sm font-medium text-ink-soft underline-offset-2 transition-colors hover:text-primary hover:underline"
        >
          Déconnexion
        </button>
      </div>

      {/* Bandeau resume : prochain RDV + totaux */}
      <section className="mt-8 rounded-2xl border border-border-strong bg-surface-raised p-6">
        <div className="grid gap-6 sm:grid-cols-2 sm:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">
              Prochain rendez-vous
            </p>
            {nextBooking ? (
              <>
                <p className="mt-1 font-display text-lg font-semibold text-ink">
                  {formatDate(nextBooking.start_time)}
                </p>
                <p className="text-sm text-ink-soft">
                  {nextBooking.attendee_name || "Sans nom"}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-ink-soft">Aucun rendez-vous à venir.</p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat value={upcoming.length} label="À venir" />
            <Stat value={leads.length} label="Briefs en attente" />
            <Stat value={duplicateCount} label="Doublons" highlight />
          </div>
        </div>
        {duplicateCount > 0 && (
          <p className="mt-4 text-sm text-amber-300">
            {duplicateCount} contact{duplicateCount > 1 ? "s" : ""} apparai
            {duplicateCount > 1 ? "ssent" : "t"} plusieurs fois (marqué
            {duplicateCount > 1 ? "s" : ""} « Doublon » ci-dessous).
          </p>
        )}
      </section>

      {/* Rendez-vous a venir */}
      <section className="mt-10">
        <h2 className="text-sm font-medium uppercase tracking-wider text-primary">
          À venir ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">Aucun rendez-vous à venir.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {upcoming.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                duplicate={isDup(bookingEmail(b))}
                joinable
              />
            ))}
          </div>
        )}
      </section>

      {/* Rendez-vous passes */}
      {past.length > 0 && (
        <section className="mt-12">
          <h2 className="text-sm font-medium uppercase tracking-wider text-ink-soft">
            Passés ({past.length})
          </h2>
          <div className="mt-4 space-y-4">
            {past.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                duplicate={isDup(bookingEmail(b))}
                joinable={false}
              />
            ))}
          </div>
        </section>
      )}

      {/* Briefs sans reservation (leads a relancer) */}
      <section className="mt-12">
        <h2 className="text-sm font-medium uppercase tracking-wider text-primary">
          Briefs sans rendez-vous ({leads.length})
        </h2>
        {leads.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">Aucun brief en attente.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {leads.map((l) => (
              <LeadCard key={l.id} lead={l} duplicate={isDup(normEmail(l.visitor_email))} />
            ))}
          </div>
        )}
      </section>

      {/* Rendez-vous annules */}
      {cancelled.length > 0 && (
        <section className="mt-12">
          <h2 className="text-sm font-medium uppercase tracking-wider text-ink-faint">
            Annulés ({cancelled.length})
          </h2>
          <div className="mt-4 space-y-3">
            {cancelled.map((b) => (
              <article
                key={b.id}
                className="rounded-xl border border-border bg-surface px-5 py-4 text-sm text-ink-soft"
              >
                <span className="inline-flex items-center gap-2">
                  <IconCheck className="h-4 w-4 opacity-40" />
                  {formatDate(b.start_time)} . {b.attendee_name || "Sans nom"}
                </span>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
