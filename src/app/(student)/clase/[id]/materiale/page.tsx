import { FolderOpen, Puzzle } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { Section } from "@/components/common/section";
import { MaterialRow } from "@/components/learning/material-row";
import { SectionSkeleton } from "@/components/student-class/skeletons";
import { ProblemRow } from "@/components/student-learning/problem-row";
import { getClassMaterials } from "@/lib/data/queries";
import { plural } from "@/lib/format";
import { loadStudentClass } from "../load-class";

type Props = PageProps<"/clase/[id]/materiale">;

export const metadata: Metadata = { title: "Materialele clasei" };

export default function ClassMaterialsPage({ params }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton rows={4} />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { classRoom: c } = await loadStudentClass(params);
  const { materials, problems } = await getClassMaterials(c.id);
  const sorted = [...materials].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
  const sortedProblems = [...problems].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );

  return (
    <div className="grid gap-6">
      <Section
        title="Cursuri și materiale"
        description={
          sorted.length > 0
            ? plural(sorted.length, "material publicat", "materiale publicate")
            : undefined
        }
        bodyClassName="p-2"
      >
        {sorted.length > 0 ? (
          <ul className="stagger">
            {sorted.map((m) => (
              <li key={m.id}>
                <MaterialRow
                  material={m}
                  href={`/invatare/materiale/${m.id}`}
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={FolderOpen}
            title="Niciun material încă"
            description="Când mentorul publică lecții, fișe sau linkuri pentru clasă, le vei găsi aici."
            className="border-0"
          />
        )}
      </Section>

      <Section
        title="Probleme rezolvate"
        description="Încearcă să le rezolvi singur, apoi compară cu soluția."
        bodyClassName="p-2"
      >
        {sortedProblems.length > 0 ? (
          <ul className="stagger">
            {sortedProblems.map((p) => (
              <li key={p.id}>
                <ProblemRow problem={p} showSource={false} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Puzzle}
            title="Nicio problemă rezolvată încă"
            description="Problemele cu soluții explicate pas cu pas apar aici când le publică mentorul."
            className="border-0"
          />
        )}
      </Section>
    </div>
  );
}
