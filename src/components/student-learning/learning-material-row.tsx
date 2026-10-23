import { ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  MATERIAL_KIND,
  MaterialKindIcon,
} from "@/components/learning/material-kind";
import type { Material } from "@/lib/data/types";
import { formatDay } from "@/lib/format";

export type LearningMaterial = Pick<
  Material,
  | "id"
  | "classId"
  | "title"
  | "description"
  | "topic"
  | "kind"
  | "tags"
  | "publishedAt"
> & { className?: string };

/** Un material în secțiunea Învățare: tip, titlu, descriere, temă, sursă și data. */
export function LearningMaterialRow({
  material: m,
}: {
  material: LearningMaterial;
}) {
  return (
    <Link
      href={`/invatare/materiale/${m.id}`}
      className="group flex items-start gap-4 rounded-lg px-3 py-3 outline-none transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      <MaterialKindIcon kind={m.kind} />
      <div className="min-w-0 flex-1">
        <p className="font-medium group-hover:text-primary">{m.title}</p>
        <p className="line-clamp-1 text-muted-foreground text-sm">
          {m.description}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-muted-foreground text-xs">
          <span className="font-medium text-foreground/80">
            {MATERIAL_KIND[m.kind].label}
          </span>
          <span aria-hidden="true">·</span>
          <span>{m.topic}</span>
          <span aria-hidden="true">·</span>
          <span>{m.className ?? "Resursă globală"}</span>
          <span aria-hidden="true">·</span>
          <span>{formatDay(m.publishedAt)}</span>
        </p>
      </div>
      <ChevronRight
        className="mt-3 size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
    </Link>
  );
}
