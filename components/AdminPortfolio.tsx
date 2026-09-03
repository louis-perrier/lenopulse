"use client";

import { useEffect, useState } from "react";

// Textes en francais en dur : outil interne, hors du systeme i18n du site public.
// Les projets sont rediges en anglais, la page /portfolio vise des clients Upwork.

// Un groupe de capacites techniques affiche sur la page /portfolio.
interface CapGroup {
  group: string;
  items: string[];
}

interface Project {
  id: string;
  position: number;
  published: boolean;
  featured: boolean;
  span: "wide" | "half";
  name: string;
  tag: string | null;
  line: string | null;
  stack: string[];
  url: string | null;
  image_url: string | null;
  image_kind: "image" | "logo" | "abstract";
  problem: string | null;
  built: string | null;
  decisions: string | null;
  result: string | null;
  status: string | null;
}

// Projet vierge, utilise a la creation.
const EMPTY: Project = {
  id: "",
  position: 0,
  published: false,
  featured: true,
  span: "half",
  name: "",
  tag: "",
  line: "",
  stack: [],
  url: "",
  image_url: "",
  image_kind: "image",
  problem: "",
  built: "",
  decisions: "",
  result: "",
  status: "",
};

const IMAGE_KIND_LABELS: { value: Project["image_kind"]; label: string; help: string }[] = [
  { value: "image", label: "Capture", help: "L'image remplit toute la tuile." },
  { value: "logo", label: "Logo", help: "Le logo est centre sur un fond dore." },
  { value: "abstract", label: "Motif", help: "Aucune image. Un motif dore est dessine." },
];

// champs de saisie

function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      {help && <span className="mt-0.5 block text-xs text-ink-faint">{help}</span>}
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-ink placeholder:text-ink-faint transition-colors focus:border-primary";

function Text({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
    />
  );
}

function Area({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} resize-y leading-relaxed`}
    />
  );
}

// Choix parmi deux ou trois options, affiche en boutons plutot qu'en menu
// deroulant : on voit toutes les possibilites d'un coup d'oeil.
function Choice<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`min-h-10 rounded-full border px-4 text-sm font-medium transition-colors ${
            value === o.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-ink-soft hover:border-primary/50"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// formulaire

function ProjectForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial: Project;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [p, setP] = useState<Project>(initial);
  const [stackText, setStackText] = useState(initial.stack.join(", "));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNew = !initial.id;
  const set = <K extends keyof Project>(key: K, value: Project[K]) =>
    setP((prev) => ({ ...prev, [key]: value }));

  const uploadImage = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin-portfolio-image", {
        method: "POST",
        credentials: "same-origin",
        body: form,
      });
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(
          data.error === "file_too_large"
            ? "Image trop lourde. Maximum 5 Mo."
            : data.error === "unsupported_type"
              ? "Format non accepte. Utilisez PNG, JPG, WebP, GIF ou SVG."
              : "L'envoi de l'image a echoue. Reessayez."
        );
        return;
      }
      set("image_url", data.url);
      if (p.image_kind === "abstract") set("image_kind", "image");
    } catch {
      setError("L'envoi de l'image a echoue. Reessayez.");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (saving) return;
    if (!p.name.trim()) {
      setError("Le nom du projet est obligatoire.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const body = {
        ...p,
        stack: stackText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const res = await fetch("/api/admin-portfolio", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setError("L'enregistrement a echoue. Reessayez.");
        return;
      }
      onSaved();
    } catch {
      setError("L'enregistrement a echoue. Reessayez.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-primary/40 bg-surface-raised p-6">
      <h3 className="font-display text-xl font-semibold [overflow-wrap:anywhere] text-ink">
        {isNew ? "Nouveau projet" : `Modifier ${initial.name}`}
      </h3>
      <p className="mt-1 text-sm text-ink-soft">
        Les textes s&apos;affichent tels quels sur la page, en anglais.
      </p>

      <div className="mt-6 grid gap-5">
        <Field label="Nom du projet" help="Affiche en titre de la tuile.">
          <Text
            value={p.name}
            onChange={(v) => set("name", v)}
            placeholder="Hotel voice receptionist"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Etiquette" help="Categorie courte, en haut de la tuile.">
            <Text value={p.tag ?? ""} onChange={(v) => set("tag", v)} placeholder="Voice AI" />
          </Field>
          <Field label="Lien vers le site" help="Laissez vide s'il n'y a rien de public.">
            <Text
              value={p.url ?? ""}
              onChange={(v) => set("url", v)}
              placeholder="https://exemple.com"
            />
          </Field>
        </div>

        <Field label="Accroche" help="Une phrase, ce que le projet fait concretement.">
          <Text
            value={p.line ?? ""}
            onChange={(v) => set("line", v)}
            placeholder="Answers real inbound calls, day and night."
          />
        </Field>

        <Field label="Technologies" help="Separees par des virgules. Les 5 premieres sont affichees sur la tuile.">
          <Text
            value={stackText}
            onChange={setStackText}
            placeholder="Next.js, Supabase, Python"
          />
        </Field>

        {/* Visuel */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-sm font-medium text-ink">Visuel</p>

          {p.image_url ? (
            <div className="mt-3 flex flex-wrap items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image_url}
                alt="Apercu du visuel"
                className="h-20 w-32 rounded-lg border border-border object-cover"
              />
              <button
                type="button"
                onClick={() => set("image_url", "")}
                className="min-h-10 rounded-full border border-border px-4 text-sm text-ink-soft transition-colors hover:border-primary hover:text-primary"
              >
                Retirer l&apos;image
              </button>
            </div>
          ) : (
            <p className="mt-2 text-xs text-ink-faint">
              Aucune image. Un motif dore sera dessine a la place.
            </p>
          )}

          <div className="mt-4">
            <label className="inline-flex min-h-10 cursor-pointer items-center rounded-full border border-border px-4 text-sm font-medium text-ink transition-colors hover:border-primary hover:text-primary">
              {uploading ? "Envoi en cours..." : "Choisir une image"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadImage(f);
                  e.target.value = "";
                }}
              />
            </label>
            <span className="ml-3 text-xs text-ink-faint">PNG, JPG, WebP, GIF ou SVG. 5 Mo maximum.</span>
          </div>

          <div className="mt-5">
            <span className="text-sm font-medium text-ink">Cadrage</span>
            <div className="mt-2">
              <Choice
                value={p.image_kind}
                onChange={(v) => set("image_kind", v)}
                options={IMAGE_KIND_LABELS.map((k) => ({ value: k.value, label: k.label }))}
              />
            </div>
            <p className="mt-2 text-xs text-ink-faint">
              {IMAGE_KIND_LABELS.find((k) => k.value === p.image_kind)?.help}
            </p>
          </div>
        </div>

        {/* Placement dans la page */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Emplacement" help="La grille principale est en haut de page.">
            <Choice
              value={p.featured ? "featured" : "also"}
              onChange={(v) => set("featured", v === "featured")}
              options={[
                { value: "featured", label: "Grille principale" },
                { value: "also", label: "Liste secondaire" },
              ]}
            />
          </Field>
          <Field label="Taille de la tuile" help="Ne s'applique qu'a la grille principale.">
            <Choice
              value={p.span}
              onChange={(v) => set("span", v)}
              options={[
                { value: "wide", label: "Grande" },
                { value: "half", label: "Demi" },
              ]}
            />
          </Field>
        </div>

        {/* Fiche detaillee */}
        <div className="border-t border-border pt-5">
          <p className="text-sm font-medium text-ink">Fiche detaillee</p>
          <p className="mt-1 text-xs text-ink-faint">
            Ce que le visiteur lit quand il ouvre le projet. Un champ vide n&apos;affiche
            aucun bloc.
          </p>

          <div className="mt-4 grid gap-5">
            <Field label="Le probleme">
              <Area
                value={p.problem ?? ""}
                onChange={(v) => set("problem", v)}
                placeholder="Hotels miss calls outside desk hours."
              />
            </Field>
            <Field label="Ce que j'ai construit">
              <Area value={p.built ?? ""} onChange={(v) => set("built", v)} />
            </Field>
            <Field
              label="Decisions et arbitrages"
              help="Ce que vous avez choisi, ce que vous avez ecarte, et pourquoi."
            >
              <Area value={p.decisions ?? ""} onChange={(v) => set("decisions", v)} />
            </Field>
            <Field label="Resultat" help="Un chiffre reel si vous en avez un.">
              <Area value={p.result ?? ""} onChange={(v) => set("result", v)} rows={2} />
            </Field>
            <Field label="Statut">
              <Text
                value={p.status ?? ""}
                onChange={(v) => set("status", v)}
                placeholder="Online at exemple.com."
              />
            </Field>
          </div>
        </div>

        {/* Publication */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <Choice
            value={p.published ? "on" : "off"}
            onChange={(v) => set("published", v === "on")}
            options={[
              { value: "off", label: "Brouillon" },
              { value: "on", label: "Publie" },
            ]}
          />
          <p className="mt-2 text-xs text-ink-faint">
            {p.published
              ? "Le projet est visible par tout le monde sur la page /portfolio."
              : "Le projet reste ici, invisible sur la page /portfolio."}
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-5 rounded-xl border border-primary/40 bg-primary/5 px-4 py-3 text-sm text-primary">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving || uploading}
          className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 font-semibold text-background transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-11 items-center rounded-full border border-border px-6 font-medium text-ink-soft transition-colors hover:border-primary hover:text-ink"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

// capacites techniques

// Bloc Capabilities de la page /portfolio. Un groupe par ligne : un nom, et les
// technologies separees par des virgules. L'ensemble est remplace en bloc a
// l'enregistrement.
function CapabilitiesEditor({ initial }: { initial: CapGroup[] }) {
  const [rows, setRows] = useState(
    initial.map((g) => ({ group: g.group, itemsText: g.items.join(", ") }))
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const update = (index: number, key: "group" | "itemsText", value: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [key]: value } : r)));
    setMessage(null);
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const groups = rows
        .filter((r) => r.group.trim())
        .map((r) => ({
          group: r.group.trim(),
          items: r.itemsText
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean),
        }));
      const res = await fetch("/api/admin-portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ action: "capabilities", groups }),
      });
      if (!res.ok) {
        setError("L'enregistrement a echoue. Reessayez.");
        return;
      }
      setMessage("Capacites enregistrees. Rafraichissez /portfolio pour les voir.");
    } catch {
      setError("L'enregistrement a echoue. Reessayez.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="font-display text-xl font-semibold text-ink">Capacites techniques</h2>
      <div className="mt-5 space-y-3">
        {rows.map((r, i) => (
          <div
            key={i}
            className="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-[10rem_1fr_auto] sm:items-center"
          >
            <input
              type="text"
              value={r.group}
              placeholder="Frontend"
              aria-label={`Nom du groupe ${i + 1}`}
              onChange={(e) => update(i, "group", e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm font-medium text-ink placeholder:text-ink-faint focus:border-primary"
            />
            <input
              type="text"
              value={r.itemsText}
              placeholder="Next.js, React, TypeScript"
              aria-label={`Technologies du groupe ${i + 1}`}
              onChange={(e) => update(i, "itemsText", e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-primary"
            />
            <button
              type="button"
              onClick={() => {
                setRows((prev) => prev.filter((_, j) => j !== i));
                setMessage(null);
              }}
              className="min-h-10 rounded-full border border-border px-4 text-sm text-ink-soft transition-colors hover:border-red-500/60 hover:text-red-400"
            >
              Retirer
            </button>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setRows((prev) => [...prev, { group: "", itemsText: "" }])}
          className="inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm font-medium text-ink transition-colors hover:border-primary hover:text-primary"
        >
          Ajouter un groupe
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 font-semibold text-background transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Enregistrement..." : "Enregistrer les capacites"}
        </button>
        {message && <span className="text-sm text-primary">{message}</span>}
        {error && <span className="text-sm text-red-400">{error}</span>}
      </div>
    </section>
  );
}

// ecran

export default function AdminPortfolio() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);
  const [caps, setCaps] = useState<CapGroup[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/admin-portfolio", { credentials: "same-origin" });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      const data = (await res.json()) as {
        projects?: Project[];
        capabilities?: CapGroup[];
      };
      setProjects(data.projects ?? []);
      setCaps(data.capabilities ?? []);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  };

  // Chargement enveloppe dans une fonction asynchrone immediate, comme dans
  // AdminDashboard : les setState ne partent qu'apres la reponse du reseau.
  useEffect(() => {
    (async () => {
      await load();
    })();
  }, []);

  // Deplace un projet d'un cran, puis enregistre le nouvel ordre complet.
  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (busy || target < 0 || target >= projects.length) return;
    const next = [...projects];
    [next[index], next[target]] = [next[target], next[index]];
    setProjects(next);
    setBusy(true);
    try {
      await fetch("/api/admin-portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ action: "reorder", ids: next.map((p) => p.id) }),
      });
    } catch {
      await load();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (project: Project) => {
    setBusy(true);
    try {
      await fetch(`/api/admin-portfolio?id=${encodeURIComponent(project.id)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      setConfirmDelete(null);
      await load();
    } finally {
      setBusy(false);
    }
  };

  if (status === "loading") {
    return <p className="mt-8 text-sm text-ink-soft">Chargement des projets...</p>;
  }

  if (status === "error") {
    return (
      <p className="mt-8 rounded-xl border border-border bg-surface px-5 py-4 text-sm text-ink-soft">
        Les projets n&apos;ont pas pu etre charges. Cette section fonctionne une fois le
        site deploye sur Cloudflare.
      </p>
    );
  }

  if (editing) {
    return (
      <div className="mt-8">
        <ProjectForm
          initial={editing}
          onCancel={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await load();
          }}
        />
      </div>
    );
  }

  const published = projects.filter((p) => p.published).length;

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink-soft">
          {projects.length} projet{projects.length > 1 ? "s" : ""}, dont {published} publie
          {published > 1 ? "s" : ""}.{" "}
          <a
            href="/portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-2 hover:underline"
          >
            Voir la page
          </a>
        </p>
        <button
          type="button"
          onClick={() => setEditing({ ...EMPTY })}
          className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 font-semibold text-background transition-colors hover:bg-primary-hover"
        >
          Ajouter un projet
        </button>
      </div>

      {projects.length === 0 ? (
        <p className="mt-6 rounded-xl border border-border bg-surface px-5 py-4 text-sm text-ink-soft">
          Aucun projet pour l&apos;instant. Utilisez le bouton Ajouter un projet.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {projects.map((p, i) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface p-4"
            >
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image_url}
                  alt=""
                  className="h-14 w-20 flex-none rounded-lg border border-border object-cover"
                />
              ) : (
                <div className="pf-abstract h-14 w-20 flex-none rounded-lg border border-border" />
              )}

              <div className="min-w-40 flex-1 overflow-hidden">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="max-w-full truncate font-medium text-ink">{p.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      p.published
                        ? "bg-primary/15 text-primary"
                        : "bg-surface-muted text-ink-faint"
                    }`}
                  >
                    {p.published ? "Publie" : "Brouillon"}
                  </span>
                  <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-ink-faint">
                    {p.featured ? "Grille principale" : "Liste secondaire"}
                  </span>
                </div>
                {p.line && (
                  <p className="line-clamp-2 text-sm [overflow-wrap:anywhere] text-ink-soft">{p.line}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0 || busy}
                  aria-label={`Monter ${p.name}`}
                  className="min-h-10 min-w-10 rounded-full border border-border text-ink-soft transition-colors hover:border-primary hover:text-primary disabled:opacity-30"
                >
                  {"↑"}
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === projects.length - 1 || busy}
                  aria-label={`Descendre ${p.name}`}
                  className="min-h-10 min-w-10 rounded-full border border-border text-ink-soft transition-colors hover:border-primary hover:text-primary disabled:opacity-30"
                >
                  {"↓"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(p)}
                  className="min-h-10 rounded-full border border-border px-4 text-sm font-medium text-ink transition-colors hover:border-primary hover:text-primary"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(p)}
                  className="min-h-10 rounded-full border border-border px-4 text-sm font-medium text-ink-soft transition-colors hover:border-red-500/60 hover:text-red-400"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CapabilitiesEditor key={caps.length} initial={caps} />

      {/* Confirmation avant une suppression definitive. */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface-raised p-6">
            <h3 className="font-display text-xl font-semibold text-ink">
              Supprimer {confirmDelete.name} ?
            </h3>
            <p className="mt-2 text-sm text-ink-soft">
              Le projet sera retire definitivement de la base et de la page /portfolio.
              Cette action ne peut pas etre annulee. Pour le masquer sans le perdre,
              passez-le en brouillon.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => remove(confirmDelete)}
                disabled={busy}
                className="inline-flex min-h-11 items-center rounded-full bg-red-500/90 px-5 font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-60"
              >
                {busy ? "Suppression..." : "Supprimer definitivement"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="inline-flex min-h-11 items-center rounded-full border border-border px-5 font-medium text-ink-soft transition-colors hover:border-primary hover:text-ink"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
