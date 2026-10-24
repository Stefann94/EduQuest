import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import {
  type NotificationItem,
  NotificationsList,
} from "@/components/student-activity/notifications-list";
import { requireUser } from "@/lib/auth";
import { getNotifications } from "@/lib/db/notifications";
import { formatDay, formatTime } from "@/lib/format";
import { notificationGroup } from "@/lib/notification-group";

export const metadata: Metadata = { title: "Notificări" };

export default async function NotificationsPage() {
  const me = await requireUser("student");
  const notifications = await getNotifications(me.id);

  const items: NotificationItem[] = notifications.map((n) => {
    const group = notificationGroup(n.at);
    return {
      id: n.id,
      kind: n.kind,
      title: n.title,
      body: n.body,
      href: n.href,
      read: n.read,
      group,
      timeLabel:
        group === "earlier"
          ? `${formatDay(n.at)}, ${formatTime(n.at)}`
          : formatTime(n.at),
    };
  });

  return (
    <div className="grid max-w-3xl gap-6">
      <PageHeader
        title="Notificări"
        description="Teme noi, termene, feedback și quiz-uri din clasele tale."
      />
      <NotificationsList initial={items} />
      <p className="text-muted-foreground text-sm">
        Poți alege ce notificări vezi din Setări cont.
      </p>
    </div>
  );
}
