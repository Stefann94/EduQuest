// Ce tipuri de notificări ascunde fiecare preferință din Setări. Preferințele stau pe
// profil (profiles.notification_prefs); o cheie lipsă înseamnă „da, arată-le”.

import type { NotificationKind } from "./data/types";

export const PREF_KINDS = {
  assignments: ["assignment_new"],
  deadlines: ["deadline"],
  feedback: ["feedback", "needs_changes"],
  materials: ["material_new"],
  liveQuiz: ["live_quiz"],
  submissions: ["submission_new"],
  resubmissions: ["resubmission"],
  classActivity: ["application"],
} as const satisfies Record<string, readonly NotificationKind[]>;

export type PrefKey = keyof typeof PREF_KINDS;
export type NotificationPrefs = Partial<Record<PrefKey, boolean>>;

/** Tipurile de notificări pe care utilizatorul a ales să nu le vadă. */
export function hiddenKinds(prefs: NotificationPrefs): Set<NotificationKind> {
  const out = new Set<NotificationKind>();
  for (const [key, kinds] of Object.entries(PREF_KINDS))
    if (prefs[key as PrefKey] === false) for (const k of kinds) out.add(k);
  return out;
}

export function readPrefs(raw: unknown): NotificationPrefs {
  if (!raw || typeof raw !== "object") return {};
  const out: NotificationPrefs = {};
  for (const key of Object.keys(PREF_KINDS) as PrefKey[]) {
    const v = (raw as Record<string, unknown>)[key];
    if (typeof v === "boolean") out[key] = v;
  }
  return out;
}
