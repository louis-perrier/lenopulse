"use client";

import { useEffect } from "react";

// Met a jour l'attribut lang de la balise html cote client, par langue active.
// Le rendu serveur fixe "fr" par defaut (layout racine) ; ce composant corrige
// pour /en et /es, en complement des alternates hreflang.
export default function LangSync({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
