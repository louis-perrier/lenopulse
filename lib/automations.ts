import type { PortfolioAutomation } from "@/lib/portfolio";

// Outillage partage par la grille de /portfolio et son catalogue. Tout ce qui
// touche au DOM, au presse-papier ou a l'URL vit ici plutot que dans les
// composants, ou c'est noye et intestable.

export type TriAutomations = "position" | "az" | "noeuds";

export interface CriteresCatalogue {
  q: string;
  outils: string[];
  avecDemo: boolean;
  avecWorkflow: boolean;
  tri: TriAutomations;
}

// Cle de l'ancre dans l'URL. Le slug vient de la base et ne bouge plus une fois
// pose ; l'id ne sert que si une ligne ancienne n'en a pas encore.
export function ancre(a: PortfolioAutomation): string {
  return a.slug ?? a.id;
}

// "Invoice reminder" devient "invoice-reminder.json".
export function fileName(name: string): string {
  const base =
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "workflow";
  return `${base}.json`;
}

export function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Lien direct recu dans une candidature, du type /portfolio#a-invoice-reminder.
// decodeURIComponent leve sur un pourcent isole, ce qui casserait le rendu.
export function cleDeLAncre(): string | null {
  const brut = window.location.hash;
  if (!brut.startsWith("#a-")) return null;
  try {
    return decodeURIComponent(brut.slice(3)) || null;
  } catch {
    return brut.slice(3) || null;
  }
}

// La carte visee par un lien direct doit se trouver dans la fenetre affichee.
// Au-dela, on la remonte en tete ; en deca, l'ordre choisi n'est pas touche et
// la meme reference est renvoyee, ce qui evite de reveiller l'effet d'ancrage.
export function promouvoir(
  liste: PortfolioAutomation[],
  cle: string | null,
  fenetre: number
): PortfolioAutomation[] {
  if (!cle) return liste;
  const i = liste.findIndex((a) => ancre(a) === cle);
  if (i < 0 || i < fenetre) return liste;
  return [liste[i], ...liste.slice(0, i), ...liste.slice(i + 1)];
}

// Methode historique, pour les navigateurs anciens et les pages servies hors
// HTTPS, ou navigator.clipboard n'existe pas.
function copieDeSecours(texte: string): boolean {
  const zone = document.createElement("textarea");
  zone.value = texte;
  zone.setAttribute("readonly", "");
  zone.style.position = "fixed";
  zone.style.top = "-1000px";
  document.body.appendChild(zone);
  zone.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  zone.remove();
  return ok;
}

// writeText reste la premiere instruction : Safari annule l'autorisation de
// copie des qu'une requete reseau s'intercale entre le clic et l'ecriture.
export async function copierTexte(texte: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texte);
    return true;
  } catch {
    // On tente la methode historique avant d'abandonner.
  }
  return copieDeSecours(texte);
}

export function telechargerWorkflow(nom: string, workflow: string): void {
  const url = URL.createObjectURL(new Blob([workflow], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName(nom);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function lienDirect(a: PortfolioAutomation): string {
  return `${window.location.origin}/portfolio#a-${ancre(a)}`;
}

// La description n'est pas affichee dans le catalogue mais reste cherchable :
// elle porte le vocabulaire metier que le resume n'a pas la place de dire.
export function construireIndex(liste: PortfolioAutomation[]): Map<string, string> {
  return new Map(
    liste.map((a) => [
      a.id,
      normaliser([a.name, a.summary ?? "", a.description ?? "", a.tools.join(" ")].join(" ")),
    ])
  );
}

export function facettesOutils(liste: PortfolioAutomation[]): { nom: string; n: number }[] {
  const comptes = new Map<string, number>();
  for (const a of liste) {
    for (const outil of new Set(a.tools)) {
      comptes.set(outil, (comptes.get(outil) ?? 0) + 1);
    }
  }
  return [...comptes.entries()]
    .map(([nom, n]) => ({ nom, n }))
    .sort((x, y) => y.n - x.n || x.nom.localeCompare(y.nom));
}

const tris: Record<
  TriAutomations,
  (x: PortfolioAutomation, y: PortfolioAutomation) => number
> = {
  position: (x, y) => x.position - y.position,
  az: (x, y) => x.name.localeCompare(y.name),
  noeuds: (x, y) => (y.node_count ?? -1) - (x.node_count ?? -1),
};

// Les outils coches se cumulent en ET : un acheteur cherche ce qui branche son
// Slack ET son Gmail, pas ce qui touche l'un ou l'autre.
export function filtrerTrier(
  liste: PortfolioAutomation[],
  criteres: CriteresCatalogue,
  index: Map<string, string>
): PortfolioAutomation[] {
  const termes = normaliser(criteres.q).split(/\s+/).filter(Boolean);
  return liste
    .filter((a) => {
      if (criteres.avecDemo && !a.guide_url) return false;
      if (criteres.avecWorkflow && !a.workflow_json) return false;
      if (!criteres.outils.every((o) => a.tools.includes(o))) return false;
      const texte = index.get(a.id) ?? "";
      return termes.every((t) => texte.includes(t));
    })
    .sort(tris[criteres.tri]);
}
