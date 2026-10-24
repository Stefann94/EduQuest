import { formatShortDate, now } from "./format";

export type NotificationGroup = "today" | "yesterday" | "earlier";

/** Grupul unei notificări, după ziua calendaristică din România, față de `now()`. */
export function notificationGroup(iso: string): NotificationGroup {
  const today = formatShortDate(now().toISOString());
  const yesterday = formatShortDate(
    new Date(now().getTime() - 24 * 60 * 60 * 1000).toISOString(),
  );
  const day = formatShortDate(iso);
  if (day === today) return "today";
  if (day === yesterday) return "yesterday";
  return "earlier";
}
