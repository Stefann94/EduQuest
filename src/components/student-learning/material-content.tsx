import {
  Download,
  ExternalLink,
  FileText,
  Info,
  PlayCircle,
} from "lucide-react";
import { CodeBlock } from "@/components/common/code-block";
import { Button, buttonVariants } from "@/components/ui/button";
import type { ContentBlock, Material } from "@/lib/data/types";
import { formatFileSize } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Conținutul formatat al unei lecții: titluri, paragrafe, cod, liste și observații. */
export function ArticleBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="grid gap-5 leading-relaxed">
      {blocks.map((b, i) => {
        // Blocurile nu au id propriu; ordinea lor e fixă, deci indexul e o cheie stabilă.
        const key = `${b.type}-${i}`;
        switch (b.type) {
          case "heading":
            return (
              <h2 key={key} className="mt-2 font-semibold text-lg">
                {b.text}
              </h2>
            );
          case "paragraph":
            return <p key={key}>{b.text}</p>;
          case "code":
            return <CodeBlock key={key} code={b.code} language={b.language} />;
          case "list":
            return (
              <ul key={key} className="grid list-disc gap-1.5 pl-5">
                {b.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case "note":
            return (
              <aside
                key={key}
                className="flex gap-3 rounded-lg border border-info/20 bg-info-soft px-4 py-3 text-sm"
              >
                <Info
                  className="mt-0.5 size-4 shrink-0 text-info"
                  aria-hidden="true"
                />
                <p>
                  <span className="font-medium">De reținut: </span>
                  {b.text}
                </p>
              </aside>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

/** Fișierul PDF al unui material. În demo nu există un fișier real de descărcat. */
export function PdfCard({ file }: { file: NonNullable<Material["file"]> }) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-5 shadow-xs">
      <span
        aria-hidden="true"
        className="grid size-12 shrink-0 place-items-center rounded-lg bg-danger-soft text-destructive"
      >
        <FileText className="size-5" />
      </span>
      <div className="min-w-0 flex-1 basis-48">
        <p className="truncate font-medium">{file.name}</p>
        <p className="text-muted-foreground text-sm">
          PDF · {formatFileSize(file.sizeKb)}
        </p>
      </div>
      <div className="grid justify-items-end gap-1">
        <Button
          disabled
          title="În versiunea demo fișierul nu poate fi descărcat"
          aria-describedby="pdf-demo-note"
        >
          <Download /> Descarcă PDF
        </Button>
      </div>
      <p
        id="pdf-demo-note"
        className="basis-full text-muted-foreground text-xs"
      >
        Versiune demo: descărcarea fișierelor va funcționa după conectarea
        stocării de fișiere.
      </p>
    </div>
  );
}

/** Un link extern sau un video: se deschide într-o filă nouă. */
export function ExternalResourceCard({
  kind,
  url,
}: {
  kind: "link" | "video";
  url: string;
}) {
  const host = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  })();
  const Icon = kind === "video" ? PlayCircle : ExternalLink;
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-5 shadow-xs">
      <span
        aria-hidden="true"
        className={cn(
          "grid size-12 shrink-0 place-items-center rounded-lg",
          kind === "video"
            ? "bg-success-soft text-success"
            : "bg-info-soft text-info",
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1 basis-48">
        <p className="font-medium">
          {kind === "video" ? "Video extern" : "Resursă externă"}
        </p>
        <p className="truncate text-muted-foreground text-sm">{host}</p>
      </div>
      <a
        href={url}
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
