import { LayoutDashboard, Settings, UserCheck, Users } from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import type { NavGroup } from "@/components/shell/nav";
import type { SearchItem } from "@/components/shell/search-menu";
import {
  getMentorApplications,
  getNotifications,
  getViewer,
} from "@/lib/data/queries";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const me = await getViewer("admin");
  const [notifications, applications] = await Promise.all([
    getNotifications(me.id),
    getMentorApplications(),
  ]);
  const pending = applications.filter((a) => a.status === "pending").length;

  const nav: NavGroup[] = [
    {
      items: [
        {
          label: "Panou",
          href: "/admin",
          icon: <LayoutDashboard />,
          exact: true,
        },
        {
          label: "Aplicații",
          href: "/admin/aplicatii",
          icon: <UserCheck />,
          badge: pending,
        },
        { label: "Utilizatori", href: "/admin/utilizatori", icon: <Users /> },
        {
          label: "Setări",
          href: "/admin/setari",
          icon: <Settings />,
        },
      ],
    },
  ];

  const search: SearchItem[] = [
    ...nav[0].items.map((i) => ({
      label: i.label,
      hint: "Pagină",
      href: i.href,
      kind: "page" as const,
    })),
    ...applications.map((a) => ({
      label: a.fullName,
      hint: "Aplicație de mentor",
      href: `/admin/aplicatii/${a.id}`,
      kind: "page" as const,
    })),
  ];

  return (
    <AppShell
      nav={nav}
      home="/admin"
      user={{
        name: me.displayName,
        roleLabel: "Administrator",
        avatar: me.avatar,
      }}
      notifications={notifications}
      notificationsHref="/admin/aplicatii"
      settingsHref="/admin/setari"
      search={search}
    >
      {children}
    </AppShell>
  );
}
