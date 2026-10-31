import {
  FileCode2,
  FileText,
  Folder,
  Link2,
  type LucideIcon,
  Newspaper,
  PlayCircle,
} from "lucide-react";
import type { ItemKind } from "@/lib/content/items";
import { cn } from "@/lib/utils";

/** Tipurile de materiale, plus „folder” pentru subfolderele unei lecții. */
export type MaterialKind = ItemKind | "folder";

export const MATERIAL_KIND: Record<
  MaterialKind,
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
  folder: {
    label: "Folder",
    icon: Folder,
    className: "bg-secondary text-foreground",
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
  kind: MaterialKind;
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
