import { ArrowLeft, ArrowRight, ChevronRight, Code2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProblemBody } from "@/components/lessons/lesson-item-view";
import { DetailSkeleton } from "@/components/student-class/skeletons";
import { buttonVariants } from "@/components/ui/button";
import { placeholderParams } from "@/lib/db/core";
import { getClassFolder, lessonLabel } from "@/lib/db/lessons";
import { loadStudentClass } from "../../../../load-class";

type Props = PageProps<"/clase/[id]/lectii/[lectie]/probleme/[problema]">;

export const metadata: Metadata = { title: "Problemă rezolvată" };

export function generateStaticParams() {
  return placeholderParams("problema");
}

export default function ClassProblemPage({ params }: Props) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { lectie, problema } = await params;
  const { classRoom: c } = await loadStudentClass(params);
  const data = await getClassFolder(c.id, lectie);
  if (!data) notFound();
  const { root, path, folder } = data;
  const problems = folder.items.filter((i) => i.kind === "problem");
  const index = problems.findIndex((i) => i.id === problema);
  const item = problems[index];
  if (!item || item.kind !== "problem") notFound();
  const prev = problems[index - 1];
  const next = problems[index + 1];

  const base = `/clase/${c.id}/lectii`;
  const folderHref = `${base}/${folder.id}`;
  const folderTitle = folder.isRoot ? lessonLabel(root) : folder.title;
  const crumbs = [
    ...(folder.isRoot ? [] : [{ id: root.id, title: lessonLabel(root) }]),
    ...path.filter((p) => p.id !== root.id && p.id !== folder.id),
    { id: folder.id, title: folderTitle },
  ];

  return (
    <article className="grid gap-8">
      <nav aria-label="Unde ești" className="text-sm">
        <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
          <li>
            <Link href={base} className="hover:text-foreground hover:underline">
              Materiale
            </Link>
          </li>
          {crumbs.map((p) => (
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

      <header className="flex cut flex-col gap-4 bg-card p-6 sm:flex-row sm:items-center">
        <span
          aria-hidden="true"
          className="grid size-16 shrink-0 cut-sm place-items-center bg-primary/15 text-primary"
        >
          <Code2 className="size-7" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold font-heading text-muted-foreground text-xs uppercase tracking-wider">
            Problemă rezolvată · {folderTitle}
          </p>
          <h1 className="text-3xl leading-tight sm:text-4xl">{item.title}</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Citește enunțul, încearcă singur, apoi compară cu rezolvarea
            mentorului
            {item.content.files.length > 1
              ? ` (${item.content.files.length} fișiere, pe taburi)`
              : ""}
            .
          </p>
        </div>
        {problems.length > 1 ? (
          <p className="shrink-0 font-heading text-muted-foreground text-sm tabular-nums">
            {index + 1} / {problems.length}
          </p>
        ) : null}
      </header>

      <ProblemBody itemId={item.id} problem={item.content} />

      <nav
        aria-label="Alte probleme"
        className="flex flex-wrap justify-between gap-3 border-t pt-6"
      >
        {prev ? (
          <Link
            href={`${folderHref}/probleme/${prev.id}`}
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft /> {prev.title}
          </Link>
        ) : (
          <Link
            href={folderHref}
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft /> Înapoi la {folderTitle}
          </Link>
        )}
        {next ? (
          <Link
            href={`${folderHref}/probleme/${next.id}`}
            className={buttonVariants()}
          >
            {next.title} <ArrowRight />
          </Link>
        ) : prev ? (
          <Link
            href={folderHref}
            className={buttonVariants({ variant: "ghost" })}
          >
            Înapoi la {folderTitle}
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
