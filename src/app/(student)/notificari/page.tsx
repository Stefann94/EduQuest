import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { DemoNote } from "@/components/student-activity/field-error";
import {
  type NotificationItem,
  NotificationsList,
} from "@/components/student-activity/notifications-list";
import { getNotifications, getViewer } from "@/lib/data/queries";
import { notificationGroup } from "@/lib/data/student-activity-queries";
import { formatDay, formatTime } from "@/lib/format";

export const metadata: Metadata = { title: "Notificări" };

export default async function NotificationsPage() {
  const me = await getViewer("student");
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
      <DemoNote>
        Demo: starea „citită” se păstrează după conectarea la baza de date. Poți
        alege ce notificări primești din Setări cont.
      </DemoNote>
    </div>
  );
}
