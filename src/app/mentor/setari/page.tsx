import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { AccountSettings } from "@/components/mentor-classes/account-settings";
import { getViewer } from "@/lib/data/queries";

export const metadata: Metadata = { title: "Setări cont" };

export default async function MentorAccountSettingsPage() {
  const me = await getViewer("mentor");

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
      />
    </div>
  );
}
