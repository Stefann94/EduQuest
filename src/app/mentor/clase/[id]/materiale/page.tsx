import { BookOpen, ChevronRight, Lightbulb, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { Section } from "@/components/common/section";
import { DifficultyBadge, PublicationBadge } from "@/components/common/status";
import {
  MATERIAL_KIND,
  MaterialKindIcon,
} from "@/components/learning/material-kind";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import { buttonVariants } from "@/components/ui/button";
import {
  demoIds,
  getClass,
  getClassMaterials,
  getViewer,
} from "@/lib/data/queries";
import { formatDay } from "@/lib/format";

export const metadata: Metadata = { title: "Materialele clasei" };

type Props = PageProps<"/mentor/clase/[id]/materiale">;

export function generateStaticParams() {
  return demoIds.classes();
}

export default function ClassMaterialsPage({ params }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <Materials params={params} />
    </Suspense>
  );
}

const rowClass =
  "group flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg px-3 py-3 outline-none transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/40";

async function Materials({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const me = await getViewer("mentor");
  const c = await getClass(me, id);
  if (!c) notFound();
  const { materials, problems } = await getClassMaterials(c.id, true);
  const sorted = [...materials].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
  const drafts =
    materials.filter((m) => m.status === "draft").length +
    problems.filter((p) => p.status === "draft").length;

  const publish = (
    <Link href="/mentor/materiale/nou" className={buttonVariants()}>
      <Plus aria-hidden="true" /> Publică material
    </Link>
  );

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-lg">Materiale</h2>
          <p className="text-muted-foreground text-sm">
            Lecțiile și problemele rezolvate ale clasei.{" "}
            {drafts > 0
              ? "Ciornele sunt vizibile doar pentru tine până le publici."
              : "Toate sunt publicate și vizibile pentru elevi."}
          </p>
        </div>
        {publish}
      </div>

      <Section title="Lecții și resurse" bodyClassName="p-2">
        {sorted.length > 0 ? (
          <ul className="stagger">
            {sorted.map((m) => (
              <li key={m.id}>
                <Link href={`/mentor/materiale/${m.id}`} className={rowClass}>
                  <MaterialKindIcon kind={m.kind} />
                  <div className="min-w-0 flex-1 basis-48">
                    <p className="truncate font-medium group-hover:text-primary">
                      {m.title}
                    </p>
                    <p className="truncate text-muted-foreground text-sm">
                      {MATERIAL_KIND[m.kind].label} · {m.topic} ·{" "}
                      {m.status === "published"
                        ? `publicat ${formatDay(m.publishedAt)}`
                        : `modificat ${formatDay(m.publishedAt)}`}
                    </p>
                  </div>
                  <PublicationBadge status={m.status} />
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="Niciun material în această clasă"
            description="Publică o lecție, un PDF, un video sau un link util pentru elevi."
            action={publish}
            className="m-3"
          />
        )}
      </Section>

      <Section title="Probleme rezolvate" bodyClassName="p-2">
        {problems.length > 0 ? (
          <ul className="stagger">
            {problems.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/mentor/materiale/probleme/${p.id}`}
                  className={rowClass}
                >
                  <span
                    aria-hidden="true"
                    className="grid size-10 shrink-0 place-items-center rounded-lg bg-xp-soft text-xp-foreground"
                  >
                    <Lightbulb className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1 basis-48">
                    <p className="truncate font-medium group-hover:text-primary">
                      {p.title}
                    </p>
                    <p className="truncate text-muted-foreground text-sm">
                      {p.topic} · {formatDay(p.publishedAt)}
                    </p>
                  </div>
                  <DifficultyBadge level={p.difficulty} />
                  <PublicationBadge status={p.status} />
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Lightbulb}
            title="Nicio problemă rezolvată"
            description="Problemele cu soluție explicată îi ajută pe elevi să exerseze singuri."
            className="m-3"
          />
        )}
      </Section>
    </div>
  );
}
