import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  PartyPopper,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { AssignmentTypeBadge } from "@/components/common/status";
import { HomeworkArchive } from "@/components/homework/homework-archive";
import {
  HomeworkProgress,
  HomeworkRow,
} from "@/components/homework/homework-row";
import { SectionSkeleton } from "@/components/student-class/skeletons";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireUser } from "@/lib/auth";
import { getStudentHomework, type StudentHomework } from "@/lib/db/homework";
import { formatDateTime, relativeDays } from "@/lib/format";

export const metadata: Metadata = { title: "Teme" };

export default function HomeworkPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Teme"
        description="Temele din toate clasele tale. Fiecare temă are una sau mai multe probleme; le trimiți pe rând și le poți retrimite."
      />
      <Suspense fallback={<SectionSkeleton rows={5} />}>
        <Content />
      </Suspense>
    </div>
  );
}

async function Content() {
  const me = await requireUser("student");
  const all = await getStudentHomework(me.id);
  const now = Date.now();
  const isArchived = (h: StudentHomework) =>
    !!h.deadline && Date.parse(h.deadline) < now;
  const current = all.filter((h) => !isArchived(h));
  const archive = all.filter(isArchived).reverse();
  const focus =
    current.find((h) => h.required && !h.complete) ??
    current.find((h) => !h.complete);
  const required = current.filter((h) => h.required);
  const optional = current.filter((h) => !h.required);

  if (all.length === 0)
    return (
      <EmptyState
        icon={ClipboardList}
        title="Nicio temă încă"
        description="Când mentorul dă o temă clasei tale, o vei găsi aici."
      />
    );

  return (
    <div className="grid gap-6">
      {focus ? <CurrentHomework homework={focus} /> : <AllDone />}

      <Tabs defaultValue="required">
        <TabsList>
          <TabsTrigger value="required">
            Obligatorii ({required.length})
          </TabsTrigger>
          <TabsTrigger value="optional">
            Opționale ({optional.length})
          </TabsTrigger>
          <TabsTrigger value="archive">Arhivă ({archive.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="required" className="mt-4">
          <HomeworkList
            items={required}
            empty="Nicio temă obligatorie în desfășurare."
          />
        </TabsContent>
        <TabsContent value="optional" className="mt-4">
          <HomeworkList
            items={optional}
            empty="Nicio temă opțională acum. Când mentorul dă una, o găsești aici."
          />
        </TabsContent>
        <TabsContent value="archive" className="mt-4">
          <HomeworkArchive items={archive} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function HomeworkList({
  items,
  empty,
}: {
  items: StudentHomework[];
  empty: string;
}) {
  if (items.length === 0)
    return (
      <p className="cut-sm bg-card px-4 py-6 text-center text-muted-foreground text-sm">
        {empty}
      </p>
    );
  return (
    <ul className="stagger grid gap-2">
      {items.map((h) => (
        <li key={h.id}>
          <HomeworkRow homework={h} />
        </li>
      ))}
    </ul>
  );
}

/** Tema la care e bine să lucreze elevul acum: cea mai apropiată de termen, nefinalizată. */
function CurrentHomework({ homework: h }: { homework: StudentHomework }) {
  return (
    <section
      aria-labelledby="tema-curenta"
      className="relative grid cut gap-4 overflow-hidden bg-foreground p-6 text-background sm:grid-cols-[1fr_auto] sm:items-center"
    >
      <div className="min-w-0">
        <p className="font-bold font-heading text-background/70 text-xs uppercase tracking-[0.2em]">
          Tema curentă · {h.className}
        </p>
        <h2 id="tema-curenta" className="mt-1 text-3xl leading-tight">
          {h.title}
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-background/80 text-sm">
          <AssignmentTypeBadge type={h.required ? "required" : "optional"} />
          {h.deadline ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-4" aria-hidden="true" />
              Termen {formatDateTime(h.deadline)} ({relativeDays(h.deadline)})
            </span>
          ) : (
            <span>Fără termen</span>
          )}
        </div>
        <ol className="mt-4 flex flex-wrap gap-2">
          {h.problems.map((p, i) => (
            <li
              key={p.id}
              className={
                p.state === "not_started"
                  ? "slant bg-background/10 px-3 py-1 text-sm"
                  : "slant bg-success px-3 py-1 text-sm text-white"
              }
            >
              {i + 1}. {p.title}
              <span className="sr-only">
                {p.state === "not_started" ? " (netrimisă)" : " (trimisă)"}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="grid justify-items-start gap-4 sm:justify-items-end">
        <HomeworkProgress
          done={h.progress.done}
          total={h.progress.total}
          className="[&_p]:text-2xl [&>div]:w-40 [&>div]:bg-background/15"
        />
        <Link
          href={`/teme/${h.id}`}
          className={buttonVariants({ variant: "cta", size: "lg" })}
        >
          Lucrează la temă <ArrowRight />
        </Link>
      </div>
    </section>
  );
}

function AllDone() {
  return (
    <section className="flex cut items-center gap-4 bg-success-soft p-5">
      <PartyPopper
        className="size-8 shrink-0 text-success"
        aria-hidden="true"
      />
      <div>
        <h2 className="text-xl">Ești la zi</h2>
        <p className="text-muted-foreground text-sm">
          Ai trimis toate temele în desfășurare. Poți reciti lecțiile sau exersa
          cu un quiz.
        </p>
      </div>
    </section>
  );
}
