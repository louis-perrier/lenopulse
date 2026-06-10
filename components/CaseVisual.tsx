import Image from "next/image";
import type { WorkItem } from "@/lib/i18n/types";
import { workAssets } from "@/lib/site";

// Visuel d'une realisation. Affiche la vraie capture quand elle existe dans
// workAssets (lib/site.ts), sinon un placeholder abstrait (monogramme dore sur
// fond sombre), sans fausse capture. Sert dans la carte et dans la modale.
const palettes = [
  "from-[#241a06] to-[#0b0a07]",
  "from-[#1c1707] to-[#0a0a0f]",
  "from-[#231b08] to-[#0d0b07]",
  "from-[#1a1606] to-[#0b0a08]",
  "from-[#221a09] to-[#0a0a0c]",
  "from-[#1e1707] to-[#0c0a07]",
];

type CaseVisualProps = {
  item: WorkItem;
  index: number;
  className?: string;
};

export default function CaseVisual({ item, index, className = "" }: CaseVisualProps) {
  const asset = workAssets[item.id];

  if (asset?.image) {
    return (
      <div className={`relative overflow-hidden ${className}`} aria-hidden>
        <Image
          src={asset.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        <span className="absolute bottom-3 left-3 rounded-full border border-primary/30 bg-background/60 px-2.5 py-1 text-[11px] font-medium text-primary backdrop-blur-sm">
          {item.tag}
        </span>
      </div>
    );
  }

  const grad = palettes[index % palettes.length];

  if (asset?.logo) {
    return (
      <div
        className={`relative overflow-hidden bg-linear-to-br ${grad} ${className}`}
        aria-hidden
      >
        <div className="grain" />
        <div className="absolute inset-8 sm:inset-10">
          <Image
            src={asset.logo}
            alt=""
            fill
            sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
            className="object-contain"
          />
        </div>
        <span className="absolute bottom-3 left-3 rounded-full border border-primary/30 bg-background/40 px-2.5 py-1 text-[11px] font-medium text-primary">
          {item.tag}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-linear-to-br ${grad} ${className}`}
      aria-hidden
    >
      <div className="grain" />
      <span className="absolute -right-4 -top-10 select-none font-display text-[9rem] font-bold leading-none text-primary/10">
        {item.name.charAt(0)}
      </span>
      <span className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/15" />
      <span className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10" />
      <span className="absolute bottom-3 left-3 rounded-full border border-primary/30 bg-background/40 px-2.5 py-1 text-[11px] font-medium text-primary">
        {item.tag}
      </span>
    </div>
  );
}
