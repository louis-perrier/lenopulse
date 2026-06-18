// Contrat de traduction partage par les trois langues (fr, en, es).
// Toute cle ajoutee ici doit etre renseignee dans chaque dictionnaire.

export type Locale = "fr" | "en" | "es";

export interface MetaDict {
  title: string;
  description: string;
}

export interface NavDict {
  skills: string;
  work: string;
  about: string;
  cta: string;
}

export interface HeroDict {
  kicker: string;
  titleLine1: string;
  titleHighlight: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  reassurance: string;
}

export interface ProblemDict {
  title: string;
  intro: string;
  points: string[];
}

export interface SkillItem {
  title: string;
  description: string;
}

export interface SkillsDict {
  title: string;
  subtitle: string;
  items: SkillItem[];
}

export interface ProcessStep {
  title: string;
  description: string;
}

export interface ProcessDict {
  title: string;
  subtitle: string;
  steps: ProcessStep[];
}

export interface WorkItem {
  id: string;
  name: string;
  tag: string;
  teaser: string;
  description: string;
  result: string;
}

export interface WorkDict {
  title: string;
  subtitle: string;
  items: WorkItem[];
}

export interface AboutDict {
  title: string;
  body: string;
  photoAlt: string;
  languagesLabel: string;
  languages: string[];
}

export interface FinalCtaDict {
  title: string;
  subtitle: string;
  cta: string;
  reassurance: string;
}

export interface ContactDict {
  title: string;
  subtitle: string;
  nameLabel: string;
  emailLabel: string;
  messageLabel: string;
  submit: string;
  sending: string;
  success: string;
  error: string;
  socialsLabel: string;
  note: string;
  mailtoSubject: string;
}

export interface AssistantBriefFields {
  problem: string;
  target: string;
  scope: string;
  budget: string;
  timeline: string;
  nextStep: string;
}

export interface AssistantDict {
  kicker: string;
  title: string;
  subtitle: string;
  greeting: string;
  starters: string[];
  inputPlaceholder: string;
  send: string;
  thinking: string;
  restart: string;
  error: string;
  unavailable: string;
  briefTitle: string;
  briefIntro: string;
  briefCta: string;
  briefFields: AssistantBriefFields;
  disclaimer: string;
}

export interface BookingDict {
  kicker: string;
  title: string;
  subtitle: string;
  lockedTitle: string;
  lockedText: string;
  unavailable: string;
  booked: string;
}

export interface FooterDict {
  tagline: string;
  legal: string;
  privacy: string;
  rights: string;
}

export interface CommonDict {
  close: string;
  discover: string;
  visit: string;
  backHome: string;
}

export interface LauncherDict {
  open: string;
  title: string;
  chat: string;
  email: string;
  booking: string;
}

export interface Dictionary {
  meta: MetaDict;
  nav: NavDict;
  hero: HeroDict;
  problem: ProblemDict;
  skills: SkillsDict;
  process: ProcessDict;
  work: WorkDict;
  about: AboutDict;
  finalCta: FinalCtaDict;
  contact: ContactDict;
  assistant: AssistantDict;
  booking: BookingDict;
  footer: FooterDict;
  common: CommonDict;
  launcher: LauncherDict;
}
