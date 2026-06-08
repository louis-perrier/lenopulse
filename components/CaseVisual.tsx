import type { WorkItem } from "@/lib/i18n/types";

// Visuel placeholder abstrait (monogramme dore sur fond sombre), sans fausse capture.
// Sert a la fois dans la carte et dans la modale. A remplacer par un vrai visuel
// quand il sera fourni.
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
  const grad = palettes[index % palettes.length];

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
