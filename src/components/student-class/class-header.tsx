import { Archive, Award, CalendarDays, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status";
import { UserAvatar } from "@/components/common/user-avatar";
import type { CourseOutcome } from "@/lib/db/attendance";
import type { ClassRoom, Person } from "@/lib/db/classes";
import { ClassSectionNav } from "./class-section-nav";

/** Antetul comun al paginilor unei clase: nume, mentor, program și secțiuni. */
export function ClassHeader({
  classRoom: c,
  outcome = "in_progress",
  absences = 0,
}: {
  classRoom: ClassRoom & { mentor: Person };
  /** Cum a încheiat elevul cursul (doar pentru clasele arhivate). */
  outcome?: CourseOutcome;
  absences?: number;
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
      {outcome === "completed" ? (
        <div className="flex cut-sm items-start gap-3 bg-success-soft px-4 py-3 text-sm">
          <Award
            className="mt-0.5 size-5 shrink-0 text-success"
            aria-hidden="true"
          />
          <p>
            <span className="font-semibold">Ai absolvit cursul.</span>{" "}
            Felicitări! Ai fost prezent la întâlniri (cel mult 2 absențe).
          </p>
        </div>
      ) : outcome === "not_completed" ? (
        <div className="flex cut-sm items-start gap-3 bg-danger-soft px-4 py-3 text-sm">
          <TriangleAlert
            className="mt-0.5 size-5 shrink-0 text-destructive"
            aria-hidden="true"
          />
          <p>
            <span className="font-semibold">Nu ai absolvit cursul:</span> ai
            avut {absences} absențe nerecuperate, iar limita e de 2.
          </p>
        </div>
      ) : null}
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
              — poți reciti lecțiile, dar nu mai poți trimite teme.
            </span>
          </p>
        </div>
      ) : null}
      <ClassSectionNav classId={c.id} />
    </div>
  );
}
