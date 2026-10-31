import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProblemView } from "@/components/lessons/problem-view";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import { requireUser } from "@/lib/auth";
import { placeholderParams } from "@/lib/db/core";
import { getLessonForEditor } from "@/lib/db/lessons";

type Props = PageProps<"/mentor/materiale/[id]/probleme/[problema]">;

export const metadata: Metadata = { title: "Previzualizare problemă" };

export function generateStaticParams() {
  return placeholderParams("id", "problema");
}

export default function ProblemPreviewPage({ params }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton rows={4} />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { id, problema } = await params;
  const me = await requireUser("mentor");
  const lesson = await getLessonForEditor(me.id, id);
  if (!lesson) notFound();
  const problems = lesson.items.filter((i) => i.kind === "problem");
  const index = problems.findIndex((i) => i.id === problema);
  const item = problems[index];
  if (!item || item.kind !== "problem") notFound();
  const folderHref = `/mentor/materiale/${lesson.id}`;
  const href = (pid: string) => `${folderHref}/probleme/${pid}`;
  const prev = problems[index - 1];
  const next = problems[index + 1];
  return (
    <ProblemView
      itemId={item.id}
      title={item.title}
      problem={item.content}
      crumbs={[
        { href: "/mentor/materiale", title: "Foldere și materiale" },
        ...lesson.path.map((p) => ({
          href: `/mentor/materiale/${p.id}`,
          title: p.title,
        })),
        { href: folderHref, title: lesson.title },
      ]}
      folder={{ href: folderHref, title: lesson.title }}
      prev={prev ? { href: href(prev.id), title: prev.title } : undefined}
      next={next ? { href: href(next.id), title: next.title } : undefined}
      index={index}
      count={problems.length}
      editHref={folderHref}
      preview
    />
  );
}
