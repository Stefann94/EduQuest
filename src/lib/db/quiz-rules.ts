// Regulile de XP ale quiz-urilor (aceleași ca în submit_quiz din baza de date), fără
// acces la date: se folosesc și în browser, ca elevul să știe ce poate câștiga.

/** XP-ul pe care îl mai poate primi elevul: prima încercare după scor, a doua +1, apoi nimic. */
export function xpOutlook(xp: number, attempts: number) {
  if (attempts === 0) return { kind: "first" as const, max: xp };
  if (attempts === 1) return { kind: "retake" as const, max: 1 };
  return { kind: "none" as const, max: 0 };
}

export type XpOutlook = ReturnType<typeof xpOutlook>;
