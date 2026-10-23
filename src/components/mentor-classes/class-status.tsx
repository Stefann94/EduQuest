import { Archive, CircleCheck, KeyRound, Lock } from "lucide-react";
import { StatusBadge } from "@/components/common/status";
import type { ClassStatus } from "@/lib/data/types";

export function ClassStatusBadge({ status }: { status: ClassStatus }) {
  return status === "active" ? (
    <StatusBadge icon={CircleCheck} tone="success">
      Activă
    </StatusBadge>
  ) : (
    <StatusBadge icon={Archive} tone="neutral">
      Arhivată
    </StatusBadge>
  );
}

export function InviteCodeStatusBadge({ active }: { active: boolean }) {
  return active ? (
    <StatusBadge icon={KeyRound} tone="success">
      Cod activ
    </StatusBadge>
  ) : (
    <StatusBadge icon={Lock} tone="neutral">
      Cod dezactivat
    </StatusBadge>
  );
}
