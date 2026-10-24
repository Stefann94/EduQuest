import "server-only";
import type { Database } from "@/lib/supabase/database.types";
import { db, isUuid, must } from "./core";

export type AttendanceStatus = Database["public"]["Enums"]["attendance_status"];

/** Cu mai mult de atâtea absențe (nerecuperate), elevul nu poate termina cursul. */
export const MAX_ABSENCES = 2;

export type Meeting = {
  id: string;
  date: string;
  topic: string;
  lessonId: string | null;
  lessonTitle: string | null;
  /** id elev → stare; lipsește dacă prezența nu a fost încă marcată. */
  records: Record<string, AttendanceStatus>;
};

/** Întâlnirile unei clase, cele mai noi primele (mentorul vede toate prezențele). */
export async function getClassMeetings(classId: string): Promise<Meeting[]> {
  if (!isUuid(classId)) return [];
  const supabase = await db();
  const rows = must(
    "Prezența",
    await supabase
      .from("attendance_meetings")
      .select(
        "id, date, topic, lesson_id, lesson:lessons!attendance_meetings_lesson_id_fkey(title), attendance_records(student_id, status)",
      )
      .eq("class_id", classId)
      .order("date", { ascending: false }),
  );
  return rows.map((m) => ({
    id: m.id,
    date: m.date,
    topic: m.topic,
    lessonId: m.lesson_id,
    lessonTitle: m.lesson?.title ?? null,
    records: Object.fromEntries(
      m.attendance_records.map((r) => [r.student_id, r.status]),
    ),
  }));
}

export type StudentAttendance = {
  meetings: {
    id: string;
    date: string;
    topic: string;
    status: AttendanceStatus;
  }[];
  present: number;
  recovered: number;
  absent: number;
  total: number;
  /** Prezent sau recuperat. */
  attended: number;
  /** Mai mult de MAX_ABSENCES absențe: nu mai poate termina cursul. */
  blocked: boolean;
};

export function summarizeAttendance(
  meetings: StudentAttendance["meetings"],
): StudentAttendance {
  const count = (s: AttendanceStatus) =>
    meetings.filter((m) => m.status === s).length;
  const absent = count("absent");
  return {
    meetings,
    present: count("present"),
    recovered: count("recovered"),
    absent,
    total: meetings.length,
    attended: meetings.length - absent,
    blocked: absent > MAX_ABSENCES,
  };
}

/** Prezența elevului, pe clase (doar întâlnirile la care a fost marcat). */
export async function getStudentAttendance(studentId: string) {
  const supabase = await db();
  const rows = must(
    "Prezența",
    await supabase
      .from("attendance_records")
      .select(
        "status, meeting:attendance_meetings!attendance_records_meeting_id_fkey(id, class_id, date, topic)",
      )
      .eq("student_id", studentId),
  );
  const byClass = new Map<string, StudentAttendance["meetings"]>();
  for (const r of rows) {
    if (!r.meeting) continue;
    const list = byClass.get(r.meeting.class_id) ?? [];
    list.push({
      id: r.meeting.id,
      date: r.meeting.date,
      topic: r.meeting.topic,
      status: r.status,
    });
    byClass.set(r.meeting.class_id, list);
  }
  return new Map(
    [...byClass].map(([cid, list]) => [
      cid,
      summarizeAttendance(list.sort((a, b) => b.date.localeCompare(a.date))),
    ]),
  );
}

export async function getClassAttendanceForStudent(
  studentId: string,
  classId: string,
) {
  return (
    (await getStudentAttendance(studentId)).get(classId) ??
    summarizeAttendance([])
  );
}
