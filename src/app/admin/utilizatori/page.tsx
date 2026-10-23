import { Info, Lock } from "lucide-react";
import type { Metadata } from "next";
import { UsersTable } from "@/components/admin/users-table";
import { PageHeader } from "@/components/common/page-header";
import { getAdminUsers } from "@/lib/data/admin-queries";
import { getViewer } from "@/lib/data/queries";

export const metadata: Metadata = { title: "Utilizatori" };

export default async function UsersPage() {
  const me = await getViewer("admin");
  const users = await getAdminUsers(me);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Utilizatori"
        description="Toate conturile platformei. Poți suspenda, reactiva sau dezactiva un cont, cu un motiv înregistrat."
        meta={
          <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Lock className="size-3.5" aria-hidden="true" />
            Căutarea după nume și email este disponibilă doar administratorilor.
          </span>
        }
      />

      <p className="flex items-start gap-2.5 rounded-lg border bg-info-soft/60 px-4 py-3 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden="true" />
        <span>
          Rolurile nu se pot schimba din această pagină. Un cont de mentor se
          creează doar prin aprobarea unei aplicații de mentor, iar propriul
          cont de administrator nu îl poți modifica de aici.
        </span>
      </p>

      <UsersTable users={users} viewerId={me.id} />
    </div>
  );
}
