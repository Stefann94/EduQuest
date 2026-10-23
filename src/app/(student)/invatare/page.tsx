import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { LearningBrowser } from "@/components/student-learning/learning-browser";
import {
  getStudentClasses,
  getStudentMaterials,
  getStudentWorkedProblems,
  getViewer,
} from "@/lib/data/queries";

export const metadata: Metadata = { title: "Învățare" };

export default async function LearningPage() {
  const me = await getViewer("student");
  const [materials, problems, classes] = await Promise.all([
    getStudentMaterials(me.id),
    getStudentWorkedProblems(me.id),
    getStudentClasses(me.id),
  ]);

  // În browser trimitem doar câmpurile afișate (fără conținut, soluții sau date despre autor).
  const materialItems = materials.map((m) => ({
    id: m.id,
    classId: m.classId,
    title: m.title,
    description: m.description,
    topic: m.topic,
    kind: m.kind,
    tags: m.tags,
    publishedAt: m.publishedAt,
    className: m.className,
  }));
  const problemItems = [...problems]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .map((p) => ({
      id: p.id,
      classId: p.classId,
      title: p.title,
      topic: p.topic,
      difficulty: p.difficulty,
      publishedAt: p.publishedAt,
      className: p.className,
    }));
  const classItems = [...classes.active, ...classes.archived].map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Învățare"
        description="Lecții, fișe și probleme rezolvate din clasele tale, plus resurse globale pe care le poate folosi oricine."
      />
      <LearningBrowser
        materials={materialItems}
        problems={problemItems}
        classes={classItems}
      />
    </div>
  );
}
