import { ArrowLeft, ArrowRight, ChevronRight, FolderOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { FolderList } from "@/components/lessons/folder-list";
import { LessonNumber, LessonTitle } from "@/components/lessons/lesson-card";
import { LessonItemSection } from "@/components/lessons/lesson-item-view";
import { ProblemCard } from "@/components/lessons/problem-card";
import { DetailSkeleton } from "@/components/student-class/skeletons";
import { buttonVariants } from "@/components/ui/button";
import { placeholderParams } from "@/lib/db/core";
import { getClassFolder, lessonLabel } from "@/lib/db/lessons";
import { loadStudentClass } from "../../load-class";

type Props = PageProps<"/clase/[id]/lectii/[lectie]">;

export const metadata: Metadata = { title: "Materiale" };

export function generateStaticParams() {
  return placeholderParams("lectie");
}

export default function ClassFolderPage({ params }: Props) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { lectie } = await params;
  const { classRoom: c } = await loadStudentClass(params);
  const data = await getClassFolder(c.id, lectie);
  if (!data) notFound();
  const { root, lessons, path, folder } = data;
  const base = `/clase/${c.id}/lectii`;
  const problems = folder.items.filter((i) => i.kind === "problem");
  const others = folder.items.filter((i) => i.kind !== "problem");
  const index = lessons.findIndex((l) => l.id === root.id);
  const prev = folder.isRoot ? lessons[index - 1] : undefined;
  const next = folder.isRoot ? lessons[index + 1] : undefined;
  const parent =
    path.at(-1) ??
    (folder.isRoot ? undefined : { id: root.id, title: lessonLabel(root) });

  return (
    <article className="grid gap-8">
      {/* Calea până la folder: Materiale › Lecția 3 › Subfolder */}
      <nav aria-label="Unde ești" className="text-sm">
        <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
          <li>
            <Link href={base} className="hover:text-foreground hover:underline">
              Materiale
            </Link>
          </li>
          {!folder.isRoot ? (
            <>
              <li aria-hidden="true">
                <ChevronRight className="size-3.5" />
              </li>
              <li>
                <Link
                  href={`${base}/${root.id}`}
                  className="hover:text-foreground hover:underline"
                >
                  {lessonLabel(root)}
                </Link>
              </li>
            </>
          ) : null}
          {path.map((p) => (
            <li key={p.id} className="flex items-center gap-1">
              <ChevronRight className="size-3.5" aria-hidden="true" />
              <Link
                href={`${base}/${p.id}`}
                className="hover:text-foreground hover:underline"
              >
                {p.title}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <header className="flex items-start gap-4">
        {folder.isRoot ? (
          <LessonNumber lesson={root} className="size-16 text-2xl" />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-16 shrink-0 cut-sm place-items-center bg-xp-soft text-xp-foreground"
          >
            <FolderOpen className="size-7" />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-3xl leading-tight sm:text-4xl">
            {folder.isRoot ? <LessonTitle lesson={root} /> : folder.title}
          </h1>
          {folder.summary ? (
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {folder.summary}
            </p>
          ) : null}
        </div>
      </header>

      {folder.subfolders.length > 0 ? (
        <section aria-labelledby="subfoldere" className="grid gap-3">
          <h2 id="subfoldere" className="text-xl">
            Foldere
          </h2>
          <FolderList
            folders={folder.subfolders}
            href={(id) => `${base}/${id}`}
          />
        </section>
      ) : null}

      {problems.length > 0 ? (
        <section aria-labelledby="probleme" className="grid gap-3">
          <h2 id="probleme" className="text-xl">
            Probleme rezolvate
          </h2>
          <ul className="grid gap-3">
            {problems.map((item) =>
              item.kind === "problem" ? (
                <li key={item.id}>
                  <ProblemCard
                    title={item.title}
                    problem={item.content}
                    href={`${base}/${folder.id}/probleme/${item.id}`}
                  />
                </li>
              ) : null,
            )}
          </ul>
        </section>
      ) : null}

      {others.length > 0 ? (
        <div className="grid gap-10">
          {others.map((item) => (
            <LessonItemSection key={item.id} item={item} />
          ))}
        </div>
      ) : null}

      {folder.items.length === 0 && folder.subfolders.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Folderul e gol deocamdată"
          description="Mentorul adaugă materialele în curând. Revino mai târziu."
        />
      ) : null}

      <nav
        aria-label="Alte lecții"
        className="flex flex-wrap justify-between gap-3 border-t pt-6"
      >
        {parent ? (
          <Link
            href={`${base}/${parent.id}`}
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft /> Înapoi la {parent.title}
          </Link>
        ) : prev ? (
          <Link
            href={`${base}/${prev.id}`}
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft /> {lessonLabel(prev)}
          </Link>
        ) : (
          <Link href={base} className={buttonVariants({ variant: "ghost" })}>
            <ArrowLeft /> Toate materialele
          </Link>
        )}
        {next ? (
          <Link href={`${base}/${next.id}`} className={buttonVariants()}>
            {lessonLabel(next)} <ArrowRight />
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
