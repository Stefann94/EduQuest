"use server";

import { z } from "zod";
import { dateKey, localToIso } from "@/components/mentor-classes/dates";
import { getClassAttendance } from "@/lib/data/queries";
import { now } from "@/lib/format";
import { DEMO_NOTE, NO_ACCESS, ownedClass } from "../../access";
import { parseSchedule } from "../../schedule";

/** XP-ul pentru o prezență (docs/PROJECT.md §10.2). */
const ATTENDANCE_XP = 2;

export type SavedMeeting = {
  id: string;
  date: string;
  topic: string;
  records: Record<string, boolean>;
};

export type AttendanceState =
  | { status: "idle" }
  | {
      status: "success";
      meeting: SavedMeeting;
      isNew: boolean;
      /** Elevi care primesc acum +2 XP (noi prezenți). */
      awarded: number;
      /** Elevi cărora li se retrag cei 2 XP (trecuți la absent). */
      revoked: number;
      note: string;
    }
  | {
      status: "error";
      message?: string;
      errors: Partial<Record<"date" | "topic", string>>;
    };

const schema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Alege data întâlnirii.")
    .refine((d) => !Number.isNaN(Date.parse(`${d}T12:00:00Z`)), {
      error: "Data nu este validă.",
    }),
  topic: z
    .string()
    .trim()
    .min(2, "Scrie pe scurt tema întâlnirii (cel puțin 2 caractere).")
    .max(80, "Tema are cel mult 80 de caractere."),
});

/**
 * Salvează prezența la o întâlnire (nouă sau corectată).
 * Fiecare elev prezent primește +2 XP o singură dată pe întâlnire: la o corectură
 * se acordă doar diferența (absent → prezent) și se retrage XP-ul pentru prezent → absent.
 * În demo, calculează rezultatul fără să salveze nimic.
 */
export async function saveAttendance(
  _prev: AttendanceState,
  formData: FormData,
): Promise<AttendanceState> {
  const classId = String(formData.get("classId") ?? "");
  const meetingId = String(formData.get("meetingId") ?? "");
  const owned = await ownedClass(classId);
  if (!owned) return { status: "error", message: NO_ACCESS, errors: {} };
  const c = owned.classRoom;
  if (c.status === "archived")
    return {
      status: "error",
      message: "Clasa este arhivată; prezența nu se mai poate modifica.",
      errors: {},
    };

  const parsed = schema.safeParse({
    date: String(formData.get("date") ?? ""),
    topic: String(formData.get("topic") ?? ""),
  });
  if (!parsed.success) {
    const errors: Partial<Record<"date" | "topic", string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as "date" | "topic";
      errors[key] ??= issue.message;
    }
    return { status: "error", errors };
  }
  const { date, topic } = parsed.data;
  if (date > dateKey(now()))
    return {
      status: "error",
      errors: {
        date: "Prezența se înregistrează doar pentru întâlniri care au avut loc.",
      },
    };

  const meetings = await getClassAttendance(c.id);
  const existing = meetingId.startsWith("nou-")
    ? demoUnsavedMeeting(meetingId, formData)
    : meetingId
      ? meetings.find((m) => m.id === meetingId)
      : undefined;
  if (meetingId && !existing)
    return {
      status: "error",
      message: "Întâlnirea nu mai există. Reîncarcă pagina.",
      errors: {},
    };
  // O singură înregistrare pe zi, ca XP-ul să nu se acorde de două ori pentru aceeași întâlnire.
  const sameDay = meetings.find(
    (m) => dateKey(m.date) === date && m.id !== existing?.id,
  );
  if (sameDay)
    return {
      status: "error",
      errors: {
        date: `Există deja prezența din această zi („${sameDay.topic}”). Corecteaz-o pe aceea.`,
      },
    };

  // Doar elevii înscriși în clasă; orice alt id trimis e ignorat.
  const present = new Set(formData.getAll("present").map(String));
  const records: Record<string, boolean> = {};
  for (const sid of c.studentIds) records[sid] = present.has(sid);

  let awarded = 0;
  let revoked = 0;
  for (const [sid, isPresent] of Object.entries(records)) {
    const was = existing?.records[sid] ?? false;
    if (isPresent && !was) awarded++;
    if (!isPresent && was) revoked++;
  }

  const time = parseSchedule(c.schedule).start || "12:00";
  return {
    status: "success",
    isNew: !existing,
    meeting: {
      id: existing?.id ?? `nou-${date}`,
      date:
        existing?.date && dateKey(existing.date) === date
          ? existing.date
          : localToIso(date, time),
      topic,
      records,
    },
    awarded,
    revoked,
    note: `${DEMO_NOTE} Fiecare prezență valorează +${ATTENDANCE_XP} XP.`,
  };
}

/**
 * Doar în demo: o întâlnire adăugată în această sesiune nu există pe server, așa că
 * pornim de la starea trimisă de formular. Cu Supabase, întâlnirea se citește din baza de date.
 */
function demoUnsavedMeeting(id: string, formData: FormData) {
  try {
    const baseline = JSON.parse(String(formData.get("baseline") ?? "{}"));
    const records: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(baseline)) records[k] = v === true;
    return { id, date: String(formData.get("baselineDate") ?? ""), records };
  } catch {
    return { id, date: "", records: {} };
  }
}
