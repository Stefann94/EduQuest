import { ChevronRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/common/status";
import { UserAvatar } from "@/components/common/user-avatar";
import type { Person } from "@/lib/db/core";
import { formatDay, formatTime } from "@/lib/format";

/** Un rând de trimitere pentru mentor: elev, temă și problemă, clasă, data. */
export function SubmissionRow({
  href,
  student,
  title,
  problemTitle,
  className,
  at,
  isResubmission,
}: {
  href: string;
  student: Person;
  title: string;
  problemTitle?: string;
  className?: string;
  at: string;
  isResubmission: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-3 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70"
    >
      <UserAvatar name={student.displayName} avatar={student.avatar} />
      <div className="min-w-0 flex-1 basis-48">
        <p className="truncate font-medium group-hover:text-primary">
          {student.displayName}
          <span className="font-normal text-muted-foreground"> · {title}</span>
        </p>
        <p className="truncate text-muted-foreground text-sm">
          {problemTitle ? `${problemTitle} · ` : null}
          {className ? `${className} · ` : null}
          {formatDay(at)}, la {formatTime(at)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {isResubmission ? (
          <StatusBadge icon={RotateCcw} tone="warning">
            Retrimitere
          </StatusBadge>
        ) : null}
        <ChevronRight
          className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
