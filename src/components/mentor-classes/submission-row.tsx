import { ChevronRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import { StatusBadge, SubmissionStatusBadge } from "@/components/common/status";
import { UserAvatar } from "@/components/common/user-avatar";
import type { SubmissionStatus, User } from "@/lib/data/types";
import { formatDay, formatTime } from "@/lib/format";

/** Un rând de trimitere pentru mentor: elev, temă, clasă, data și starea. */
export function SubmissionRow({
  student,
  assignmentId,
  assignmentTitle,
  submissionId,
  className,
  at,
  status,
  isResubmission,
  showStatus = true,
}: {
  student: User;
  assignmentId: string;
  assignmentTitle: string;
  submissionId: string;
  className?: string;
  at: string;
  status: Exclude<SubmissionStatus, "not_started">;
  isResubmission: boolean;
  showStatus?: boolean;
}) {
  return (
    <Link
      href={`/mentor/teme/${assignmentId}/${submissionId}`}
      className="group flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg px-3 py-3 outline-none transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      <UserAvatar name={student.displayName} avatar={student.avatar} />
      <div className="min-w-0 flex-1 basis-48">
        <p className="truncate font-medium group-hover:text-primary">
          {student.displayName}
          <span className="font-normal text-muted-foreground">
            {" "}
            · {assignmentTitle}
          </span>
        </p>
        <p className="truncate text-muted-foreground text-sm">
          {className ? `${className} · ` : null}
          Trimisă {formatDay(at)}, la {formatTime(at)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {isResubmission ? (
          <StatusBadge icon={RotateCcw} tone="warning">
            Retrimitere
          </StatusBadge>
        ) : null}
        {showStatus ? <SubmissionStatusBadge status={status} /> : null}
        <ChevronRight
          className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
