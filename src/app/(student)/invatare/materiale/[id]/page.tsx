import { CalendarDays, Globe, Tag, Users } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { UserAvatar } from "@/components/common/user-avatar";
import { MATERIAL_KIND } from "@/components/learning/material-kind";
import { DetailSkeleton } from "@/components/student-class/skeletons";
import {
  ArticleBlocks,
  ExternalResourceCard,
  PdfCard,
} from "@/components/student-learning/material-content";
import { demoIds, getMaterial, getViewer } from "@/lib/data/queries";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = PageProps<"/invatare/materiale/[id]">;

export const metadata: Metadata = { title: "Material" };

export function generateStaticParams() {
  return demoIds.materials();
}

export default function MaterialPage({ params }: Props) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const viewer = await getViewer("student");
  const m = await getMaterial(viewer, id);
  if (!m) notFound();

  const kind = MATERIAL_KIND[m.kind];
  const KindIcon = kind.icon;

  return (
    <div className="grid gap-6">
      <PageHeader
        back={{ href: "/invatare", label: "Învățare" }}
        title={m.title}
        description={m.description}
        meta={
          <>
            <span
              className={cn(
                "inline-flex h-6 items-center gap-1 rounded-full px-2.5 font-medium text-xs",
                kind.className,
              )}
            >
              <KindIcon className="size-3.5" aria-hidden="true" />
              {kind.label}
            </span>
            <span className="inline-flex h-6 items-center rounded-full border px-2.5 font-medium text-muted-foreground text-xs">
              {m.topic}
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground text-sm">
              {m.className ? (
                <Users className="size-4" aria-hidden="true" />
              ) : (
                <Globe className="size-4" aria-hidden="true" />
              )}
              {m.className ?? "Resursă globală"}
            </span>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-muted-foreground text-sm">
        <span className="inline-flex items-center gap-2">
          <UserAvatar
            name={m.author.displayName}
            avatar={m.author.avatar}
            size="xs"
          />
          <span className="sr-only">Autor:</span>
          {m.author.displayName}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-4" aria-hidden="true" />
          <span className="sr-only">Publicat pe</span>
          {formatDate(m.publishedAt)}
        </span>
        {m.tags.length > 0 ? (
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <Tag className="size-4" aria-hidden="true" />
            <span className="sr-only">Etichete:</span>
            {m.tags.map((t) => (
              <span
                key={t}
                className="rounded-md bg-secondary px-1.5 py-0.5 text-secondary-foreground text-xs"
              >
                {t}
              </span>
            ))}
          </span>
        ) : null}
      </div>

      <div className="max-w-3xl">
        {m.kind === "article" && m.blocks ? (
          <article className="rounded-xl border bg-card p-5 shadow-xs sm:p-8">
            <ArticleBlocks blocks={m.blocks} />
          </article>
        ) : null}
        {m.kind === "pdf" && m.file ? <PdfCard file={m.file} /> : null}
        {(m.kind === "link" || m.kind === "video") && m.url ? (
          <ExternalResourceCard kind={m.kind} url={m.url} />
        ) : null}
      </div>
    </div>
  );
}
