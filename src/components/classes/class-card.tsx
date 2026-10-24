import { CalendarDays, ChevronRight, ClipboardList, Users } from "lucide-react";
import Link from "next/link";
import { UserAvatar } from "@/components/common/user-avatar";
import type { ClassSummary } from "@/lib/data/queries";
import { plural } from "@/lib/format";
import { cn } from "@/lib/utils";

// O culoare de bandă diferită pentru fiecare clasă, ca să fie ușor de recunoscut.
const ACCENTS = ["bg-primary", "bg-info", "bg-success", "bg-xp", "bg-quiz-red"];

export function classAccent(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return ACCENTS[h % ACCENTS.length];
}

/** Cardul unei clase. `viewAs` schimbă ce indicator de activitate se afișează. */
export function ClassCard({
  classRoom: c,
  href,
  viewAs,
}: {
  classRoom: ClassSummary;
  href: string;
  viewAs: "student" | "mentor";
}) {
  const archived = c.status === "archived";
  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full cut flex-col overflow-hidden bg-card outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70 focus-visible:ring-inset",
        archived && "bg-muted/40",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-1",
          archived ? "bg-muted-foreground/30" : classAccent(c.id),
        )}
      />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="font-extrabold text-2xl leading-none">{c.name}</h3>
          <p className="mt-1 line-clamp-2 text-muted-foreground text-sm">
            {c.description}
          </p>
        </div>
        <dl className="mt-auto grid gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="size-4" aria-hidden="true" />
            <dt className="sr-only">Program</dt>
            <dd>{c.schedule}</dd>
          </div>
          {viewAs === "student" ? (
            <div className="flex items-center gap-2">
              <UserAvatar
                name={c.mentor.displayName}
                avatar={c.mentor.avatar}
                size="xs"
              />
              <dt className="sr-only">Mentor</dt>
              <dd className="text-muted-foreground">{c.mentor.displayName}</dd>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="size-4" aria-hidden="true" />
              <dt className="sr-only">Elevi</dt>
              <dd>{plural(c.studentIds.length, "elev", "elevi")}</dd>
            </div>
          )}
        </dl>
      </div>
      <div className="flex items-center justify-between gap-3 border-t px-5 py-3 text-sm">
        {c.pendingAssignments > 0 && !archived ? (
          <span className="flex items-center gap-1.5 font-medium text-primary">
            <ClipboardList className="size-4" aria-hidden="true" />
            {viewAs === "student"
              ? plural(c.pendingAssignments, "temă de făcut", "teme de făcut")
              : plural(
                  c.pendingAssignments,
                  "trimitere de revizuit",
                  "trimiteri de revizuit",
                )}
          </span>
        ) : (
          <span className="text-muted-foreground">
            {archived ? "Clasă arhivată" : "Nimic în așteptare"}
          </span>
        )}
        <ChevronRight
          className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
