import { CalendarDays, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { ClassNav } from "@/components/mentor-classes/class-nav";
import { ClassStatusBadge } from "@/components/mentor-classes/class-status";
import { ClassHeaderSkeleton } from "@/components/mentor-classes/skeletons";
import { requireUser } from "@/lib/auth";
import { getClass } from "@/lib/db/classes";
import { placeholderParams } from "@/lib/db/core";
import { plural } from "@/lib/format";

type Props = LayoutProps<"/mentor/clase/[id]">;

export function generateStaticParams() {
  return placeholderParams("id");
}

export default function MentorClassLayout({ params, children }: Props) {
  return (
    <div className="grid gap-6">
      <Suspense fallback={<ClassHeaderSkeleton />}>
        <ClassHeader params={params} />
      </Suspense>
      {children}
    </div>
  );
}

async function ClassHeader({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const me = await requireUser("mentor");
  const c = await getClass(id);
  if (!c || c.mentorId !== me.id) notFound();

  return (
    <div className="grid gap-5">
      <PageHeader
        title={c.name}
        back={{ href: "/mentor/clase", label: "Clasele mele" }}
        meta={
          <>
            <ClassStatusBadge status={c.status} />
            <span className="inline-flex items-center gap-1.5 text-muted-foreground text-sm">
              <CalendarDays className="size-4" aria-hidden="true" />
              {c.schedule}
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground text-sm">
              <Users className="size-4" aria-hidden="true" />
              {plural(c.studentIds.length, "elev", "elevi")}
            </span>
          </>
        }
      />
      <ClassNav classId={c.id} />
    </div>
  );
}
