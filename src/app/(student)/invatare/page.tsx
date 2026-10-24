import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { CourseCard } from "@/components/learning/course-card";
import { LearningBrowser } from "@/components/student-learning/learning-browser";
import { getCourses } from "@/lib/data/course-queries";
import {
  getStudentClasses,
  getStudentMaterials,
  getStudentWorkedProblems,
  getViewer,
} from "@/lib/data/queries";

export const metadata: Metadata = { title: "Învățare" };

export default async function LearningPage() {
  const me = await getViewer("student");
  const [courses, materials, problems, classes] = await Promise.all([
    getCourses(),
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
        description="Cursuri pas cu pas, lecții, fișe și probleme rezolvate din clasele tale, plus resurse pentru toți elevii."
      />
      {courses.length > 0 ? (
        <section aria-labelledby="cursuri" className="grid gap-4">
          <h2
            id="cursuri"
            className="flex items-center gap-3 font-extrabold text-[28px] leading-none"
          >
            <span
              aria-hidden="true"
              className="size-3.5 rotate-45 bg-primary"
            />
            Cursuri
          </h2>
          <ul className="grid gap-4">
            {courses.map((c) => (
              <li key={c.id}>
                <CourseCard course={c} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <LearningBrowser
        materials={materialItems}
        problems={problemItems}
        classes={classItems}
      />
    </div>
  );
}
