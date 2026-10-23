"use client";

import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  ClipboardList,
  Clock,
  RotateCcw,
  SearchX,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/common/empty-state";
import {
  AssignmentTypeBadge,
  PublicationBadge,
} from "@/components/common/status";
import { buttonVariants } from "@/components/ui/button";
import type { Assignment } from "@/lib/data/types";
import { formatDateTime, isPast, relativeDays } from "@/lib/format";
import { cn } from "@/lib/utils";
import { FilterBar, FilterSelect } from "./filter-select";

export type MentorAssignmentItem = Assignment & {
  className: string;
  totalStudents: number;
  counts: {
    submitted: number;
    reviewed: number;
    needsChanges: number;
    notStarted: number;
  };
};

export function AssignmentList({
  assignments,
  classes,
}: {
  assignments: MentorAssignmentItem[];
  classes: { id: string; name: string }[];
}) {
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const shown = assignments.filter(
    (a) =>
      (classFilter === "all" || a.classId === classFilter) &&
      (statusFilter === "all" ||
        (statusFilter === "to_review"
          ? a.counts.submitted > 0
          : a.status === statusFilter)),
  );

  if (assignments.length === 0)
    return (
      <EmptyState
        icon={ClipboardList}
        title="Nu ai creat încă nicio temă"
        description="Creează o temă pentru una dintre clasele tale. Elevii primesc o notificare când o publici."
        action={
          <Link href="/mentor/teme/nou" className={buttonVariants()}>
            Temă nouă
          </Link>
        }
      />
    );

  return (
    <div className="grid gap-4">
      <FilterBar
        summary={`${shown.length} din ${assignments.length} ${assignments.length === 1 ? "temă" : "teme"}`}
      >
        <FilterSelect
          label="Filtrează după clasă"
          value={classFilter}
          onChange={setClassFilter}
          items={[
            { value: "all", label: "Toate clasele" },
            ...classes.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <FilterSelect
          label="Filtrează după stare"
          value={statusFilter}
          onChange={setStatusFilter}
          items={[
            { value: "all", label: "Toate stările" },
            { value: "to_review", label: "Cu trimiteri de revizuit" },
            { value: "published", label: "Publicate" },
            { value: "draft", label: "Ciorne" },
          ]}
        />
      </FilterBar>

      {shown.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Nicio temă pentru filtrele alese"
          description="Schimbă clasa sau starea ca să vezi și alte teme."
        />
      ) : (
        <ul className="stagger grid gap-3">
          {shown.map((a) => (
            <li key={a.id}>
              <AssignmentCard assignment={a} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AssignmentCard({
  assignment: a,
}: {
  assignment: MentorAssignmentItem;
}) {
  const required = a.type === "required";
  const closed = a.deadline ? isPast(a.deadline) : false;
  return (
    <Link
      href={`/mentor/teme/${a.id}`}
      className={cn(
        "group grid gap-3 rounded-xl border bg-card p-4 shadow-xs outline-none transition-colors hover:border-foreground/15 focus-visible:ring-3 focus-visible:ring-ring/40 sm:p-5",
        // Temele obligatorii au o bandă în culoarea principală, ca să se distingă.
        required && "border-l-4 border-l-primary",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold group-hover:text-primary">{a.title}</p>
            <AssignmentTypeBadge type={a.type} />
            <PublicationBadge status={a.status} />
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-muted-foreground text-sm">
            <span>{a.className}</span>
            <span aria-hidden="true">·</span>
            {a.deadline ? (
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="size-3.5" aria-hidden="true" />
                {closed ? "Termen trecut: " : "Termen: "}
                {formatDateTime(a.deadline)} ({relativeDays(a.deadline)})
              </span>
            ) : (
              <span>Fără termen</span>
            )}
          </p>
        </div>
        <ChevronRight
          className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </div>
      {a.status === "published" ? (
        <ul className="flex flex-wrap gap-2 text-xs">
          <Count
            icon={Clock}
            label="de revizuit"
            value={a.counts.submitted}
            className={
              a.counts.submitted > 0
                ? "bg-info-soft text-info"
                : "bg-secondary text-muted-foreground"
            }
          />
          <Count
            icon={CheckCircle2}
            label={a.counts.reviewed === 1 ? "revizuită" : "revizuite"}
            value={a.counts.reviewed}
            className="bg-secondary text-secondary-foreground"
          />
          <Count
            icon={RotateCcw}
            label="corecturi cerute"
            value={a.counts.needsChanges}
            className="bg-secondary text-secondary-foreground"
          />
          <Count
            icon={CircleDashed}
            label={a.counts.notStarted === 1 ? "neîncepută" : "neîncepute"}
            value={a.counts.notStarted}
            className="bg-secondary text-secondary-foreground"
          />
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm">
          Ciornă: elevii nu o văd încă. Deschide tema ca să o verifici înainte
          de publicare.
        </p>
      )}
    </Link>
  );
}

function Count({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof Clock;
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full px-2.5",
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      <span className="font-semibold tabular-nums">{value}</span>
      {label}
    </li>
  );
}
