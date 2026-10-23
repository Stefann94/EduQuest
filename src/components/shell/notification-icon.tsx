import {
  BookOpen,
  CalendarClock,
  ClipboardList,
  FileCheck2,
  type LucideIcon,
  MessageSquareText,
  Radio,
  RotateCcw,
  UserCheck,
} from "lucide-react";
import type { NotificationKind } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const ICONS: Record<NotificationKind, { icon: LucideIcon; className: string }> =
  {
    assignment_new: {
      icon: ClipboardList,
      className: "bg-primary-soft text-primary",
    },
    deadline: {
      icon: CalendarClock,
      className: "bg-warning-soft text-warning",
    },
    feedback: {
      icon: MessageSquareText,
      className: "bg-success-soft text-success",
    },
    needs_changes: {
      icon: RotateCcw,
      className: "bg-warning-soft text-warning",
    },
    material_new: { icon: BookOpen, className: "bg-info-soft text-info" },
    live_quiz: { icon: Radio, className: "bg-primary-soft text-primary" },
    submission_new: { icon: FileCheck2, className: "bg-info-soft text-info" },
    resubmission: { icon: RotateCcw, className: "bg-info-soft text-info" },
    application: { icon: UserCheck, className: "bg-primary-soft text-primary" },
  };

export function NotificationIcon({
  kind,
  className,
}: {
  kind: NotificationKind;
  className?: string;
}) {
  const { icon: Icon, className: tone } = ICONS[kind];
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full",
        tone,
        className,
      )}
    >
      <Icon className="size-4" />
    </span>
  );
}
