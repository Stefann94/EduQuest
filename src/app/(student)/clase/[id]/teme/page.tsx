import { Circle, CircleDot, ClipboardList } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AssignmentRow } from "@/components/assignments/assignment-row";
import { EmptyState } from "@/components/common/empty-state";
import { SectionSkeleton } from "@/components/student-class/skeletons";
import {
  getClassAssignmentsForStudent,
  type StudentAssignment,
} from "@/lib/data/queries";
import { plural } from "@/lib/format";
import { cn } from "@/lib/utils";
import { loadStudentClass } from "../load-class";

type Props = PageProps<"/clase/[id]/teme">;

export const metadata: Metadata = { title: "Temele clasei" };

export default function ClassAssignmentsPage({ params }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton rows={4} />}>
      <Content params={params} />
    </Suspense>
  );
}

const byDeadline = (a: StudentAssignment, b: StudentAssignment) =>
  (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999");

async function Content({ params }: { params: Props["params"] }) {
  const { viewer, classRoom: c } = await loadStudentClass(params);
  const all = await getClassAssignmentsForStudent(c.id, viewer.id);
  const required = all.filter((a) => a.type === "required").sort(byDeadline);
  const optional = all.filter((a) => a.type === "optional").sort(byDeadline);

  if (all.length === 0)
    return (
      <EmptyState
        icon={ClipboardList}
        title="Nicio temă publicată"
        description="Când mentorul publică o temă pentru această clasă, o vei vedea aici."
      />
    );

  return (
    <div className="grid gap-8">
      <Group
        id="teme-obligatorii"
        title="Obligatorii"
        description="Temele de bază ale clasei. Încearcă să le trimiți până la termen."
        icon={CircleDot}
        emphasis
        items={required}
        empty="Nicio temă obligatorie în această clasă."
      />
      <Group
        id="teme-optionale"
        title="Opționale"
        description="Pentru exersare în plus, în ritmul tău."
        icon={Circle}
        items={optional}
        empty="Nicio temă opțională în această clasă."
      />
    </div>
  );
}

function Group({
  id: headingId,
  title,
  description,
  icon: Icon,
  emphasis,
  items,
  empty,
}: {
  id: string;
  title: string;
  description: string;
  icon: typeof Circle;
  emphasis?: boolean;
  items: StudentAssignment[];
  empty: string;
}) {
  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "grid gap-3",
        emphasis && "border-primary border-l-2 pl-4 sm:pl-5",
      )}
    >
      <div className="flex items-start gap-2.5">
        <Icon
          className={cn(
            "mt-0.5 size-[18px] shrink-0",
            emphasis ? "text-primary" : "text-muted-foreground",
          )}
          aria-hidden="true"
        />
        <div>
          <h2 id={headingId} className="font-semibold text-base">
            {title}{" "}
            <span className="font-normal text-muted-foreground text-sm">
              ({plural(items.length, "temă", "teme")})
            </span>
          </h2>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
      {items.length > 0 ? (
        <ul className="stagger grid gap-2">
          {items.map((a) => (
            <li key={a.id}>
              <AssignmentRow assignment={a} showClass={false} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed px-4 py-5 text-center text-muted-foreground text-sm">
          {empty}
        </p>
      )}
    </section>
  );
}
