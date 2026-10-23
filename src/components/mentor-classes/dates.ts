// Calcule cu date calendaristice pe ora României, la fel pe server și în browser.
// (Formatarea pentru afișare rămâne în lib/format.ts.)

const TZ = "Europe/Bucharest";

const keyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const offsetFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  timeZoneName: "longOffset",
});

const weekdayFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  weekday: "short",
});

/** Ziua (în România) a unui moment, ca „2026-10-23”. */
export const dateKey = (iso: string | Date) =>
  keyFormat.format(typeof iso === "string" ? new Date(iso) : iso);

/** Ziua săptămânii (0 = duminică) în România. */
export const weekdayIndex = (at: Date) =>
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    weekdayFormat.format(at),
  );

/** Decalajul față de UTC (în minute) al orei României la un moment dat. */
export function bucharestOffset(at: Date) {
  const name =
    offsetFormat.formatToParts(at).find((p) => p.type === "timeZoneName")
      ?.value ?? "GMT+02:00";
  const m = /GMT([+-])(\d{2}):(\d{2})/.exec(name);
  if (!m) return 120;
  return (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]));
}

/** „2026-10-24” + „10:00” (ora României) → ISO, ținând cont de ora de vară. */
export function localToIso(date: string, time = "12:00") {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const offset = bucharestOffset(new Date(guess - 120 * 60_000));
  return new Date(guess - offset * 60_000).toISOString();
}

/** Câte zile calendaristice sunt între două momente (pozitiv = `iso` e înainte de `ref`). */
export function daysBefore(iso: string, ref: string) {
  const a = Date.parse(`${dateKey(iso)}T00:00:00Z`);
  const b = Date.parse(`${dateKey(ref)}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}
