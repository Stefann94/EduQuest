"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { dateKey, localToIso } from "@/components/mentor-classes/dates";
import { getClassMeetings } from "@/lib/db/attendance";
import { db, isUuid } from "@/lib/db/core";
import { getClassLessons } from "@/lib/db/lessons";
import { formatWeekday, now } from "@/lib/format";
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

// „none”: elevul nu e trecut la această întâlnire (ex. a fost bifat din greșeală).
const STATUSES = ["present", "absent", "recovered", "none"] as const;

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
  // O singură prezență pe lecție (o lecție se face o dată cu o clasă).
  const sameLesson = lesson
    ? meetings.find((m) => m.lessonId === lesson.id && m.id !== existing?.id)
    : undefined;
  if (sameLesson)
    return {
      status: "error",
      errors: {
        lesson: `Lecția are deja prezența notată (${formatWeekday(sameLesson.date)}). Corecteaz-o sau șterge-o pe aceea.`,
      },
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
  if (saved.error?.code === "23505")
    return {
      status: "error",
      errors: { lesson: "Lecția are deja prezența notată." },
    };
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
  const marked = Object.values(records).filter((s) => s !== "none");
  const attended = marked.filter((s) => s !== "absent").length;
  return {
    status: "success",
    message: `${existing ? "Prezența a fost corectată" : "Prezența a fost salvată"}: ${attended} din ${marked.length} prezenți (+2 XP fiecare).`,
  };
}

export type AttendanceResult = { ok: boolean; message: string };

async function ownedMeeting(classId: string, meetingId: string) {
  const owned = await ownedClass(classId);
  if (!owned) return { error: NO_ACCESS };
  if (owned.classRoom.status === "archived")
    return { error: "Clasa este arhivată; prezența nu se mai poate modifica." };
  const meeting = (await getClassMeetings(classId)).find(
    (m) => m.id === meetingId,
  );
  if (!meeting) return { error: "Întâlnirea nu mai există. Reîncarcă pagina." };
  return { meeting };
}

/** Șterge toată întâlnirea (lecția greșită, dublură…), cu prezențele și XP-ul ei. */
export async function deleteMeeting(
  classId: string,
  meetingId: string,
): Promise<AttendanceResult> {
  const r = await ownedMeeting(classId, meetingId);
  if (!r.meeting) return { ok: false, message: r.error };
  const supabase = await db();
  const { error } = await supabase.rpc("delete_attendance_meeting", {
    p_meeting: meetingId,
  });
  if (error)
    return {
      ok: false,
      message: "Întâlnirea nu s-a putut șterge. Încearcă din nou.",
    };
  revalidatePath(`/mentor/clase/${classId}`, "layout");
  return {
    ok: true,
    message: `Prezența pentru „${r.meeting.lessonTitle ?? r.meeting.topic}” a fost ștearsă.`,
  };
}

/** Scoate un elev trecut din greșeală la o întâlnire (dispare și XP-ul lui de prezență). */
export async function removeFromMeeting(
  classId: string,
  meetingId: string,
  studentId: string,
): Promise<AttendanceResult> {
  const r = await ownedMeeting(classId, meetingId);
  if (!r.meeting) return { ok: false, message: r.error };
  if (!isUuid(studentId) || !r.meeting.records[studentId])
    return { ok: false, message: "Elevul nu e trecut la această întâlnire." };
  const supabase = await db();
  const { error } = await supabase.rpc("set_attendance", {
    p_meeting: meetingId,
    p_records: { [studentId]: "none" },
  });
  if (error)
    return { ok: false, message: "Nu s-a putut șterge. Încearcă din nou." };
  revalidatePath(`/mentor/clase/${classId}`, "layout");
  return { ok: true, message: "Elevul a fost scos de la această întâlnire." };
}
