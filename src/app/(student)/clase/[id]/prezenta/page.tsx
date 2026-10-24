import { CalendarCheck, Info, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { Section } from "@/components/common/section";
import { AttendanceBadge } from "@/components/common/status";
import { SectionSkeleton } from "@/components/student-class/skeletons";
import { Progress } from "@/components/ui/progress";
import {
  getClassAttendanceForStudent,
  MAX_ABSENCES,
} from "@/lib/db/attendance";
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
  const a = await getClassAttendanceForStudent(viewer.id, c.id);

  if (a.total === 0)
    return (
      <EmptyState
        icon={CalendarCheck}
        title="Nicio întâlnire înregistrată"
        description="După fiecare întâlnire, mentorul notează prezența și o vei vedea aici."
      />
    );

  const rate = Math.round((a.attended / a.total) * 100);
  const left = MAX_ABSENCES - a.absent;

  return (
    <div className="grid gap-6">
      {a.blocked ? (
        <div
          role="alert"
          className="flex cut-sm items-start gap-3 bg-danger-soft px-4 py-3 text-sm"
        >
          <TriangleAlert
            className="mt-0.5 size-4 shrink-0 text-destructive"
            aria-hidden="true"
          />
          <p>
            <span className="font-semibold">Ai {a.absent} absențe.</span> Cu mai
            mult de {MAX_ABSENCES} absențe nu poți termina cursul. Vorbește cu
            mentorul despre cum poți recupera lecțiile pierdute la altă grupă.
          </p>
        </div>
      ) : a.absent > 0 ? (
        <div className="flex cut-sm items-start gap-3 bg-warning-soft px-4 py-3 text-sm">
          <Info
            className="mt-0.5 size-4 shrink-0 text-warning"
            aria-hidden="true"
          />
          <p>
            {left === 0
              ? `Ai ${a.absent} absențe: încă una și nu mai poți termina cursul.`
              : `Ai ${plural(a.absent, "absență", "absențe")}. Poți lipsi de cel mult ${MAX_ABSENCES} ori ca să termini cursul.`}{" "}
            O lecție pierdută se poate recupera la altă grupă.
          </p>
        </div>
      ) : null}

      <section
        aria-label="Rezumatul prezenței"
        className="grid cut gap-5 bg-card p-5"
      >
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Prezent" value={a.present} />
          <Stat label="Recuperat" value={a.recovered} />
          <Stat label="Absent" value={a.absent} />
          <Stat label="Rata de prezență" value={`${rate}%`} />
        </dl>
        <Progress
          value={rate}
          aria-label="Rata de prezență"
          className="[&_[data-slot=progress-indicator]]:bg-success [&_[data-slot=progress-track]]:h-2"
        />
        <p className="flex items-start gap-2 text-muted-foreground text-sm">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Prezența o notează mentorul. „Recuperat” înseamnă că ai făcut lecția
          cu altă grupă: contează ca prezență și îți aduce tot +2 XP.
        </p>
      </section>

      <Section
        title="Întâlnirile clasei"
        description={plural(a.total, "întâlnire", "întâlniri")}
        bodyClassName="p-2"
      >
        <ul className="stagger divide-y">
          {a.meetings.map((m) => (
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
              <AttendanceBadge status={m.status} />
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="font-bold font-heading text-3xl tabular-nums">{value}</dd>
    </div>
  );
}
