import {
  Ban,
  CheckCircle2,
  GraduationCap,
  type LucideIcon,
  PauseCircle,
  Presentation,
  ShieldCheck,
} from "lucide-react";
import { StatusBadge } from "@/components/common/status";
import type { AccountStatus, Role } from "@/lib/data/types";

export const ROLE_LABEL: Record<Role, string> = {
  student: "Elev",
  mentor: "Mentor",
  admin: "Administrator",
};

const ROLE: Record<
  Role,
  { icon: LucideIcon; tone: "neutral" | "primary" | "info" }
> = {
  student: { icon: GraduationCap, tone: "neutral" },
  mentor: { icon: Presentation, tone: "primary" },
  admin: { icon: ShieldCheck, tone: "info" },
};

export function RoleBadge({ role }: { role: Role }) {
  const r = ROLE[role];
  return (
    <StatusBadge icon={r.icon} tone={r.tone}>
      {ROLE_LABEL[role]}
    </StatusBadge>
  );
}

export const ACCOUNT_STATUS: Record<
  AccountStatus,
  { label: string; icon: LucideIcon; tone: "success" | "warning" | "neutral" }
> = {
  active: { label: "Activ", icon: CheckCircle2, tone: "success" },
  suspended: { label: "Suspendat", icon: PauseCircle, tone: "warning" },
  deactivated: { label: "Dezactivat", icon: Ban, tone: "neutral" },
};

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  const s = ACCOUNT_STATUS[status];
  return (
    <StatusBadge icon={s.icon} tone={s.tone}>
      {s.label}
    </StatusBadge>
  );
}
