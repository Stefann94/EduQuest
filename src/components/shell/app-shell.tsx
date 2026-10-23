import { Logo } from "@/components/brand/logo";
import type { Notification } from "@/lib/data/types";
import { AccountMenu } from "./account-menu";
import { MobileNav } from "./mobile-nav";
import type { NavGroup, ShellUser } from "./nav";
import { NotificationsMenu } from "./notifications-menu";
import { type SearchItem, SearchMenu } from "./search-menu";
import { SidebarNav } from "./sidebar";

/**
 * Cadrul comun pentru elev, mentor și administrator: meniu lateral pe desktop,
 * sertar pe telefon și bara de sus cu căutare, notificări și cont.
 */
export function AppShell({
  nav,
  home,
  user,
  notifications,
  notificationsHref,
  settingsHref,
  search,
  quickAction,
  children,
}: {
  nav: NavGroup[];
  home: string;
  user: ShellUser;
  notifications: Notification[];
  notificationsHref: string;
  settingsHref: string;
  search: SearchItem[];
  /** O acțiune importantă, mereu la îndemână (ex. „Intră în quiz live”). */
  quickAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r bg-card lg:block">
        <SidebarNav groups={nav} home={home} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-[45] flex h-16 shrink-0 items-center gap-2 border-b bg-card/95 px-3 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-1 lg:hidden">
            <MobileNav groups={nav} home={home} />
            <Logo
              href={home}
              className="[&>span:last-child]:hidden sm:[&>span:last-child]:inline"
            />
          </div>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <SearchMenu items={search} />
            {quickAction}
            <NotificationsMenu
              initial={notifications}
              allHref={notificationsHref}
            />
            <span
              aria-hidden="true"
              className="mx-1 hidden h-6 w-px bg-border sm:block"
            />
            <AccountMenu user={user} settingsHref={settingsHref} />
          </div>
        </header>

        <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
