"use client";

import { useEffect, useState } from "react";
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

function BriefView({ brief }: { brief: Brief | null }) {
  if (!brief) {
    return <p className="text-sm text-ink-faint">Aucun brief associé.</p>;
  }
  const rows = BRIEF_LABELS.filter((r) => brief[r.key]);
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
          <dd className="mt-1 text-sm text-ink">{brief[r.key]}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function AdminDashboard() {
  const [view, setView] = useState<"loading" | "login" | "ready">("loading");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

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

  const activeBookings = bookings.filter((b) => b.status !== "cancelled");
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

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

      {/* Appels a venir / confirmes */}
      <section className="mt-10">
        <h2 className="text-sm font-medium uppercase tracking-wider text-primary">
          Rendez-vous ({activeBookings.length})
        </h2>
        {activeBookings.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">Aucun rendez-vous pour le moment.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {activeBookings.map((b) => (
              <article
                key={b.id}
                className="rounded-2xl border border-border-strong bg-surface-raised p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold text-ink">
                      {formatDate(b.start_time)}
                    </p>
                    <p className="mt-1 text-sm text-ink-soft">
                      {b.attendee_name || "Sans nom"}
                      {b.attendee_email && (
                        <>
                          {" "}
                          <a
                            href={`mailto:${b.attendee_email}`}
                            className="text-primary underline-offset-2 hover:underline"
                          >
                            {b.attendee_email}
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                  {b.meeting_url && (
                    <a
                      href={b.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-primary-hover"
                    >
                      Rejoindre l'appel
                      <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  )}
                </div>
                <div className="mt-5 border-t border-border pt-5">
                  <BriefView brief={b.session?.brief ?? null} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

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
              <article key={l.id} className="rounded-2xl border border-border bg-surface p-6">
                <p className="text-sm text-ink-soft">Cadré le {formatDate(l.updated_at)}</p>
                <div className="mt-4">
                  <BriefView brief={l.brief} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Rendez-vous annules */}
      {cancelledBookings.length > 0 && (
        <section className="mt-12">
          <h2 className="text-sm font-medium uppercase tracking-wider text-ink-faint">
            Annulés ({cancelledBookings.length})
          </h2>
          <div className="mt-4 space-y-3">
            {cancelledBookings.map((b) => (
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
