import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { AccountSettings } from "@/components/mentor-classes/account-settings";
import { requireUser } from "@/lib/auth";
import { getNotificationPrefs } from "@/lib/db/notifications";

export const metadata: Metadata = { title: "Setări cont" };

export default async function MentorAccountSettingsPage() {
  const me = await requireUser("mentor");
  const prefs = await getNotificationPrefs(me.id);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Setări cont"
        description="Profilul, datele de autentificare și notificările tale."
      />
      <AccountSettings
        displayName={me.displayName}
        email={me.email}
        avatar={me.avatar}
        prefs={{
          submissions: prefs.submissions ?? true,
          resubmissions: prefs.resubmissions ?? true,
          classActivity: prefs.classActivity ?? true,
        }}
      />
    </div>
  );
}
