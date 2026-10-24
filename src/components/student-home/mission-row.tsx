import Link from "next/link";
import type { StudentHomework } from "@/lib/db/homework";
import { daysUntil, formatWeekday, plural } from "@/lib/format";
import { cn } from "@/lib/utils";

const needsChanges = (h: StudentHomework) =>
  h.problems.some((p) => p.state === "needs_changes");

// Temele, în limbajul panoului: obligatorie = principală, opțională = secundară.
function mission(h: StudentHomework) {
  if (needsChanges(h))
    return {
      kind: "Revino la misiune · feedback de la mentor",
      accent: "bg-warning",
      text: "text-warning",
    };
  return h.required
    ? {
        kind: "Misiune principală",
        accent: "bg-xp",
        text: "text-xp-foreground",
      }
    : { kind: "Misiune secundară", accent: "bg-cyan", text: "text-cyan" };
}

/** Timpul rămas (sau starea), mare, în dreapta rândului. */
function Remaining({ h }: { h: StudentHomework }) {
  if (needsChanges(h))
    return (
      <>
        <b className="block font-extrabold font-heading text-3xl text-warning leading-none">
          Corecturi
        </b>
        <span className="text-muted-foreground text-xs">
          retrimite problema
        </span>
      </>
    );
  if (h.complete)
    return (
      <>
        <b className="block font-extrabold font-heading text-3xl text-success leading-none">
          Trimisă
        </b>
        <span className="text-muted-foreground text-xs">
          {h.problems.every((p) => p.state === "accepted")
            ? "acceptată"
            : "așteaptă evaluarea"}
        </span>
      </>
    );
  if (!h.deadline)
    return (
      <b className="block font-extrabold font-heading text-3xl leading-none">
        Oricând
      </b>
    );
  const d = daysUntil(h.deadline);
  return (
    <>
      <b
        className={cn(
          "block font-extrabold font-heading text-3xl leading-none",
          h.overdue && "text-destructive",
        )}
      >
        {h.overdue
          ? "Depășit"
          : d <= 0
            ? "Azi"
            : d === 1
              ? "Mâine"
              : plural(d, "zi", "zile")}
      </b>
      <span className="text-muted-foreground text-xs">
        {h.progress.done} din {h.progress.total} ·{" "}
        {formatWeekday(h.deadline).toLowerCase()}
      </span>
    </>
  );
}

/** O temă ca „misiune”: dungă colorată, tip, titlu, problemele și timpul rămas. */
export function MissionRow({ homework: h }: { homework: StudentHomework }) {
  const m = mission(h);
  return (
    <Link
      href={`/teme/${h.id}`}
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
            "font-bold font-heading text-xs uppercase tracking-widest",
            m.text,
          )}
        >
          {m.kind} · {h.className}
        </p>
        <p className="font-bold font-heading text-[22px] uppercase leading-tight tracking-wide">
          {h.title}
        </p>
        <p className="line-clamp-1 text-muted-foreground text-sm">
          {h.problems.map((p) => p.title).join(" · ")}
        </p>
      </div>
      <div className="text-right">
        <Remaining h={h} />
      </div>
    </Link>
  );
}
