import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { NotificationsList } from "@/components/mentor-classes/notifications-list";
import { requireUser } from "@/lib/auth";
import { getNotifications } from "@/lib/db/notifications";
import { now } from "@/lib/format";

export const metadata: Metadata = { title: "Notificări" };

export default async function MentorNotificationsPage() {
  const me = await requireUser("mentor");
  const notifications = await getNotifications(me.id);

  return (
    <div className="grid max-w-3xl gap-6">
      <PageHeader
        title="Notificări"
        description="Trimiteri noi, retrimiteri și activitatea din clasele tale."
      />
      <NotificationsList initial={notifications} nowIso={now().toISOString()} />
    </div>
  );
}
