import {
  CalendarDays,
  CalendarPlus,
  CircleDot,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Section } from "@/components/common/section";
import { UserAvatar } from "@/components/common/user-avatar";
import { SectionSkeleton } from "@/components/student-class/skeletons";
import { formatDate, plural } from "@/lib/format";
import { loadStudentClass } from "../load-class";

type Props = PageProps<"/clase/[id]/informatii">;

export const metadata: Metadata = { title: "Informații despre clasă" };

export default function ClassInfoPage({ params }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton rows={2} />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { classRoom: c } = await loadStudentClass(params);

  const rows = [
    {
      icon: UserRound,
      label: "Mentor",
      value: (
        <span className="inline-flex items-center gap-2">
          <UserAvatar
            name={c.mentor.displayName}
            avatar={c.mentor.avatar}
            size="xs"
          />
          {c.mentor.displayName}
        </span>
      ),
    },
    { icon: CalendarDays, label: "Program", value: c.schedule },
    {
      icon: Users,
      label: "Membri",
      value: plural(c.studentIds.length, "elev", "elevi"),
    },
    {
      icon: CalendarPlus,
      label: "Creată pe",
      value: formatDate(c.createdAt),
    },
    {
      icon: CircleDot,
      label: "Stare",
      value: c.status === "active" ? "Activă" : "Arhivată",
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Section title="Despre clasă" className="lg:col-span-2">
        <p className="max-w-prose leading-relaxed">{c.description}</p>
        <dl className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-2">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground"
              >
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 text-sm">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 font-medium">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </Section>

      <section className="h-fit rounded-xl border bg-card p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-success" aria-hidden="true" />
          <h2 className="font-semibold">Confidențialitate</h2>
        </div>
        <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
          Informațiile clasei sunt vizibile doar membrilor ei. Colegii văd doar
          numele afișat, avatarul și XP-ul tău din clasament, niciodată emailul
          sau alte date de cont.
        </p>
      </section>
    </div>
  );
}
