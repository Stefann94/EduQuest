import type { Accent } from "@/lib/content/schema";

/** Clasele pentru fiecare culoare de accent (aceleași în lecții, carduri și cursuri). */
export const ACCENT: Record<
  Accent,
  { bar: string; text: string; soft: string; border: string; gradient: string }
> = {
  pink: {
    bar: "bg-primary",
    text: "text-primary",
    soft: "bg-primary-soft",
    border: "border-primary",
    gradient: "bg-[linear-gradient(140deg,var(--primary),#c42a8f_70%)]",
  },
  cyan: {
    bar: "bg-cyan",
    text: "text-cyan",
    soft: "bg-info-soft",
    border: "border-cyan",
    gradient: "bg-[linear-gradient(140deg,#1fb5a8,#2a2f8f_80%)]",
  },
  yellow: {
    bar: "bg-xp",
    text: "text-xp",
    soft: "bg-xp-soft",
    border: "border-xp",
    gradient: "bg-[linear-gradient(140deg,#e0a400,#a8452e_85%)]",
  },
  orange: {
    bar: "bg-warning",
    text: "text-warning",
    soft: "bg-warning-soft",
    border: "border-warning",
    gradient: "bg-[linear-gradient(140deg,#ff8a3d,#b8325f_85%)]",
  },
  green: {
    bar: "bg-success",
    text: "text-success",
    soft: "bg-success-soft",
    border: "border-success",
    gradient: "bg-[linear-gradient(140deg,#24b27a,#1f5d8f_85%)]",
  },
};

export const ACCENT_ORDER: Accent[] = [
  "pink",
  "cyan",
  "yellow",
  "orange",
  "green",
];
