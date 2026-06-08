"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/types";
import { siteConfig, type SocialKey } from "@/lib/site";
import Reveal from "./Reveal";
import {
  IconArrow,
  IconYoutube,
  IconInstagram,
  IconWhatsapp,
  IconLinkedin,
} from "./Icons";

const socialMeta: Record<SocialKey, { label: string; Icon: typeof IconYoutube }> = {
  youtube: { label: "YouTube", Icon: IconYoutube },
  instagram: { label: "Instagram", Icon: IconInstagram },
  whatsapp: { label: "WhatsApp", Icon: IconWhatsapp },
  linkedin: { label: "LinkedIn", Icon: IconLinkedin },
};

export default function Contact({ dict }: { dict: Dictionary }) {
  const c = dict.contact;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const activeSocials = (Object.keys(siteConfig.socials) as SocialKey[]).filter(
    (key) => siteConfig.socials[key] && siteConfig.socials[key] !== "#"
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(c.mailtoSubject);
    const body = encodeURIComponent(
      `${c.nameLabel}: ${name}\n${c.emailLabel}: ${email}\n\n${message}`
    );
    window.location.href = `mailto:${siteConfig.contactEmail}?subject=${subject}&body=${body}`;
  };

  const fieldClass =
    "w-full rounded-xl border border-border bg-surface px-4 py-3 text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-primary";

  return (
    <section id="contact" className="relative border-t border-border/60 bg-surface/40">
      <div className="mx-auto max-w-3xl px-6 py-24 sm:py-32">
        <Reveal className="text-center">
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
            {c.title}
          </h2>
          <p className="mt-4 text-lg text-ink-soft">{c.subtitle}</p>
        </Reveal>

        <Reveal delay={0.1}>
          <form onSubmit={onSubmit} className="mx-auto mt-12 max-w-xl space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={c.nameLabel}
                aria-label={c.nameLabel}
                className={fieldClass}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={c.emailLabel}
                aria-label={c.emailLabel}
                className={fieldClass}
              />
            </div>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={c.messageLabel}
              aria-label={c.messageLabel}
              className={`${fieldClass} resize-none`}
            />
            <button
              type="submit"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-background transition-colors hover:bg-primary-hover"
            >
              {c.submit}
              <IconArrow className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="text-center text-sm text-ink-faint">{c.note}</p>
          </form>
        </Reveal>

        {activeSocials.length > 0 && (
          <Reveal delay={0.15}>
            <div className="mt-12 text-center">
              <p className="text-sm text-ink-faint">{c.socialsLabel}</p>
              <div className="mt-4 flex justify-center gap-3">
                {activeSocials.map((key) => {
                  const { label, Icon } = socialMeta[key];
                  return (
                    <a
                      key={key}
                      href={siteConfig.socials[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-ink-soft transition-colors hover:border-primary hover:text-primary"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
