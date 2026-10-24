import {
  FileCode2,
  FileText,
  Link2,
  type LucideIcon,
  Newspaper,
  PlayCircle,
} from "lucide-react";
import type { ItemKind } from "@/lib/content/items";
import { cn } from "@/lib/utils";

export const MATERIAL_KIND: Record<
  ItemKind,
  { label: string; icon: LucideIcon; className: string }
> = {
  article: {
    label: "Lecție scrisă",
    icon: Newspaper,
    className: "bg-primary-soft text-primary",
  },
  pdf: {
    label: "PDF",
    icon: FileText,
    className: "bg-danger-soft text-destructive",
  },
  link: {
    label: "Link",
    icon: Link2,
    className: "bg-info-soft text-info",
  },
  video: {
    label: "Video",
    icon: PlayCircle,
    className: "bg-success-soft text-success",
  },
  problem: {
    label: "Problemă",
    icon: FileCode2,
    className: "bg-xp-soft text-xp-foreground",
  },
};

export function MaterialKindIcon({
  kind,
  className,
}: {
  kind: ItemKind;
  className?: string;
}) {
  const { icon: Icon, className: tone } = MATERIAL_KIND[kind];
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-10 shrink-0 cut-xs place-items-center",
        tone,
        className,
      )}
    >
      <Icon className="size-[18px]" />
    </span>
  );
}
