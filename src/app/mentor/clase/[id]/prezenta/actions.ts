"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { dateKey, localToIso } from "@/components/mentor-classes/dates";
import { getClassMeetings } from "@/lib/db/attendance";
import { db, isUuid } from "@/lib/db/core";
import { getClassLessons } from "@/lib/db/lessons";
import { now } from "@/lib/format";
import { NO_ACCESS, ownedClass } from "../../access";
import { parseSchedule } from "../../schedule";

export type AttendanceState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | {
      status: "error";
      message?: string;
      errors: Partial<Record<"date" | "lesson", string>>;
    };

const STATUSES = ["present", "absent", "recovered"] as const;

const schema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Alege data întâlnirii.")
    .refine((d) => !Number.isNaN(Date.parse(`${d}T12:00:00Z`)), {
      error: "Data nu este validă.",
    }),
  lessonId: z.string(),
  topic: z.string().trim().max(80, "Tema are cel mult 80 de caractere."),
});

/**
 * Salvează prezența la o întâlnire (nouă sau corectată), pe lecția planificată.
 * XP-ul îl dă baza de date (set_attendance): +2 pentru prezent sau recuperat, o singură
 * dată pe întâlnire; trecerea la absent îl retrage.
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
    lessonId: String(formData.get("lessonId") ?? ""),
    topic: String(formData.get("topic") ?? ""),
  });
  if (!parsed.success) {
    const errors: Partial<Record<"date" | "lesson", string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] === "date" ? "date" : "lesson";
      errors[key] ??= issue.message;
    }
    return { status: "error", errors };
  }
  const { date, lessonId } = parsed.data;
  if (date > dateKey(now()))
    return {
      status: "error",
      errors: {
        date: "Prezența se notează doar pentru întâlniri care au avut loc.",
      },
    };

  const [meetings, lessons] = await Promise.all([
    getClassMeetings(c.id),
    getClassLessons(c.id, { includeHidden: true }),
  ]);
  const lesson = lessons.find((l) => l.id === lessonId);
  const topic = parsed.data.topic || lesson?.title || "";
  if (!lesson && !topic)
    return {
      status: "error",
      errors: { lesson: "Alege lecția făcută la această întâlnire." },
    };
  const existing = meetingId
    ? meetings.find((m) => m.id === meetingId)
    : undefined;
  if (meetingId && !existing)
    return {
      status: "error",
      message: "Întâlnirea nu mai există. Reîncarcă pagina.",
      errors: {},
    };
  // O singură întâlnire pe zi, ca XP-ul să nu se acorde de două ori pentru aceeași zi.
  const sameDay = meetings.find(
    (m) => dateKey(m.date) === date && m.id !== existing?.id,
  );
  if (sameDay)
    return {
      status: "error",
      errors: {
        date: `Există deja prezența din această zi („${sameDay.lessonTitle ?? sameDay.topic}”). Corecteaz-o pe aceea.`,
      },
    };

  // Doar elevii înscriși; orice alt id trimis e ignorat.
  const records: Record<string, (typeof STATUSES)[number]> = {};
  for (const sid of c.studentIds) {
    const v = String(formData.get(`status:${sid}`) ?? "present");
    records[sid] = (STATUSES as readonly string[]).includes(v)
      ? (v as (typeof STATUSES)[number])
      : "present";
  }

  const supabase = await db();
  const time = parseSchedule(c.schedule).start || "12:00";
  const row = {
    class_id: c.id,
    date:
      existing && dateKey(existing.date) === date
        ? existing.date
        : localToIso(date, time),
    topic,
    lesson_id: lesson && isUuid(lesson.id) ? lesson.id : null,
  };
  const saved = existing
    ? await supabase
        .from("attendance_meetings")
        .update(row)
        .eq("id", existing.id)
        .select("id")
        .single()
    : await supabase
        .from("attendance_meetings")
        .insert(row)
        .select("id")
        .single();
  if (saved.error || !saved.data)
    return {
      status: "error",
      message: "Întâlnirea nu s-a putut salva. Încearcă din nou.",
      errors: {},
    };

  const { error } = await supabase.rpc("set_attendance", {
    p_meeting: saved.data.id,
    p_records: records,
  });
  if (error)
    return {
      status: "error",
      message: "Prezența nu s-a putut salva. Încearcă din nou.",
      errors: {},
    };

  revalidatePath(`/mentor/clase/${c.id}`, "layout");
  const absent = Object.values(records).filter((s) => s === "absent").length;
  return {
    status: "success",
    message: `${existing ? "Prezența a fost corectată" : "Prezența a fost salvată"}: ${
      c.studentIds.length - absent
    } din ${c.studentIds.length} prezenți (+2 XP fiecare).`,
  };
}
