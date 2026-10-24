import {
  CalendarCheck,
  FileCheck2,
  ListChecks,
  type LucideIcon,
  Radio,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import type { XpSource } from "@/lib/data/types";

/** Sursa unei tranzacții de XP: iconiță și text (nu doar culoare). */
export const XP_SOURCES: Record<XpSource, { label: string; icon: LucideIcon }> =
  {
    attendance: { label: "Prezență", icon: CalendarCheck },
    submission: { label: "Temă trimisă", icon: FileCheck2 },
    quality_bonus: { label: "Bonus de calitate", icon: Sparkles },
    live_quiz: { label: "Quiz live", icon: Radio },
    practice_quiz: { label: "Quiz de exersare", icon: ListChecks },
    class_quiz: { label: "Quiz", icon: ListChecks },
    adjustment: { label: "Corectare", icon: SlidersHorizontal },
  };

export function XpSourceLabel({ source }: { source: XpSource }) {
  const { label, icon: Icon } = XP_SOURCES[source];
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {label}
    </span>
  );
}

/** Regulile de XP din PROJECT.md §10.2, pentru tabelul „Cum câștigi XP”. */
export const XP_RULES: { activity: string; xp: string }[] = [
  {
    activity: "Prezență la o întâlnire (sau recuperată la altă grupă)",
    xp: "+2",
  },
  { activity: "Temă trimisă la timp (toate problemele obligatorii)", xp: "+2" },
  { activity: "Temă trimisă după termen", xp: "0" },
  { activity: "Bonus de calitate de la mentor, pe toată tema", xp: "0–5" },
  { activity: "Quiz, prima încercare (după scor)", xp: "până la +5" },
  { activity: "Quiz refăcut (o singură dată)", xp: "+1" },
  { activity: "Quiz live, locul 1", xp: "+5" },
  { activity: "Quiz live, locul 2", xp: "+4" },
  { activity: "Quiz live, locul 3", xp: "+3" },
  { activity: "Quiz live, locul 4", xp: "+2" },
  { activity: "Quiz live, ceilalți participanți", xp: "+1" },
];
