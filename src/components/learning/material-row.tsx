import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Material } from "@/lib/data/types";
import { formatDay } from "@/lib/format";
import { MATERIAL_KIND, MaterialKindIcon } from "./material-kind";

/** Un rând de material: tip, titlu, temă, clasă (sau „Resursă globală”) și data. */
export function MaterialRow({
  material: m,
  href,
}: {
  material: Material & { className?: string };
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-lg px-3 py-3 outline-none transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      <MaterialKindIcon kind={m.kind} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium group-hover:text-primary">
          {m.title}
        </p>
        <p className="truncate text-muted-foreground text-sm">
          {MATERIAL_KIND[m.kind].label} · {m.className ?? "Resursă globală"} ·{" "}
          {formatDay(m.publishedAt)}
        </p>
      </div>
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
    </Link>
  );
}
