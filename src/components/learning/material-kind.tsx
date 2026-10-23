import {
  FileText,
  Link2,
  type LucideIcon,
  Newspaper,
  PlayCircle,
} from "lucide-react";
import type { MaterialKind } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export const MATERIAL_KIND: Record<
  MaterialKind,
  { label: string; icon: LucideIcon; className: string }
> = {
  article: {
    label: "Lecție",
    icon: Newspaper,
    className: "bg-primary-soft text-primary",
  },
  pdf: {
    label: "PDF",
    icon: FileText,
    className: "bg-danger-soft text-destructive",
  },
  link: {
    label: "Link extern",
    icon: Link2,
    className: "bg-info-soft text-info",
  },
  video: {
    label: "Video",
    icon: PlayCircle,
    className: "bg-success-soft text-success",
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
        "grid size-10 shrink-0 place-items-center rounded-lg",
        tone,
        className,
      )}
    >
      <Icon className="size-[18px]" />
    </span>
  );
}
