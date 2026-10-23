import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AttendanceManager } from "@/components/mentor-classes/attendance-manager";
import { dateKey } from "@/components/mentor-classes/dates";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import {
  demoIds,
  getClass,
  getClassAttendance,
  getViewer,
} from "@/lib/data/queries";
import { now } from "@/lib/format";

export const metadata: Metadata = { title: "Prezență" };

type Props = PageProps<"/mentor/clase/[id]/prezenta">;

export function generateStaticParams() {
  return demoIds.classes();
}

export default function ClassAttendancePage({ params }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton rows={5} />}>
      <Attendance params={params} />
    </Suspense>
  );
}

async function Attendance({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const me = await getViewer("mentor");
  const c = await getClass(me, id);
  if (!c) notFound();
  const meetings = await getClassAttendance(c.id);

  return (
    <div className="grid gap-4">
      <div>
        <h2 className="font-semibold text-lg">Prezență</h2>
        <p className="text-muted-foreground text-sm">
          {c.status === "archived"
            ? "Clasa este arhivată: istoricul prezenței se poate doar consulta."
            : "Înregistrează prezența după fiecare întâlnire și corecteaz-o dacă e nevoie. Elevii își văd doar propria prezență."}
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
        }))}
        initialMeetings={meetings.map((m) => ({
          id: m.id,
          date: m.date,
          topic: m.topic,
          records: m.records,
        }))}
      />
    </div>
  );
}
