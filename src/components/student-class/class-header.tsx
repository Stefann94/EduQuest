import { Archive, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status";
import { UserAvatar } from "@/components/common/user-avatar";
import type { ClassRoom, User } from "@/lib/data/types";
import { ClassSectionNav } from "./class-section-nav";

/** Antetul comun al paginilor unei clase: nume, mentor, program și secțiuni. */
export function ClassHeader({
  classRoom: c,
}: {
  classRoom: ClassRoom & { mentor: User };
}) {
  const archived = c.status === "archived";
  return (
    <div className="grid gap-5">
      <PageHeader
        back={{ href: "/clase", label: "Clasele mele" }}
        title={c.name}
        meta={
          <>
            <span className="inline-flex items-center gap-2 text-sm">
              <UserAvatar
                name={c.mentor.displayName}
                avatar={c.mentor.avatar}
                size="xs"
              />
              <span className="text-muted-foreground">
                Mentor:{" "}
                <span className="font-medium text-foreground">
                  {c.mentor.displayName}
                </span>
              </span>
            </span>
            <span aria-hidden="true" className="text-muted-foreground">
              ·
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground text-sm">
              <CalendarDays className="size-4" aria-hidden="true" />
              <span className="sr-only">Program:</span>
              {c.schedule}
            </span>
            {archived ? (
              <StatusBadge icon={Archive} tone="neutral">
                Arhivată
              </StatusBadge>
            ) : null}
          </>
        }
      />
      {archived ? (
        <div className="flex items-start gap-3 rounded-xl border bg-muted/50 px-4 py-3 text-sm">
          <Archive
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <p>
            <span className="font-medium">Clasă arhivată</span>
            <span className="text-muted-foreground">
              {" "}
              — poți reciti materialele, dar nu mai poți trimite teme.
            </span>
          </p>
        </div>
      ) : null}
      <ClassSectionNav classId={c.id} />
    </div>
  );
}
