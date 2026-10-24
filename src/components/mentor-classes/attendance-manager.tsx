"use client";

import {
  CalendarPlus,
  ChevronDown,
  PencilLine,
  TriangleAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import {
  type AttendanceState,
  saveAttendance,
} from "@/app/mentor/clase/[id]/prezenta/actions";
import { ATTENDANCE_STATUS, AttendanceBadge } from "@/components/common/status";
import { UserAvatar } from "@/components/common/user-avatar";
import {
  Field,
  FormMessage,
  SelectField,
} from "@/components/mentor-content/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AvatarId } from "@/lib/data/types";
import { formatWeekday } from "@/lib/format";
import { cn } from "@/lib/utils";
import { dateKey } from "./dates";

type Status = "present" | "absent" | "recovered";

export type AttendanceStudent = {
  id: string;
  displayName: string;
  username?: string;
  avatar: AvatarId;
  /** Absențe până acum (pentru avertismentul „mai mult de 2”). */
  absences: number;
};

export type AttendanceMeetingView = {
  id: string;
  date: string;
  topic: string;
  lessonId: string | null;
  lessonTitle: string | null;
  records: Record<string, Status>;
};

export type LessonOption = { id: string; label: string };

const INITIAL: AttendanceState = { status: "idle" };
const ORDER: Status[] = ["present", "absent", "recovered"];

/**
 * Prezența unei clase: o întâlnire nouă (pe lecția planificată) sau corectarea uneia
 * vechi. Fiecare elev: prezent, absent sau recuperat (a făcut lecția cu altă grupă).
 */
export function AttendanceManager({
  classId,
  archived,
  today,
  students,
  lessons,
  suggestedLessonId,
  meetings,
}: {
  classId: string;
  archived: boolean;
  today: string;
  students: AttendanceStudent[];
  lessons: LessonOption[];
  suggestedLessonId?: string;
  meetings: AttendanceMeetingView[];
}) {
  const [editing, setEditing] = useState<AttendanceMeetingView | "new" | null>(
    archived || students.length === 0 ? null : "new",
  );

  return (
    <div className="grid gap-6">
      {editing ? (
        <MeetingForm
          key={editing === "new" ? "new" : editing.id}
          classId={classId}
          today={today}
          students={students}
          lessons={lessons}
          meeting={editing === "new" ? undefined : editing}
          suggestedLessonId={suggestedLessonId}
          onDone={() => setEditing(null)}
        />
      ) : !archived && students.length > 0 ? (
        <Button className="w-fit" onClick={() => setEditing("new")}>
          <CalendarPlus /> Notează prezența
        </Button>
      ) : null}

      <section aria-labelledby="istoric-prezenta" className="grid gap-3">
        <h3 id="istoric-prezenta" className="text-xl">
          Întâlnirile clasei
        </h3>
        {meetings.length === 0 ? (
          <p className="cut-sm bg-card px-4 py-6 text-center text-muted-foreground text-sm">
            Nicio întâlnire notată încă.
          </p>
        ) : (
          <ul className="grid gap-2">
            {meetings.map((m) => (
              <MeetingRow
                key={m.id}
                meeting={m}
                students={students}
                onEdit={archived ? undefined : () => setEditing(m)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function MeetingRow({
  meeting: m,
  students,
  onEdit,
}: {
  meeting: AttendanceMeetingView;
  students: AttendanceStudent[];
  onEdit?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const count = (s: Status) =>
    Object.values(m.records).filter((x) => x === s).length;
  return (
    <li className="cut-sm bg-card">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none focus-visible:underline"
        >
          <ChevronDown
            className={cn(
              "size-4 shrink-0 transition-transform",
              open && "rotate-180",
            )}
            aria-hidden="true"
          />
          <span className="min-w-0">
            <span className="block truncate font-medium">
              {m.lessonTitle ?? m.topic}
            </span>
            <span className="block text-muted-foreground text-sm">
              {formatWeekday(m.date)}
            </span>
          </span>
        </button>
        <span className="flex flex-wrap gap-1.5 text-sm tabular-nums">
          <span className="text-success">{count("present")} P</span>
          <span aria-hidden="true">·</span>
          <span className="text-xp-foreground">{count("recovered")} R</span>
          <span aria-hidden="true">·</span>
          <span className="text-destructive">{count("absent")} A</span>
        </span>
        {onEdit ? (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <PencilLine /> Corectează
          </Button>
        ) : null}
      </div>
      <ul
        id={id}
        hidden={!open}
        className="grid gap-1 border-t px-4 py-3 sm:grid-cols-2"
      >
        {students.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between gap-3 py-1 text-sm"
          >
            <span className="truncate">{s.displayName}</span>
            {m.records[s.id] ? (
              <AttendanceBadge status={m.records[s.id]} />
            ) : (
              <span className="text-muted-foreground text-xs">nemarcat</span>
            )}
          </li>
        ))}
      </ul>
    </li>
  );
}

function MeetingForm({
  classId,
  today,
  students,
  lessons,
  meeting,
  suggestedLessonId,
  onDone,
}: {
  classId: string;
  today: string;
  students: AttendanceStudent[];
  lessons: LessonOption[];
  meeting?: AttendanceMeetingView;
  suggestedLessonId?: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveAttendance, INITIAL);
  const [lessonId, setLessonId] = useState(
    meeting?.lessonId ?? suggestedLessonId ?? "",
  );
  const [statuses, setStatuses] = useState<Record<string, Status>>(() =>
    Object.fromEntries(
      students.map((s) => [s.id, meeting?.records[s.id] ?? "present"]),
    ),
  );

  // Fiecare rezultat reușit se tratează o singură dată (onDone se schimbă la fiecare randare).
  const handled = useRef<AttendanceState>(INITIAL);
  useEffect(() => {
    if (state.status !== "success" || handled.current === state) return;
    handled.current = state;
    toast.success(state.message);
    router.refresh();
    onDone();
  });

  const errors = state.status === "error" ? state.errors : {};
  const set = (sid: string, s: Status) =>
    setStatuses((x) => ({ ...x, [sid]: s }));

  return (
    <form action={action} className="grid cut gap-5 bg-card p-5">
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="meetingId" value={meeting?.id ?? ""} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl">
          {meeting ? "Corectează prezența" : "Întâlnire nouă"}
        </h3>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setStatuses(
                Object.fromEntries(students.map((s) => [s.id, "present"])),
              )
            }
          >
            Toți prezenți
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
        <Field id="att-date" label="Data" error={errors.date}>
          <Input
            id="att-date"
            name="date"
            type="date"
            max={today}
            defaultValue={meeting ? dateKey(meeting.date) : today}
            aria-invalid={errors.date ? true : undefined}
          />
        </Field>
        <Field
          id="att-lesson"
          label="Lecția făcută"
          error={errors.lesson}
          hint="Prezența se notează pe lecția planificată pentru întâlnire."
        >
          <SelectField
            id="att-lesson"
            name="lessonId"
            value={lessonId}
            onValueChange={setLessonId}
            items={lessons.map((l) => ({ value: l.id, label: l.label }))}
            placeholder={
              lessons.length ? "Alege lecția" : "Clasa nu are lecții"
            }
            error={errors.lesson}
          />
        </Field>
      </div>
      <input
        type="hidden"
        name="topic"
        value={meeting && !meeting.lessonId ? meeting.topic : ""}
      />

      <fieldset className="grid gap-2">
        <legend className="mb-2 font-bold font-heading text-sm uppercase tracking-wide">
          Elevii ({students.length})
        </legend>
        <ul className="grid gap-1.5">
          {students.map((s) => {
            const value = statuses[s.id];
            const warn =
              s.absences +
                (value === "absent" && meeting?.records[s.id] !== "absent"
                  ? 1
                  : 0) >
              2;
            return (
              <li
                key={s.id}
                className="flex flex-wrap items-center gap-3 bg-muted/50 px-3 py-2"
              >
                <UserAvatar name={s.displayName} avatar={s.avatar} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">
                    {s.displayName}
                  </span>
                  {warn ? (
                    <span className="flex items-center gap-1 text-destructive text-xs">
                      <TriangleAlert className="size-3.5" aria-hidden="true" />
                      Mai mult de 2 absențe: nu poate termina cursul
                    </span>
                  ) : s.absences > 0 ? (
                    <span className="block text-muted-foreground text-xs">
                      {s.absences === 1 ? "1 absență" : `${s.absences} absențe`}{" "}
                      până acum
                    </span>
                  ) : null}
                </span>
                <div
                  role="radiogroup"
                  aria-label={`Prezența: ${s.displayName}`}
                  className="flex gap-1"
                >
                  {ORDER.map((st) => (
                    <label
                      key={st}
                      className={cn(
                        "flex h-9 cursor-pointer items-center gap-1.5 px-3 font-bold font-heading text-xs uppercase tracking-wide transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/70",
                        "slant",
                        value === st
                          ? st === "present"
                            ? "bg-success text-white"
                            : st === "absent"
                              ? "bg-destructive text-white"
                              : "bg-xp text-xp-foreground"
                          : "bg-card text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <input
                        type="radio"
                        name={`status:${s.id}`}
                        value={st}
                        checked={value === st}
                        onChange={() => set(s.id, st)}
                        className="sr-only"
                      />
                      {ATTENDANCE_STATUS[st].label}
                    </label>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="text-muted-foreground text-xs">
          „Recuperat”: elevul a făcut lecția cu altă grupă. Contează ca prezent
          și primește tot +2 XP.
        </p>
      </fieldset>

      <FormMessage
        message={state.status === "error" ? state.message : undefined}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="cta" disabled={pending}>
          {pending
            ? "Se salvează…"
            : meeting
              ? "Salvează corectura"
              : "Salvează prezența"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Renunță
        </Button>
      </div>
    </form>
  );
}
