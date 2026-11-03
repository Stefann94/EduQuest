"use client";

import {
  CalendarPlus,
  ChevronDown,
  PencilLine,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import {
  type AttendanceState,
  deleteMeeting,
  removeFromMeeting,
  saveAttendance,
} from "@/app/mentor/clase/[id]/prezenta/actions";
import { ATTENDANCE_STATUS, AttendanceBadge } from "@/components/common/status";
import { UserAvatar } from "@/components/common/user-avatar";
import { ConfirmDialog } from "@/components/mentor-content/confirm-dialog";
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
/** În formular: „none” = elevul nu e trecut la această întâlnire. */
type FormStatus = Status | "none";

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
  /** Numărul lecției în clasă (Lecția 3), dacă întâlnirea e pe o lecție. */
  lessonNumber: number | null;
  records: Record<string, Status>;
};
export type LessonOption = {
  id: string;
  label: string;
  /** Întâlnirea care are deja prezența pe această lecție. */
  meetingId?: string;
};

const INITIAL: AttendanceState = { status: "idle" };
const ORDER: FormStatus[] = ["present", "absent", "recovered", "none"];
const LABEL: Record<FormStatus, string> = {
  present: ATTENDANCE_STATUS.present.label,
  absent: ATTENDANCE_STATUS.absent.label,
  recovered: ATTENDANCE_STATUS.recovered.label,
  none: "Fără",
};

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
                classId={classId}
                meeting={m}
                students={students}
                onEdit={archived ? undefined : () => setEditing(m)}
                editable={!archived}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function MeetingRow({
  classId,
  meeting: m,
  students,
  onEdit,
  editable,
}: {
  classId: string;
  meeting: AttendanceMeetingView;
  students: AttendanceStudent[];
  onEdit?: () => void;
  editable: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, startBusy] = useTransition();
  const title = m.lessonTitle ?? m.topic;
  const lessonPrefix = m.lessonNumber ? `Lecția ${m.lessonNumber} · ` : "";
  const run = (task: () => Promise<{ ok: boolean; message: string }>) =>
    startBusy(async () => {
      const r = await task();
      if (r.ok) toast.success(r.message);
      else toast.error(r.message);
      router.refresh();
    });
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
              {m.lessonNumber ? (
                <span className="text-primary">{lessonPrefix}</span>
              ) : null}
              {title}
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
        {editable ? (
          <ConfirmDialog
            title="Ștergi prezența pentru această lecție?"
            description={`Întâlnirea „${lessonPrefix}${title}” din ${formatWeekday(m.date)} dispare, cu prezențele tuturor elevilor și XP-ul primit pentru ea. Lecția poate fi apoi notată din nou.`}
            confirmLabel="Șterge prezența"
            onConfirm={() => run(() => deleteMeeting(classId, m.id))}
            trigger={
              <Button
                variant="ghost"
                size="sm"
                disabled={busy}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 /> Șterge
              </Button>
            }
          />
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
            <span className="min-w-0 flex-1 truncate">{s.displayName}</span>
            {m.records[s.id] ? (
              <>
                <AttendanceBadge status={m.records[s.id]} />
                {editable ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={busy}
                    onClick={() =>
                      run(() => removeFromMeeting(classId, m.id, s.id))
                    }
                    aria-label={`Scoate-l pe ${s.displayName} de la această întâlnire`}
                    title="Trecut din greșeală? Scoate-l de la această întâlnire"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X aria-hidden="true" />
                  </Button>
                ) : null}
              </>
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
  // La corectură, cine nu era trecut rămâne „Fără”; la o întâlnire nouă, toți prezenți.
  const [statuses, setStatuses] = useState<Record<string, FormStatus>>(() =>
    Object.fromEntries(
      students.map((s) => [
        s.id,
        meeting ? (meeting.records[s.id] ?? "none") : "present",
      ]),
    ),
  );
  // Lecțiile cu prezența deja notată (la altă întâlnire) nu se mai pot alege.
  const available = lessons.filter(
    (l) => !l.meetingId || l.meetingId === meeting?.id,
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
  const set = (sid: string, s: FormStatus) =>
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
          hint={
            available.length < lessons.length
              ? "O lecție se notează o singură dată: cele cu prezența deja notată nu apar aici."
              : "Prezența se notează pe lecția planificată pentru întâlnire."
          }
        >
          <SelectField
            id="att-lesson"
            name="lessonId"
            value={lessonId}
            onValueChange={setLessonId}
            items={available.map((l) => ({ value: l.id, label: l.label }))}
            placeholder={
              available.length
                ? "Alege lecția"
                : lessons.length
                  ? "Toate lecțiile au prezența notată"
                  : "Clasa nu are lecții"
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
                              : st === "none"
                                ? "bg-foreground text-background"
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
                      {LABEL[st]}
                    </label>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="text-muted-foreground text-xs">
          „Recuperat”: elevul a făcut lecția cu altă grupă. Contează ca prezent
          și primește tot +2 XP. „Fără”: elevul nu e trecut la această întâlnire
          (de exemplu, a fost bifat din greșeală).
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
