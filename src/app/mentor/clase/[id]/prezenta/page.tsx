import type { Metadata } from "next";
import { Suspense } from "react";
import { AttendanceManager } from "@/components/mentor-classes/attendance-manager";
import { dateKey } from "@/components/mentor-classes/dates";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import { getClassMeetings, MAX_ABSENCES } from "@/lib/db/attendance";
import { placeholderParams } from "@/lib/db/core";
import { getClassLessons, lessonLabel } from "@/lib/db/lessons";
import { now } from "@/lib/format";
import { loadMentorClass } from "../load-class";

export const metadata: Metadata = { title: "Prezență" };

type Props = PageProps<"/mentor/clase/[id]/prezenta">;

export function generateStaticParams() {
  return placeholderParams("id");
}

export default function ClassAttendancePage({ params }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton rows={5} />}>
      <Attendance params={params} />
    </Suspense>
  );
}

async function Attendance({ params }: { params: Props["params"] }) {
  const { classRoom: c } = await loadMentorClass(params);
  const [meetings, lessons] = await Promise.all([
    getClassMeetings(c.id),
    getClassLessons(c.id, { includeHidden: true }),
  ]);
  // Lecția planificată: prima lecție a clasei care nu are încă o întâlnire.
  const done = new Set(meetings.map((m) => m.lessonId));
  const suggested = lessons.find((l) => !done.has(l.id));

  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-2xl">Prezență</h2>
        <p className="text-muted-foreground text-sm">
          {c.status === "archived"
            ? "Clasa este arhivată: istoricul prezenței se poate doar consulta."
            : `Notează prezența pe lecția făcută, după fiecare întâlnire. Cu mai mult de ${MAX_ABSENCES} absențe, elevul nu poate termina cursul.`}
        </p>
      </div>
      <AttendanceManager
        classId={c.id}
        archived={c.status === "archived"}
        today={dateKey(now())}
        students={c.students.map((s) => ({
          id: s.id,
          displayName: s.displayName,
          username: s.username,
          avatar: s.avatar,
          absences: meetings.filter((m) => m.records[s.id] === "absent").length,
        }))}
        lessons={lessons.map((l) => ({ id: l.id, label: lessonLabel(l) }))}
        suggestedLessonId={suggested?.id}
        meetings={meetings}
      />
    </div>
  );
}
