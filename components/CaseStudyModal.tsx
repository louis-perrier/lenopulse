"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Dictionary, WorkItem } from "@/lib/i18n/types";
import { workAssets } from "@/lib/site";
import CaseVisual from "./CaseVisual";
import { IconClose, IconCheck, IconArrow } from "./Icons";

type ModalProps = {
  item: WorkItem | null;
  index: number;
  dict: Dictionary;
  onClose: () => void;
};

export default function CaseStudyModal({ item, index, dict, onClose }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (item) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={item.name}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-t-2xl border border-border bg-surface sm:rounded-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={dict.common.close}
              className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/60 text-ink transition-colors hover:text-primary"
            >
              <IconClose className="h-5 w-5" />
            </button>

            <CaseVisual item={item} index={index} className="h-48 w-full sm:h-56" />

            <div className="p-6 sm:p-8">
              <p className="text-xs font-medium uppercase tracking-wider text-primary">
                {item.tag}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-ink">
                {item.name}
              </h3>
              <p className="mt-1 text-ink-soft">{item.teaser}</p>
              <p className="mt-5 leading-relaxed text-ink-soft">{item.description}</p>

              <div className="mt-6 flex items-center gap-3 rounded-xl border border-border-strong bg-surface-raised px-4 py-3">
                <IconCheck className="h-5 w-5 shrink-0 text-primary" />
                <span className="font-medium text-ink">{item.result}</span>
              </div>

              {/* Lien discret, nouvel onglet : le visiteur ne quitte pas le site. */}
              {workAssets[item.id]?.url && (
                <a
                  href={workAssets[item.id].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-accent"
                >
                  {dict.common.visit}
                  <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
