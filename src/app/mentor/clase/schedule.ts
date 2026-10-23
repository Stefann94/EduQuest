// Programul unei clase („Sâmbătă, 10:00–11:30”), fără dependențe, ca să poată fi
// folosit și în formularele din browser.

export const WEEKDAYS = [
  "Luni",
  "Marți",
  "Miercuri",
  "Joi",
  "Vineri",
  "Sâmbătă",
  "Duminică",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

/** „Sâmbătă, 10:00–11:30” */
export const formatSchedule = (d: {
  day: Weekday;
  start: string;
  end: string;
}) => `${d.day}, ${d.start}–${d.end}`;

/** Inversul lui formatSchedule, pentru a precompleta formularul de editare. */
export function parseSchedule(schedule: string) {
  const m =
    /^\s*([^\s,]+)\s*,\s*(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/u.exec(
      schedule,
    );
  const day = WEEKDAYS.find(
    (d) => d.toLocaleLowerCase("ro-RO") === m?.[1].toLocaleLowerCase("ro-RO"),
  );
  const pad = (t?: string) => (t ? t.padStart(5, "0") : "");
  return { day, start: pad(m?.[2]), end: pad(m?.[3]) };
}

export type ClassFieldErrors = Partial<
  Record<"name" | "description" | "day" | "start" | "end", string>
>;

export type ClassFormValues = {
  name: string;
  description: string;
  day: string;
  start: string;
  end: string;
};
