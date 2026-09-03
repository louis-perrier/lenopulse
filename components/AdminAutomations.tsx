"use client";

import { useEffect, useMemo, useState } from "react";

// Onglet Automatisations de /admin. Meme fonctionnement que l'onglet Portfolio :
// tout passe par /api/admin-automations, protege par le cookie de session.
//
// La particularite ici est le workflow n8n. Il est colle tel quel depuis n8n
// (Ctrl+A puis Ctrl+C sur le canvas), verifie a la saisie, et c'est lui qui
// alimente les boutons Copier et Telecharger de la page publique.

interface Automation {
  id: string;
  position: number;
  published: boolean;
  name: string;
  summary: string | null;
  description: string | null;
  tools: string[];
  image_url: string | null;
  workflow_json: string | null;
  node_count: number | null;
}

const EMPTY: Automation = {
  id: "",
  position: 0,
  published: false,
  name: "",
  summary: "",
  description: "",
  tools: [],
  image_url: "",
  workflow_json: "",
  node_count: null,
};

const inputClass =
  "w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-ink placeholder:text-ink-faint transition-colors focus:border-primary";

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

// Lecture du workflow colle : on en tire le nombre de noeuds et les types
// d'integrations, ce qui donne un retour immediat sur ce qui a ete colle.
function lireWorkflow(brut: string): {
  etat: "vide" | "ok" | "invalide" | "pas_n8n";
  noeuds: number;
  integrations: string[];
} {
  const texte = brut.trim();
  if (!texte) return { etat: "vide", noeuds: 0, integrations: [] };
  try {
    const parsed = JSON.parse(texte) as { nodes?: { type?: string }[] };
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.nodes)) {
      return { etat: "pas_n8n", noeuds: 0, integrations: [] };
    }
    const integrations = [
      ...new Set(
        parsed.nodes
          .map((n) => (typeof n?.type === "string" ? n.type.split(".").pop() ?? "" : ""))
          .filter(Boolean)
      ),
    ];
    return { etat: "ok", noeuds: parsed.nodes.length, integrations };
  } catch {
    return { etat: "invalide", noeuds: 0, integrations: [] };
  }
}

function AutomationForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial: Automation;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [a, setA] = useState<Automation>(initial);
  const [toolsText, setToolsText] = useState(initial.tools.join(", "));
  const [workflowText, setWorkflowText] = useState(initial.workflow_json ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNew = !initial.id;
  const set = <K extends keyof Automation>(key: K, value: Automation[K]) =>
    setA((prev) => ({ ...prev, [key]: value }));

  const lecture = useMemo(() => lireWorkflow(workflowText), [workflowText]);

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
      const data = (await res.json()) as { url?: string; error?: string };
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
    } catch {
      setError("L'envoi de l'image a echoue. Reessayez.");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (saving) return;
    if (!a.name.trim()) {
      setError("Le nom du scenario est obligatoire.");
      return;
    }
    if (lecture.etat === "invalide" || lecture.etat === "pas_n8n") {
      setError(
        lecture.etat === "invalide"
          ? "Le workflow colle n'est pas un JSON valide."
          : "Ce JSON ne ressemble pas a un export n8n. Il doit contenir une liste nodes."
      );
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin-automations", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          ...a,
          workflow_json: workflowText,
          tools: toolsText
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(
          data.error === "workflow_too_large"
            ? "Workflow trop volumineux. Simplifiez le scenario."
            : "L'enregistrement a echoue. Reessayez."
        );
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
        {isNew ? "Nouveau scenario" : `Modifier ${initial.name}`}
      </h3>
      <p className="mt-1 text-sm text-ink-soft">
        Les textes s&apos;affichent tels quels sur la page, en anglais.
      </p>

      <div className="mt-6 grid gap-5">
        <Field label="Nom du scenario" help="Affiche en titre de la carte.">
          <input
            type="text"
            value={a.name}
            placeholder="Invoice reminder"
            onChange={(e) => set("name", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Resume" help="Une phrase, ce que le scenario fait.">
          <input
            type="text"
            value={a.summary ?? ""}
            placeholder="Chases unpaid invoices on a schedule."
            onChange={(e) => set("summary", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Description" help="Facultatif. Le detail, si le resume ne suffit pas.">
          <textarea
            value={a.description ?? ""}
            rows={3}
            onChange={(e) => set("description", e.target.value)}
            className={`${inputClass} resize-y leading-relaxed`}
          />
        </Field>

        <Field label="Outils" help="Separes par des virgules. Les 6 premiers sont affiches.">
          <input
            type="text"
            value={toolsText}
            placeholder="Gmail, Slack, OpenAI"
            onChange={(e) => setToolsText(e.target.value)}
            className={inputClass}
          />
        </Field>

        {/* Workflow n8n */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-sm font-medium text-ink">Workflow n8n</p>
          <p className="mt-1 text-xs text-ink-faint">
            Dans n8n, selectionnez tout le canvas avec Ctrl+A, copiez avec Ctrl+C, puis
            collez ici. C&apos;est ce contenu que le visiteur copiera ou telechargera.
          </p>
          <textarea
            value={workflowText}
            rows={8}
            spellCheck={false}
            placeholder={'{ "nodes": [ ... ], "connections": { ... } }'}
            onChange={(e) => setWorkflowText(e.target.value)}
            className={`${inputClass} mt-3 resize-y font-mono text-xs leading-relaxed`}
          />

          {lecture.etat === "ok" && (
            <div className="mt-3">
              <p className="text-sm text-primary">
                Workflow reconnu. {lecture.noeuds} noeud{lecture.noeuds > 1 ? "s" : ""}.
              </p>
              {lecture.integrations.length > 0 && (
                <p className="mt-1 text-xs text-ink-faint">
                  Detecte : {lecture.integrations.slice(0, 10).join(", ")}
                </p>
              )}
            </div>
          )}
          {lecture.etat === "invalide" && (
            <p className="mt-3 text-sm text-red-400">
              Ce n&apos;est pas un JSON valide. Recollez depuis n8n.
            </p>
          )}
          {lecture.etat === "pas_n8n" && (
            <p className="mt-3 text-sm text-red-400">
              JSON valide, mais sans liste nodes. Ce n&apos;est pas un export n8n.
            </p>
          )}
          {lecture.etat === "vide" && (
            <p className="mt-3 text-xs text-ink-faint">
              Sans workflow, la carte s&apos;affiche mais sans bouton de recuperation.
            </p>
          )}
        </div>

        {/* Capture du canvas */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-sm font-medium text-ink">Capture du canvas</p>
          {a.image_url ? (
            <div className="mt-3 flex flex-wrap items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.image_url}
                alt="Apercu de la capture"
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
              Aucune capture. Un motif dore sera affiche a la place.
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
            <span className="ml-3 text-xs text-ink-faint">5 Mo maximum.</span>
          </div>
        </div>

        {/* Publication */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { v: false, l: "Brouillon" },
                { v: true, l: "Publie" },
              ] as const
            ).map((o) => (
              <button
                key={o.l}
                type="button"
                onClick={() => set("published", o.v)}
                className={`min-h-10 rounded-full border px-4 text-sm font-medium transition-colors ${
                  a.published === o.v
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-ink-soft hover:border-primary/50"
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-faint">
            {a.published
              ? "Le scenario est visible et recuperable par tout le monde."
              : "Le scenario reste ici, invisible sur la page /portfolio."}
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

export default function AdminAutomations() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [items, setItems] = useState<Automation[]>([]);
  const [editing, setEditing] = useState<Automation | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Automation | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/admin-automations", { credentials: "same-origin" });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      const data = (await res.json()) as { automations?: Automation[] };
      setItems(data.automations ?? []);
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

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (busy || target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    setBusy(true);
    try {
      await fetch("/api/admin-automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ action: "reorder", ids: next.map((i) => i.id) }),
      });
    } catch {
      await load();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item: Automation) => {
    setBusy(true);
    try {
      await fetch(`/api/admin-automations?id=${encodeURIComponent(item.id)}`, {
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
    return <p className="mt-8 text-sm text-ink-soft">Chargement des scenarios...</p>;
  }

  if (status === "error") {
    return (
      <p className="mt-8 rounded-xl border border-border bg-surface px-5 py-4 text-sm text-ink-soft">
        Les scenarios n&apos;ont pas pu etre charges. Cette section fonctionne une fois le
        site deploye sur Cloudflare.
      </p>
    );
  }

  if (editing) {
    return (
      <div className="mt-8">
        <AutomationForm
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

  const published = items.filter((i) => i.published).length;

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink-soft">
          {items.length} scenario{items.length > 1 ? "s" : ""}, dont {published} publie
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
          Ajouter un scenario
        </button>
      </div>

      {items.length === 0 ? (
        <p className="mt-6 rounded-xl border border-border bg-surface px-5 py-4 text-sm text-ink-soft">
          Aucun scenario pour l&apos;instant. La section Automations reste masquee sur la
          page tant qu&apos;aucun scenario n&apos;est publie.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((item, i) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface p-4"
            >
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image_url}
                  alt=""
                  className="h-14 w-20 flex-none rounded-lg border border-border object-cover"
                />
              ) : (
                <div className="pf-abstract h-14 w-20 flex-none rounded-lg border border-border" />
              )}

              <div className="min-w-40 flex-1 overflow-hidden">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="max-w-full truncate font-medium text-ink">{item.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      item.published
                        ? "bg-primary/15 text-primary"
                        : "bg-surface-muted text-ink-faint"
                    }`}
                  >
                    {item.published ? "Publie" : "Brouillon"}
                  </span>
                  {item.node_count !== null && (
                    <span className="rounded-full bg-surface-muted px-2 py-0.5 font-mono text-[11px] text-ink-faint">
                      {item.node_count} noeuds
                    </span>
                  )}
                  {!item.workflow_json && (
                    <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-ink-faint">
                      Sans workflow
                    </span>
                  )}
                </div>
                {item.summary && (
                  <p className="line-clamp-2 text-sm [overflow-wrap:anywhere] text-ink-soft">
                    {item.summary}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0 || busy}
                  aria-label={`Monter ${item.name}`}
                  className="min-h-10 min-w-10 rounded-full border border-border text-ink-soft transition-colors hover:border-primary hover:text-primary disabled:opacity-30"
                >
                  {"↑"}
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1 || busy}
                  aria-label={`Descendre ${item.name}`}
                  className="min-h-10 min-w-10 rounded-full border border-border text-ink-soft transition-colors hover:border-primary hover:text-primary disabled:opacity-30"
                >
                  {"↓"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(item)}
                  className="min-h-10 rounded-full border border-border px-4 text-sm font-medium text-ink transition-colors hover:border-primary hover:text-primary"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(item)}
                  className="min-h-10 rounded-full border border-border px-4 text-sm font-medium text-ink-soft transition-colors hover:border-red-500/60 hover:text-red-400"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface-raised p-6">
            <h3 className="font-display text-xl font-semibold text-ink">
              Supprimer {confirmDelete.name} ?
            </h3>
            <p className="mt-2 text-sm text-ink-soft">
              Le scenario et son workflow seront retires definitivement de la base. Cette
              action ne peut pas etre annulee. Pour le masquer sans le perdre, passez-le en
              brouillon.
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
