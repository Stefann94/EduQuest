// Toate datele se formatează în română, pe ora României, ca serverul și browserul
// să afișeze același text (fără nepotriviri la hidratare).
const TZ = "Europe/Bucharest";

const dayMonth = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "long",
  timeZone: TZ,
});
const weekdayDayMonth = new Intl.DateTimeFormat("ro-RO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: TZ,
});
const dayMonthYear = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TZ,
});
const time = new Intl.DateTimeFormat("ro-RO", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TZ,
});
const shortDate = new Intl.DateTimeFormat("ro-RO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: TZ,
});

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** „23 octombrie” */
export const formatDay = (iso: string) => dayMonth.format(new Date(iso));

/** „Joi, 23 octombrie” */
export const formatWeekday = (iso: string) =>
  capitalize(weekdayDayMonth.format(new Date(iso)));

/** „23 octombrie 2026” */
export const formatDate = (iso: string) => dayMonthYear.format(new Date(iso));

/** „10:15” */
export const formatTime = (iso: string) => time.format(new Date(iso));

/** „Joi, 23 octombrie, 10:15” */
export const formatDateTime = (iso: string) =>
  `${formatWeekday(iso)}, ${formatTime(iso)}`;

/** „23.10.2026” */
export const formatShortDate = (iso: string) => shortDate.format(new Date(iso));

/** „Acum”: ora reală (pe server se citește la cerere, după sesiune). */
export const now = () => new Date();

const DAY = 24 * 60 * 60 * 1000;

/** Zile întregi până la o dată (negativ = în trecut). */
export function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - now().getTime()) / DAY);
}

/** „azi”, „mâine”, „în 5 zile”, „acum 2 zile” */
export function relativeDays(iso: string) {
  const d = daysUntil(iso);
  if (d === 0) return "azi";
  if (d === 1) return "mâine";
  if (d === -1) return "ieri";
  if (d > 1) return `în ${d} zile`;
  return `acum ${-d} zile`;
}

export const isPast = (iso: string) =>
  new Date(iso).getTime() < now().getTime();

/** „+2 XP” */
export const formatXp = (amount: number) =>
  `${amount > 0 ? "+" : ""}${amount} XP`;

export const plural = (n: number, one: string, many: string) =>
  n === 1 ? `${n} ${one}` : `${n} ${n >= 20 ? `de ${many}` : many}`;

/** „35 min”, „2 h”, „7 h 5 min” */
export function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function formatFileSize(kb: number) {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
