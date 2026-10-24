import type { Accent } from "@/lib/content/schema";

/** Clasele pentru fiecare culoare de accent (aceleași în lecții, carduri și cursuri). */
export const ACCENT: Record<
  Accent,
  {
    bar: string;
    /** Textul pus peste `bar` (alb pe culori închise, cerneală pe muștar). */
    fg: string;
    text: string;
    soft: string;
    border: string;
    gradient: string;
  }
> = {
  pink: {
    bar: "bg-primary",
    fg: "text-white",
    text: "text-primary",
    soft: "bg-primary-soft",
    border: "border-primary",
    gradient: "bg-[linear-gradient(140deg,var(--primary),#8a3a22_75%)]",
  },
  cyan: {
    bar: "bg-cyan",
    fg: "text-white",
    text: "text-cyan",
    soft: "bg-info-soft",
    border: "border-cyan",
    gradient: "bg-[linear-gradient(140deg,#3a7559,#1f3d31_80%)]",
  },
  yellow: {
    bar: "bg-cta",
    fg: "text-cta-foreground",
    text: "text-xp",
    soft: "bg-xp-soft",
    border: "border-xp",
    gradient: "bg-[linear-gradient(140deg,#c99a10,#8f5a14_85%)]",
  },
  orange: {
    bar: "bg-warning",
    fg: "text-white",
    text: "text-warning",
    soft: "bg-warning-soft",
    border: "border-warning",
    gradient: "bg-[linear-gradient(140deg,#c4702c,#8a3a22_85%)]",
  },
  green: {
    bar: "bg-success",
    fg: "text-white",
    text: "text-success",
    soft: "bg-success-soft",
    border: "border-success",
    gradient: "bg-[linear-gradient(140deg,#3f8a5c,#24503d_85%)]",
  },
};

export const ACCENT_ORDER: Accent[] = [
  "pink",
  "cyan",
  "yellow",
  "orange",
  "green",
];
