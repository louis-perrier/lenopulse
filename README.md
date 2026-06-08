# LOUAI

Site vitrine de Louis (marque LOUAI). Sites, applications, automatisation, agents vocaux
et IA. Trilingue FR / EN / ES. Next.js + Tailwind CSS, export statique pour Cloudflare Pages.

## Demarrage

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000 (redirige vers /fr, /en ou /es selon le navigateur).

## Build

```bash
npm run build
```

Genere le site statique dans `out/`.

## Deploiement (Cloudflare Pages)

- Framework : Next.js (Static Export)
- Build command : `npm run build`
- Output directory : `out`

## A personnaliser avant mise en ligne

- `lib/site.ts` : adresse email de contact et URLs des reseaux sociaux.
- `lib/legal.ts` : mentions legales et politique de confidentialite (placeholders).
- Visuels des realisations et photo de profil.

Voir `contexte.md` pour la documentation complete de l'application.
