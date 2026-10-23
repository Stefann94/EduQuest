"use client";

import {
  CalendarCheck,
  CalendarPlus,
  Check,
  CheckCheck,
  CircleAlert,
  Info,
  Pencil,
  Star,
  X,
} from "lucide-react";
import { useActionState, useState } from "react";
import { toast } from "sonner";
import {
  type AttendanceState,
  type SavedMeeting,
  saveAttendance,
} from "@/app/mentor/clase/[id]/prezenta/actions";
import { EmptyState } from "@/components/common/empty-state";
import { UserAvatar } from "@/components/common/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AvatarId } from "@/lib/data/types";
import { formatWeekday, plural } from "@/lib/format";
import { cn } from "@/lib/utils";
import { FieldError } from "./class-details-fields";
import { dateKey } from "./dates";

export type AttendanceStudent = {
  id: string;
  displayName: string;
  username?: string;
  avatar: AvatarId;
};

const INITIAL: AttendanceState = { status: "idle" };

const presentCount = (records: Record<string, boolean>) =>
  Object.values(records).filter(Boolean).length;

/** Istoricul prezenței și editorul pentru o întâlnire nouă sau pentru o corectură. */
export function AttendanceManager({
  classId,
  archived,
  students,
  initialMeetings,
  today,
}: {
  classId: string;
  archived: boolean;
  students: AttendanceStudent[];
  initialMeetings: SavedMeeting[];
  /** „Azi”, ca AAAA-LL-ZZ (ora României). */
  today: string;
}) {
  // Demo: modificările rămân în pagină. Cu Supabase, lista vine din baza de date.
  const [meetings, setMeetings] = useState(initialMeetings);
  const [editing, setEditing] = useState<SavedMeeting | "new" | null>(null);
  const [round, setRound] = useState(0);

  function open(target: SavedMeeting | "new") {
    setEditing(target);
    setRound((r) => r + 1);
  }

  function onSaved(meeting: SavedMeeting) {
    setMeetings((list) =>
      [meeting, ...list.filter((m) => m.id !== meeting.id)].sort((a, b) =>
        b.date.localeCompare(a.date),
      ),
    );
    setEditing(null);
  }

  return (
    <div className="grid gap-6">
      <XpRules />

      {editing ? (
        <AttendanceEditor
          key={round}
          classId={classId}
          students={students}
          meeting={editing === "new" ? undefined : editing}
          otherDates={meetings
            .filter((m) => editing === "new" || m.id !== editing.id)
            .map((m) => ({ key: dateKey(m.date), topic: m.topic }))}
          today={today}
          onCancel={() => setEditing(null)}
          onSaved={onSaved}
        />
      ) : null}

      <section className="rounded-xl border bg-card shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 className="font-semibold text-base">Istoricul prezenței</h2>
            <p className="text-muted-foreground text-sm">
              {plural(
                meetings.length,
                "întâlnire înregistrată",
                "întâlniri înregistrate",
              )}
            </p>
          </div>
          {!archived && editing === null ? (
            <Button onClick={() => open("new")}>
              <CalendarPlus aria-hidden="true" /> Înregistrează prezența
            </Button>
          ) : null}
        </div>
        <div className="p-2">
          {meetings.length > 0 ? (
            <ul className="stagger">
              {meetings.map((m) => {
                const present = presentCount(m.records);
                const total = Object.keys(m.records).length;
                const pct = total > 0 ? Math.round((present / total) * 100) : 0;
                const isEditing =
                  editing !== null && editing !== "new" && editing.id === m.id;
                return (
                  <li
                    key={m.id}
                    className={cn(
                      "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg px-3 py-3",
                      isEditing && "bg-accent",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="grid size-10 shrink-0 place-items-center rounded-lg bg-success-soft text-success"
                    >
                      <CalendarCheck className="size-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1 basis-48">
                      <p className="font-medium">{m.topic}</p>
                      <p className="text-muted-foreground text-sm">
                        {formatWeekday(m.date)}
                      </p>
                    </div>
                    <div className="w-36">
                      <p className="text-sm tabular-nums">
                        <span className="font-medium">{present}</span> din{" "}
                        {total} prezenți
                      </p>
                      <div
                        className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted"
                        aria-hidden="true"
                      >
                        <div
                          className="h-full rounded-full bg-success"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    {!archived ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => open(m)}
                        disabled={isEditing}
                        aria-label={`Corectează prezența: ${m.topic}, ${formatWeekday(m.date)}`}
                      >
                        <Pencil aria-hidden="true" /> Corectează
                      </Button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              icon={CalendarCheck}
              title="Nicio prezență înregistrată"
              description="După fiecare întâlnire, marchează cine a fost prezent. Elevii prezenți primesc câte +2 XP."
              className="m-3"
              action={
                !archived && editing === null ? (
                  <Button onClick={() => open("new")}>
                    <CalendarPlus aria-hidden="true" /> Înregistrează prezența
                  </Button>
                ) : undefined
              }
            />
          )}
        </div>
      </section>
    </div>
  );
}

function XpRules() {
  return (
    <aside className="flex gap-3 rounded-xl border bg-xp-soft/50 p-4 text-sm">
      <Star
        className="mt-0.5 size-4 shrink-0 fill-xp text-xp"
        aria-hidden="true"
      />
      <div className="grid gap-1">
        <p className="font-medium">Cum se acordă XP-ul pentru prezență</p>
        <p className="text-muted-foreground">
          Fiecare elev marcat prezent primește{" "}
          <strong className="text-foreground">+2 XP</strong>, o singură dată pe
          întâlnire. Dacă un elev trece de la absent la prezent, primește cei 2
          XP; dacă trece de la prezent la absent, XP-ul se retrage. Nu se acordă
          niciodată de două ori pentru aceeași întâlnire, iar fiecare modificare
          apare în istoricul de XP al elevului.
        </p>
      </div>
    </aside>
  );
}

function AttendanceEditor({
  classId,
  students,
  meeting,
  otherDates,
  today,
  onCancel,
  onSaved,
}: {
  classId: string;
  students: AttendanceStudent[];
  meeting?: SavedMeeting;
  otherDates: { key: string; topic: string }[];
  today: string;
  onCancel: () => void;
  onSaved: (m: SavedMeeting) => void;
}) {
  const isNew = !meeting;
  const [date, setDate] = useState(meeting ? dateKey(meeting.date) : today);
  const [topic, setTopic] = useState(meeting?.topic ?? "");
  const [records, setRecords] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      students.map((s) => [s.id, meeting?.records[s.id] ?? false]),
    ),
  );

  const [state, action, pending] = useActionState(
    async (prev: AttendanceState, formData: FormData) => {
      const res = await saveAttendance(prev, formData);
      if (res.status === "success") {
        const parts = [
          res.awarded > 0
            ? `+2 XP pentru ${plural(res.awarded, "elev", "elevi")}`
            : null,
          res.revoked > 0
            ? `2 XP retrași de la ${plural(res.revoked, "elev", "elevi")}`
            : null,
        ].filter(Boolean);
        toast.success(
          res.isNew
            ? "Prezența a fost înregistrată"
            : "Prezența a fost corectată",
          {
            description: `${parts.length > 0 ? `${parts.join(" · ")}. ` : "XP-ul nu se schimbă. "}${res.note}`,
          },
        );
        onSaved(res.meeting);
      } else if (res.status === "error" && res.message) {
        toast.error(res.message);
      }
      return res;
    },
    INITIAL,
  );

  const errors = state.status === "error" ? state.errors : {};
  const clash = otherDates.find((d) => d.key === date);
  const dateError =
    errors.date ??
    (clash
      ? `Există deja prezența din această zi („${clash.topic}”). Corecteaz-o pe aceea.`
      : undefined);

  const present = presentCount(records);
  const absent = students.length - present;
  let gained = 0;
  let lost = 0;
  for (const s of students) {
    const was = meeting?.records[s.id] ?? false;
    if (records[s.id] && !was) gained++;
    if (!records[s.id] && was) lost++;
  }

  const setAll = (value: boolean) =>
    setRecords(Object.fromEntries(students.map((s) => [s.id, value])));

  return (
    <form
      action={action}
      className="rounded-xl border bg-card shadow-xs ring-2 ring-primary/15"
    >
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="meetingId" value={meeting?.id ?? ""} />
      {meeting?.id.startsWith("nou-") ? (
        <>
          <input
            type="hidden"
            name="baseline"
            value={JSON.stringify(meeting.records)}
          />
          <input type="hidden" name="baselineDate" value={meeting.date} />
        </>
      ) : null}
      {students
        .filter((s) => records[s.id])
        .map((s) => (
          <input key={s.id} type="hidden" name="present" value={s.id} />
        ))}

      <div className="border-b px-5 py-4">
        <h2 className="font-semibold text-base">
          {isNew ? "Prezență nouă" : "Corectează prezența"}
        </h2>
        <p className="text-muted-foreground text-sm">
          {isNew
            ? "Alege data și tema întâlnirii, apoi marchează elevii prezenți."
            : "Modifică ce e nevoie. XP-ul se ajustează doar pentru elevii a căror stare se schimbă."}
        </p>
      </div>

      <div className="grid gap-5 p-5">
        <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
          <div className="grid content-start gap-2">
            <Label htmlFor="meeting-date">Data întâlnirii</Label>
            <Input
              id="meeting-date"
              name="date"
              type="date"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
              aria-invalid={dateError ? true : undefined}
              aria-describedby={dateError ? "meeting-date-error" : undefined}
              required
            />
            <FieldError id="meeting-date-error" message={dateError} />
          </div>
          <div className="grid content-start gap-2">
            <Label htmlFor="meeting-topic">Tema întâlnirii</Label>
            <Input
              id="meeting-topic"
              name="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="ex. Funcții cu parametri"
              maxLength={80}
              aria-invalid={errors.topic ? true : undefined}
              aria-describedby={
                errors.topic ? "meeting-topic-error" : undefined
              }
              required
            />
            <FieldError id="meeting-topic-error" message={errors.topic} />
          </div>
        </div>

        <div className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-sm" id="students-label">
              Elevi înscriși{" "}
              <span className="font-normal text-muted-foreground">
                · {present} prezenți, {absent} absenți
              </span>
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAll(true)}
                disabled={present === students.length}
              >
                <CheckCheck aria-hidden="true" /> Marchează toți prezenți
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAll(false)}
                disabled={present === 0}
              >
                Resetează
              </Button>
            </div>
          </div>

          <ul
            aria-labelledby="students-label"
            className="grid gap-2 sm:grid-cols-2"
          >
            {students.map((s) => {
              const isPresent = records[s.id];
              const was = meeting?.records[s.id];
              const changed = !isNew && was !== undefined && was !== isPresent;
              return (
                <li
                  key={s.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3 py-2.5",
                    isPresent
                      ? "border-success/30 bg-success-soft/40"
                      : "bg-card",
                  )}
                >
                  <UserAvatar name={s.displayName} avatar={s.avatar} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sm">
                      {s.displayName}
                    </p>
                    <p className="truncate text-muted-foreground text-xs">
                      {changed
                        ? isPresent
                          ? "Modificat: primește +2 XP"
                          : "Modificat: i se retrag 2 XP"
                        : s.username
                          ? `@${s.username}`
                          : null}
                    </p>
                  </div>
                  <fieldset className="flex shrink-0 rounded-lg border bg-background p-0.5">
                    <legend className="sr-only">
                      Prezența pentru {s.displayName}
                    </legend>
                    <ToggleOption
                      pressed={isPresent}
                      tone="success"
                      onClick={() =>
                        setRecords((r) => ({ ...r, [s.id]: true }))
                      }
                    >
                      <Check aria-hidden="true" /> Prezent
                    </ToggleOption>
                    <ToggleOption
                      pressed={!isPresent}
                      tone="neutral"
                      onClick={() =>
                        setRecords((r) => ({ ...r, [s.id]: false }))
                      }
                    >
                      <X aria-hidden="true" /> Absent
                    </ToggleOption>
                  </fieldset>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2.5 text-sm">
          <Info
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span>
            {isNew
              ? present > 0
                ? `La salvare, ${present === 1 ? "elevul prezent primește +2 XP" : `${plural(present, "elev", "elevi")} primesc câte +2 XP`} pentru această întâlnire.`
                : "Niciun elev marcat prezent: nu se acordă XP."
              : gained === 0 && lost === 0
                ? "Nicio schimbare față de prezența salvată: XP-ul rămâne la fel."
                : `${[
                    gained > 0
                      ? gained === 1
                        ? "1 elev trecut la prezent primește +2 XP"
                        : `${plural(gained, "elev", "elevi trecuți")} la prezent primesc câte +2 XP`
                      : null,
                    lost > 0
                      ? lost === 1
                        ? "1 elev trecut la absent pierde cei 2 XP"
                        : `${plural(lost, "elev", "elevi trecuți")} la absent pierd câte 2 XP`
                      : null,
                  ]
                    .filter(Boolean)
                    .join("; ")}.`}
          </span>
        </p>

        {state.status === "error" && state.message ? (
          <p
            role="alert"
            className="flex items-start gap-1.5 text-destructive text-sm"
          >
            <CircleAlert
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            {state.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 px-5 py-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={pending}
        >
          Anulează
        </Button>
        <Button type="submit" disabled={pending || !!clash}>
          {pending
            ? "Se salvează…"
            : isNew
              ? "Salvează prezența"
              : "Salvează corectura"}
        </Button>
      </div>
    </form>
  );
}

function ToggleOption({
  pressed,
  tone,
  onClick,
  children,
}: {
  pressed: boolean;
  tone: "success" | "neutral";
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-md px-2 font-medium text-xs outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-3.5",
        pressed
          ? tone === "success"
            ? "bg-success-soft text-success ring-1 ring-success/30"
            : "bg-secondary text-secondary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
