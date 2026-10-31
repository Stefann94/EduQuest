import {
  Download,
  ExternalLink,
  FileText,
  Lightbulb,
  PlayCircle,
} from "lucide-react";
import { CodeBlock } from "@/components/common/code-block";
import { ContentBlocks, RichText } from "@/components/learning/content-blocks";
import {
  MATERIAL_KIND,
  MaterialKindIcon,
} from "@/components/learning/material-kind";
import { SolutionToggle } from "@/components/student-learning/solution-toggle";
import { buttonVariants } from "@/components/ui/button";
import type {
  LinkContent,
  PdfContent,
  ProblemContent,
} from "@/lib/content/items";
import type { LessonItemView } from "@/lib/db/lessons";
import { formatFileSize } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SolutionTabs } from "./solution-tabs";
import { TryIt } from "./try-it";

/** Un material întreg, pe pagina lecției. `id` = ancora din meniul cardului de lecție. */
export function LessonItemSection({ item }: { item: LessonItemView }) {
  return (
    <section id={`m-${item.id}`} className="scroll-mt-24 grid gap-4">
      <header className="flex items-center gap-3">
        <MaterialKindIcon kind={item.kind} />
        <div className="min-w-0">
          <p className="font-bold font-heading text-muted-foreground text-xs uppercase tracking-wider">
            {MATERIAL_KIND[item.kind].label}
          </p>
          <h2 className="text-2xl leading-tight">{item.title}</h2>
        </div>
      </header>
      <ItemBody item={item} />
    </section>
  );
}

function ItemBody({ item }: { item: LessonItemView }) {
  switch (item.kind) {
    case "article":
      return (
        <div className="grid max-w-3xl gap-4">
          <ContentBlocks blocks={item.content.blocks} />
        </div>
      );
    case "pdf":
      return <PdfCard file={item.content} url={item.fileUrl} />;
    case "link":
    case "video":
      return <ExternalCard kind={item.kind} content={item.content} />;
    case "problem":
      return <ProblemBody itemId={item.id} problem={item.content} />;
  }
}

export function PdfCard({ file, url }: { file: PdfContent; url?: string }) {
  return (
    <div className="flex cut-sm flex-wrap items-center gap-4 bg-card p-5">
      <span
        aria-hidden="true"
        className="grid size-12 shrink-0 cut-xs place-items-center bg-danger-soft text-destructive"
      >
        <FileText className="size-5" />
      </span>
      <div className="min-w-0 flex-1 basis-48">
        <p className="truncate font-medium">{file.name}</p>
        <p className="text-muted-foreground text-sm">
          PDF · {formatFileSize(file.sizeKb)}
        </p>
      </div>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants()}
        >
          <Download /> Deschide PDF-ul
          <span className="sr-only"> (se deschide într-o filă nouă)</span>
        </a>
      ) : (
        <p className="text-muted-foreground text-sm">
          Fișierul nu e disponibil acum.
        </p>
      )}
    </div>
  );
}

function ExternalCard({
  kind,
  content,
}: {
  kind: "link" | "video";
  content: LinkContent;
}) {
  const host = (() => {
    try {
      return new URL(content.url).hostname.replace(/^www\./, "");
    } catch {
      return content.url;
    }
  })();
  const Icon = kind === "video" ? PlayCircle : ExternalLink;
  return (
    <div className="flex cut-sm flex-wrap items-center gap-4 bg-card p-5">
      <span
        aria-hidden="true"
        className={cn(
          "grid size-12 shrink-0 cut-xs place-items-center",
          kind === "video"
            ? "bg-success-soft text-success"
            : "bg-info-soft text-info",
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1 basis-48">
        <p className="truncate text-muted-foreground text-sm">{host}</p>
        {content.note ? (
          <p className="mt-1 leading-relaxed">{content.note}</p>
        ) : null}
      </div>
      <a
        href={content.url}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants()}
      >
        {kind === "video" ? "Urmărește video" : "Deschide linkul"}
        <ExternalLink />
        <span className="sr-only"> (se deschide într-o filă nouă)</span>
      </a>
    </div>
  );
}

/** Enunțul unei probleme, „încearcă singur” și rezolvarea, ascunsă până o ceri. */
export function ProblemBody({
  itemId,
  problem: p,
}: {
  itemId: string;
  problem: ProblemContent;
}) {
  return (
    <div className="grid max-w-3xl gap-5">
      <div className="grid gap-3 leading-relaxed">
        {p.statement.split(/\n{2,}/).map((para) => (
          <p key={para}>
            <RichText text={para} />
          </p>
        ))}
      </div>

      {p.constraints.length > 0 ? (
        <div>
          <h3 className="font-bold font-heading text-sm uppercase tracking-wide">
            Restricții
          </h3>
          <ul className="mt-2 grid list-disc gap-1 pl-5 text-sm">
            {p.constraints.map((c) => (
              <li key={c}>
                <RichText text={c} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {p.examples.length > 0 ? (
        <div className="grid gap-3">
          <h3 className="font-bold font-heading text-sm uppercase tracking-wide">
            {p.examples.length === 1 ? "Exemplu" : "Exemple"}
          </h3>
          <ol className="grid gap-3">
            {p.examples.map((ex, i) => (
              <li
                key={`${ex.input}-${i}`}
                className="grid cut-sm gap-3 bg-card p-3 sm:grid-cols-2"
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

      <div className="grid gap-3">
        <h3 className="font-bold font-heading text-sm uppercase tracking-wide">
          Încearcă singur
        </h3>
        {p.hint ? (
          <p className="flex gap-2 text-sm">
            <Lightbulb
              className="mt-0.5 size-4 shrink-0 text-xp-foreground"
              aria-hidden="true"
            />
            <span>
              <span className="font-semibold">Indiciu: </span>
              <RichText text={p.hint} />
            </span>
          </p>
        ) : null}
        <TryIt itemId={itemId} starter={p.starter} language={p.language} />
      </div>

      <SolutionToggle>
        <div className="grid gap-4">
          <SolutionTabs
            files={p.files.map((f, i) => ({
              name: f.name,
              node: (
                <CodeBlock
                  code={f.code}
                  language={f.language}
                  title={f.name}
                  // Ce afișează programul îl arătăm sub primul fișier (cel care rulează).
                  output={i === 0 ? p.output : undefined}
                />
              ),
            }))}
          />
          {p.explanation ? (
            <div className="grid gap-2 leading-relaxed">
              <h3 className="font-bold font-heading text-sm uppercase tracking-wide">
                Cum funcționează
              </h3>
              {p.explanation.split(/\n{2,}/).map((para) => (
                <p key={para}>
                  <RichText text={para} />
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </SolutionToggle>
    </div>
  );
}

function IoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1.5">
      <span className="font-medium text-muted-foreground text-xs">{label}</span>
      <pre className="overflow-x-auto bg-muted px-3 py-2 font-mono text-sm">
        {value}
      </pre>
    </div>
  );
}
