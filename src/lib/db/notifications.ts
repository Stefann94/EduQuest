import "server-only";
import type { Notification } from "@/lib/data/types";
import {
  hiddenKinds,
  type NotificationPrefs,
  readPrefs,
} from "@/lib/notification-prefs";
import { db, must } from "./core";

/** Preferințele de notificare ale contului logat. */
export async function getNotificationPrefs(
  userId: string,
): Promise<NotificationPrefs> {
  const supabase = await db();
  const { data } = await supabase
    .from("profiles")
    .select("notification_prefs")
    .eq("id", userId)
    .maybeSingle();
  return readPrefs(data?.notification_prefs);
}

/**
 * Notificările contului logat (RLS: doar ale lui), cele mai noi primele, fără tipurile
 * pe care le-a dezactivat din Setări.
 */
export async function getNotifications(
  userId: string,
): Promise<Notification[]> {
  const supabase = await db();
  const [rows, prefs] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, user_id, kind, title, body, href, at, read")
      .eq("user_id", userId)
      .order("at", { ascending: false })
      .limit(100),
    getNotificationPrefs(userId),
  ]);
  const hidden = hiddenKinds(prefs);
  return must("Notificările", rows)
    .filter((n) => !hidden.has(n.kind))
    .map((n) => ({
      id: n.id,
      userId: n.user_id,
      kind: n.kind,
      title: n.title,
      body: n.body,
      href: n.href,
      at: n.at,
      read: n.read,
    }));
}
