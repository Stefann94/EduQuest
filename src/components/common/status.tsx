import {
  CheckCircle2,
  Circle,
  CircleAlert,
  CircleDashed,
  CircleDot,
  Clock,
  Eye,
  EyeOff,
  FileQuestion,
  type LucideIcon,
  RotateCcw,
  ShieldCheck,
  Star,
  XCircle,
} from "lucide-react";
import type {
  ApplicationStatus,
  AssignmentType,
  PublicationStatus,
  SubmissionStatus,
} from "@/lib/data/types";
import { cn } from "@/lib/utils";

// Fiecare stare are iconiță ȘI text, ca să nu depindă doar de culoare (docs/PROJECT.md §13.3).

type Tone = "neutral" | "primary" | "success" | "warning" | "info" | "danger";

const TONES: Record<Tone, string> = {
  neutral: "bg-secondary text-secondary-foreground",
  primary: "bg-primary-soft text-accent-foreground",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
  danger: "bg-danger-soft text-destructive",
};

export function StatusBadge({
  icon: Icon,
  tone = "neutral",
  children,
  className,
}: {
  icon?: LucideIcon;
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "slant inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap px-3 font-bold font-heading text-xs uppercase tracking-wide",
        TONES[tone],
        className,
      )}
    >
      {Icon ? <Icon className="size-3.5" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

export const SUBMISSION_STATUS: Record<
  SubmissionStatus,
  { label: string; icon: LucideIcon; tone: Tone }
> = {
  not_started: { label: "Neînceput", icon: CircleDashed, tone: "neutral" },
  submitted: { label: "Trimisă", icon: Clock, tone: "info" },
  reviewed: { label: "Revizuită", icon: CheckCircle2, tone: "success" },
  needs_changes: {
    label: "Necesită corecturi",
    icon: RotateCcw,
    tone: "warning",
  },
};

export function SubmissionStatusBadge({
  status,
  overdue,
}: {
  status: SubmissionStatus;
  overdue?: boolean;
}) {
  if (overdue)
    return (
      <StatusBadge icon={CircleAlert} tone="danger">
        Termen depășit
      </StatusBadge>
    );
  const s = SUBMISSION_STATUS[status];
  return (
    <StatusBadge icon={s.icon} tone={s.tone}>
      {s.label}
    </StatusBadge>
  );
}

export function AssignmentTypeBadge({ type }: { type: AssignmentType }) {
  return type === "required" ? (
    <StatusBadge icon={CircleDot} tone="primary">
      Obligatorie
    </StatusBadge>
  ) : (
    <StatusBadge icon={Circle} tone="neutral">
      Opțională
    </StatusBadge>
  );
}

export function PublicationBadge({ status }: { status: PublicationStatus }) {
  return status === "published" ? (
    <StatusBadge icon={Eye} tone="success">
      Publicat
    </StatusBadge>
  ) : (
    <StatusBadge icon={EyeOff} tone="neutral">
      Ciornă
    </StatusBadge>
  );
}

export const APPLICATION_STATUS: Record<
  ApplicationStatus,
  { label: string; icon: LucideIcon; tone: Tone }
> = {
  pending: { label: "În așteptare", icon: Clock, tone: "info" },
  approved: { label: "Aprobată", icon: ShieldCheck, tone: "success" },
  rejected: { label: "Respinsă", icon: XCircle, tone: "danger" },
  needs_info: {
    label: "Informații necesare",
    icon: FileQuestion,
    tone: "warning",
  },
};

export function ApplicationStatusBadge({
  status,
}: {
  status: ApplicationStatus;
}) {
  const s = APPLICATION_STATUS[status];
  return (
    <StatusBadge icon={s.icon} tone={s.tone}>
      {s.label}
    </StatusBadge>
  );
}

const LEVELS = { 1: "Ușor", 2: "Mediu", 3: "Avansat" } as const;

export function DifficultyBadge({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span className="slant inline-flex h-6 items-center gap-1.5 bg-secondary px-3 font-bold font-heading text-xs text-muted-foreground uppercase tracking-wide">
      <span className="flex gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-2.5 w-1 -skew-x-12",
              i <= level ? "bg-foreground/70" : "bg-foreground/15",
            )}
          />
        ))}
      </span>
      {LEVELS[level]}
    </span>
  );
}

/** XP: accentul secundar al platformei (galben). */
export function XpBadge({
  amount,
  className,
}: {
  amount: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "slant inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap bg-xp-soft px-3 font-bold font-heading text-xs text-xp-foreground tabular-nums tracking-wide",
        className,
      )}
    >
      <Star className="size-3.5 fill-xp text-xp" aria-hidden="true" />
      {amount > 0 ? "+" : ""}
      {amount} XP
    </span>
  );
}
