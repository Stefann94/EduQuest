import Link from "next/link";
import type { StudentAssignment } from "@/lib/data/queries";
import { daysUntil, formatWeekday, plural } from "@/lib/format";
import { cn } from "@/lib/utils";

// Temele, în limbajul panoului: obligatorie = principală, opțională = secundară.
function mission(a: StudentAssignment) {
  if (a.submissionState === "needs_changes")
    return {
      kind: "Revino la misiune · feedback de la mentor",
      accent: "bg-warning",
      text: "text-warning",
    };
  return a.type === "required"
    ? { kind: "Misiune principală", accent: "bg-xp", text: "text-xp" }
    : { kind: "Misiune secundară", accent: "bg-cyan", text: "text-cyan" };
}

/** Timpul rămas, mare, în dreapta rândului. */
function Remaining({ a }: { a: StudentAssignment }) {
  if (a.submissionState === "needs_changes")
    return (
      <>
        <b className="block font-extrabold font-heading text-3xl text-warning leading-none">
          Corecturi
        </b>
        <span className="text-muted-foreground text-xs">retrimite tema</span>
      </>
    );
  if (a.submissionState === "submitted")
    return (
      <>
        <b className="block font-extrabold font-heading text-3xl text-info leading-none">
          Trimisă
        </b>
        <span className="text-muted-foreground text-xs">așteaptă review</span>
      </>
    );
  if (a.submissionState === "reviewed")
    return (
      <>
        <b className="block font-extrabold font-heading text-3xl text-success leading-none">
          Gata
        </b>
        <span className="text-muted-foreground text-xs">cu feedback</span>
      </>
    );
  if (!a.deadline)
    return (
      <b className="block font-extrabold font-heading text-3xl leading-none">
        Oricând
      </b>
    );
  const d = daysUntil(a.deadline);
  return (
    <>
      <b
        className={cn(
          "block font-extrabold font-heading text-3xl leading-none",
          a.overdue && "text-destructive",
        )}
      >
        {a.overdue
          ? "Depășit"
          : d <= 0
            ? "Azi"
            : d === 1
              ? "Mâine"
              : plural(d, "zi", "zile")}
      </b>
      <span className="text-muted-foreground text-xs">
        {formatWeekday(a.deadline).toLowerCase()}
      </span>
    </>
  );
}

/** O temă ca „misiune”: dungă colorată, tip, titlu, rezumat și timpul rămas. */
export function MissionRow({
  assignment: a,
}: {
  assignment: StudentAssignment;
}) {
  const m = mission(a);
  return (
    <Link
      href={`/teme/${a.id}`}
      className="group relative grid cut-sm grid-cols-[minmax(0,1fr)_auto] items-center gap-4 bg-card py-4 pr-5 pl-7 outline-none transition-[translate,background-color] duration-300 ease-out hover:translate-x-1.5 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70 focus-visible:ring-inset"
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-1.5 transition-[width] group-hover:w-2.5",
          m.accent,
        )}
      />
      <div className="min-w-0">
        <p
          className={cn(
            "font-bold font-heading text-[13px] uppercase tracking-widest",
            m.text,
          )}
        >
          {m.kind} · {a.className}
        </p>
        <p className="font-bold font-heading text-[22px] uppercase leading-tight tracking-wide">
          {a.title}
        </p>
        <p className="line-clamp-1 text-muted-foreground text-sm">
          {a.submissionState === "needs_changes" && a.submission?.feedback
            ? `„${a.submission.feedback.text}”`
            : a.summary}
        </p>
      </div>
      <div className="text-right">
        <Remaining a={a} />
      </div>
    </Link>
  );
}
