import { CalendarCheck, CalendarX2, CheckCircle2, Info } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { Section } from "@/components/common/section";
import { StatusBadge } from "@/components/common/status";
import { SectionSkeleton } from "@/components/student-class/skeletons";
import { Progress } from "@/components/ui/progress";
import { getClassAttendanceForStudent } from "@/lib/data/student-class-queries";
import { formatWeekday, plural } from "@/lib/format";
import { loadStudentClass } from "../load-class";

type Props = PageProps<"/clase/[id]/prezenta">;

export const metadata: Metadata = { title: "Prezența mea" };

export default function ClassAttendancePage({ params }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton rows={4} />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { viewer, classRoom: c } = await loadStudentClass(params);
  const { meetings, attended, total } = await getClassAttendanceForStudent(
    viewer.id,
    c.id,
  );

  if (total === 0)
    return (
      <EmptyState
        icon={CalendarCheck}
        title="Nicio întâlnire înregistrată"
        description="După fiecare întâlnire, mentorul notează prezența și o vei vedea aici."
      />
    );

  const rate = Math.round((attended / total) * 100);

  return (
    <div className="grid gap-6">
      <section
        aria-label="Rezumatul prezenței"
        className="grid gap-5 rounded-xl border bg-card p-5 shadow-xs"
      >
        <dl className="grid grid-cols-3 gap-4">
          <div>
            <dt className="text-muted-foreground text-sm">Prezent</dt>
            <dd className="font-semibold text-2xl tabular-nums">
              {attended}
              <span className="font-normal text-base text-muted-foreground">
                {" "}
                din {total}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">Absent</dt>
            <dd className="font-semibold text-2xl tabular-nums">
              {total - attended}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">Rata de prezență</dt>
            <dd className="font-semibold text-2xl tabular-nums">{rate}%</dd>
          </div>
        </dl>
        <Progress
          value={rate}
          aria-label="Rata de prezență"
          className="[&_[data-slot=progress-indicator]]:bg-success [&_[data-slot=progress-track]]:h-2"
        />
        <p className="flex items-start gap-2 text-muted-foreground text-sm">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Prezența este notată de mentor. Fiecare întâlnire la care participi
          îți aduce XP. Dacă observi o greșeală, spune-i mentorului.
        </p>
      </section>

      <Section
        title="Întâlnirile clasei"
        description={plural(total, "întâlnire", "întâlniri")}
        bodyClassName="p-2"
      >
        <ul className="stagger divide-y">
          {meetings.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 py-3"
            >
              <div className="min-w-0">
                <p className="font-medium">{m.topic}</p>
                <p className="text-muted-foreground text-sm">
                  {formatWeekday(m.date)}
                </p>
              </div>
              {m.present ? (
                <StatusBadge icon={CheckCircle2} tone="success">
                  Prezent
                </StatusBadge>
              ) : (
                <StatusBadge icon={CalendarX2} tone="neutral">
                  Absent
                </StatusBadge>
              )}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
