import { CalendarDays, Globe, Lightbulb, Users } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CodeBlock } from "@/components/common/code-block";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import { DifficultyBadge } from "@/components/common/status";
import { DetailSkeleton } from "@/components/student-class/skeletons";
import { SolutionToggle } from "@/components/student-learning/solution-toggle";
import { demoIds, getViewer, getWorkedProblem } from "@/lib/data/queries";
import { formatDate } from "@/lib/format";

type Props = PageProps<"/invatare/probleme/[id]">;

export const metadata: Metadata = { title: "Problemă rezolvată" };

export function generateStaticParams() {
  return demoIds.problems();
}

export default function WorkedProblemPage({ params }: Props) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const viewer = await getViewer("student");
  const p = await getWorkedProblem(viewer, id);
  if (!p) notFound();

  return (
    <div className="grid gap-6">
      <PageHeader
        back={{ href: "/invatare", label: "Învățare" }}
        title={p.title}
        meta={
          <>
            <DifficultyBadge level={p.difficulty} />
            <span className="inline-flex h-6 items-center rounded-full border px-2.5 font-medium text-muted-foreground text-xs">
              {p.topic}
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground text-sm">
              {p.className ? (
                <Users className="size-4" aria-hidden="true" />
              ) : (
                <Globe className="size-4" aria-hidden="true" />
              )}
              {p.className ?? "Resursă globală"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground text-sm">
              <CalendarDays className="size-4" aria-hidden="true" />
              <span className="sr-only">Publicată pe</span>
              {formatDate(p.publishedAt)} · {p.author.displayName}
            </span>
          </>
        }
      />

      <div className="grid max-w-3xl gap-6">
        <Section title="Enunț">
          <p className="leading-relaxed">{p.statement}</p>

          {p.constraints.length > 0 ? (
            <div className="mt-5">
              <h3 className="font-medium text-sm">Restricții</h3>
              <ul className="mt-2 grid list-disc gap-1 pl-5 text-sm">
                {p.constraints.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {p.examples.length > 0 ? (
            <div className="mt-5 grid gap-3">
              <h3 className="font-medium text-sm">
                {p.examples.length === 1 ? "Exemplu" : "Exemple"}
              </h3>
              <ol className="grid gap-3">
                {p.examples.map((ex, i) => (
                  <li
                    key={`${ex.input}-${i}`}
                    className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2"
                  >
                    <IoBox label="Intrare" value={ex.input} />
                    <IoBox label="Ieșire" value={ex.output} />
                    {ex.note ? (
                      <p className="text-muted-foreground text-sm sm:col-span-2">
                        {ex.note}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </Section>

        <div className="flex gap-3 rounded-xl border border-xp/30 bg-xp-soft px-4 py-3 text-sm">
          <Lightbulb
            className="mt-0.5 size-4 shrink-0 text-xp-foreground"
            aria-hidden="true"
          />
          <p>
            <span className="font-medium">Încearcă mai întâi singur. </span>
            Scrie o soluție, rulează-o pe exemple și abia apoi compar-o cu cea
            de mai jos. Așa înveți cel mai mult.
          </p>
        </div>

        <Section title="Soluție">
          <SolutionToggle>
            <div className="grid gap-5">
              <CodeBlock
                code={p.solution.code}
                language={p.solution.language}
              />
              {p.explanation.length > 0 ? (
                <div>
                  <h3 className="font-medium">Explicație pas cu pas</h3>
                  <ol className="mt-3 grid gap-3">
                    {p.explanation.map((step, i) => (
                      <li key={step} className="flex gap-3 text-sm">
                        <span
                          aria-hidden="true"
                          className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft font-semibold text-primary text-xs tabular-nums"
                        >
                          {i + 1}
                        </span>
                        <span className="pt-0.5 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </div>
          </SolutionToggle>
        </Section>
      </div>
    </div>
  );
}

function IoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1.5">
      <span className="font-medium text-muted-foreground text-xs">{label}</span>
      <pre className="overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-sm">
        {value}
      </pre>
    </div>
  );
}
