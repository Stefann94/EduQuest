import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MembersTable } from "@/components/mentor-classes/members-table";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import { getClassMembers } from "@/lib/data/mentor-class-queries";
import { demoIds, getClass, getViewer } from "@/lib/data/queries";
import { plural } from "@/lib/format";

export const metadata: Metadata = { title: "Membrii clasei" };

type Props = PageProps<"/mentor/clase/[id]/membri">;

export function generateStaticParams() {
  return demoIds.classes();
}

export default function ClassMembersPage({ params }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton rows={6} />}>
      <Members params={params} />
    </Suspense>
  );
}

async function Members({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const me = await getViewer("mentor");
  const c = await getClass(me, id);
  if (!c) notFound();
  const members = await getClassMembers(me.id, c.id);

  return (
    <div className="grid gap-4">
      <div>
        <h2 className="font-semibold text-lg">Membri</h2>
        <p className="text-muted-foreground text-sm">
          {plural(members.length, "elev înscris", "elevi înscriși")}. Elevii se
          văd între ei doar după numele afișat; adresele de email nu apar
          nicăieri în clasă.
        </p>
      </div>
      <MembersTable
        classId={c.id}
        className={c.name}
        canRemove={c.status === "active"}
        rows={members.map((m) => ({
          id: m.student.id,
          displayName: m.student.displayName,
          username: m.student.username,
          avatar: m.student.avatar,
          xp: m.xp,
          attended: m.attended,
          meetings: m.meetings,
          attendanceRate: m.attendanceRate,
          submitted: m.submitted,
          assignments: m.assignments,
        }))}
      />
    </div>
  );
}
