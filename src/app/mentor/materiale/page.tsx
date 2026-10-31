import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { LessonLibrary } from "@/components/lesson-editor/lesson-library";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getMentorClasses } from "@/lib/db/classes";
import { getClassLessons, getMentorLessons } from "@/lib/db/lessons";

export const metadata: Metadata = { title: "Lecții și materiale" };

export default function MentorMaterialsPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Lecții și materiale"
        description="Biblioteca ta: fiecare lecție are materiale (lecție scrisă, PDF, link, video, probleme) și poate fi folosită în mai multe clase."
        actions={
          <Link
            href="/mentor/materiale/nou"
            className={buttonVariants({ variant: "cta" })}
          >
            <Plus aria-hidden="true" /> Lecție nouă
          </Link>
        }
      />
      <Suspense fallback={<SectionSkeleton rows={6} />}>
        <Library />
      </Suspense>
    </div>
  );
}

async function Library() {
  const me = await requireUser("mentor");
  const [lessons, classes] = await Promise.all([
    getMentorLessons(me.id),
    getMentorClasses(me.id),
  ]);
  const all = [...classes.active, ...classes.archived];
  const names = new Map(all.map((c) => [c.id, c.name]));
  const perClass = await Promise.all(
    all.map(async (c) => ({
      id: c.id,
      name: c.name,
      lessons: (await getClassLessons(c.id, { includeHidden: true })).map(
        (l) => ({
          id: l.id,
          number: l.number,
          label: l.title,
          published: l.published,
          items: l.items.length,
        }),
      ),
    })),
  );

  // Un subfolder ține de clasele folderului lui de pe primul nivel.
  const byId = new Map(lessons.map((l) => [l.id, l]));
  const chain = (id: string) => {
    const out = [];
    for (
      let cur = byId.get(id);
      cur && out.length < 5;
      cur = cur.parentId ? byId.get(cur.parentId) : undefined
    )
      out.unshift(cur);
    return out;
  };

  return (
    <LessonLibrary
      lessons={lessons.map((l) => {
        const path = chain(l.id);
        const root = path[0] ?? l;
        return {
          id: l.id,
          parentId: l.parentId,
          path: path.map((x) => x.title).join(" › "),
          title: l.title,
          summary: l.summary,
          items: l.items.map((i) => ({
            id: i.id,
            kind: i.kind,
            title: i.title,
            published: i.published,
          })),
          classes: root.classes
            .map((c) => ({
              classId: c.classId,
              className: names.get(c.classId) ?? "Clasă",
              number: c.number,
              published: c.published,
            }))
            .sort((a, b) => a.className.localeCompare(b.className, "ro")),
        };
      })}
      classes={perClass}
    />
  );
}
