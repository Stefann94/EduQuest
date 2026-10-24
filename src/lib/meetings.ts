// Următoarea întâlnire a unei clase, dedusă din programul ei („Sâmbătă, 10:00–11:30”).
// Funcții pure, fără acces la date.

import {
  dateKey,
  localToIso,
  weekdayIndex,
} from "@/components/mentor-classes/dates";
import type { ClassStatus } from "./data/types";
import { now } from "./format";

const WEEKDAYS: Record<string, number> = {
  duminică: 0,
  luni: 1,
  marți: 2,
  miercuri: 3,
  joi: 4,
  vineri: 5,
  sâmbătă: 6,
};

const weekdayInRomania = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  timeZone: "Europe/Bucharest",
});
const EN_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DAY = 24 * 60 * 60 * 1000;

/**
 * Data următoarei întâlniri (pentru afișare) și intervalul orar, sau nimic pentru
 * clasele arhivate ori programele pe care nu le putem interpreta.
 */
export function getNextMeeting(c: { schedule: string; status: ClassStatus }) {
  if (c.status !== "active") return undefined;
  const [dayPart, timePart] = c.schedule.split(",").map((s) => s.trim());
  const target = WEEKDAYS[dayPart?.toLowerCase() ?? ""];
  if (target === undefined) return undefined;
  const today = EN_DAYS.indexOf(weekdayInRomania.format(now()));
  const offset = (target - today + 7) % 7;
  return {
    iso: new Date(now().getTime() + offset * DAY).toISOString(),
    time: timePart,
    inDays: offset,
  };
}

/**
 * Următoarea întâlnire după `from`, calculată din programul clasei
 * („Sâmbătă, 10:00–11:30”). Întoarce ISO sau undefined dacă programul nu se poate citi.
 */
export function nextMeetingFromSchedule(
  schedule: string,
  from: Date,
): string | undefined {
  const m = /^\s*([^\s,]+)\s*,\s*(\d{1,2}):(\d{2})/u.exec(schedule);
  if (!m) return undefined;
  const weekday = WEEKDAYS[m[1].toLocaleLowerCase("ro-RO")];
  if (weekday === undefined) return undefined;
  const time = `${m[2].padStart(2, "0")}:${m[3]}`;

  const today = dateKey(from);
  const wd = weekdayIndex(from);
  for (let add = 0; add <= 7; add++) {
    if ((wd + add) % 7 !== weekday) continue;
    const day = new Date(Date.parse(`${today}T12:00:00Z`) + add * 86_400_000)
      .toISOString()
      .slice(0, 10);
    const at = localToIso(day, time);
    if (Date.parse(at) > from.getTime()) return at;
  }
  return undefined;
}

/** Următoarele întâlniri din clasele active, cele mai apropiate primele. */
export function upcomingMeetings(
  classes: {
    id: string;
    name: string;
    schedule: string;
    status: ClassStatus;
  }[],
  from: Date,
) {
  return classes
    .filter((c) => c.status === "active")
    .map((c) => ({
      classId: c.id,
      className: c.name,
      schedule: c.schedule,
      at: nextMeetingFromSchedule(c.schedule, from),
    }))
    .filter((x): x is typeof x & { at: string } => x.at !== undefined)
    .sort((a, b) => a.at.localeCompare(b.at));
}
