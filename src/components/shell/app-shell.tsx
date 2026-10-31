import { Logo } from "@/components/brand/logo";
import type { Notification } from "@/lib/data/types";
import { AccountMenu } from "./account-menu";
import { LiveRefresh } from "./live-refresh";
import { MobileNav } from "./mobile-nav";
import type { NavGroup, ShellUser } from "./nav";
import { NotificationsMenu } from "./notifications-menu";
import { type SearchItem, SearchMenu } from "./search-menu";
import { TopNavLink } from "./top-nav-link";

/**
 * Cadrul comun pentru elev, mentor și administrator: o bară de sus cu logo,
 * secțiunile principale, căutare, notificări și cont. Pe ecrane mici,
 * secțiunile se deschid dintr-un sertar (butonul de meniu).
 *
 * Primul grup din `nav` apare în bară; celelalte (ex. Notificări, Setări)
 * sunt deja accesibile din clopoțel și din meniul contului, deci apar doar în sertar.
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
  status,
  children,
}: {
  nav: NavGroup[];
  home: string;
  user: ShellUser;
  notifications: Notification[];
  notificationsHref: string;
  settingsHref: string;
  search: SearchItem[];
  /** O acțiune importantă, mereu la îndemână (ex. „Quiz live”). */
  quickAction?: React.ReactNode;
  /** Un indicator mic, lângă cont (ex. XP-ul elevului). */
  status?: React.ReactNode;
  children: React.ReactNode;
}) {
  const primary = nav[0]?.items ?? [];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-[45] border-b-2 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-[68px] w-full max-w-6xl items-center gap-1.5 px-4 sm:px-6 xl:gap-2 xl:px-0">
          <div className="lg:hidden">
            <MobileNav groups={nav} home={home} />
          </div>
          <Logo href={home} className="mr-2 xl:mr-4" />

          <nav
            aria-label="Navigare principală"
            className="hidden items-center gap-0.5 lg:flex"
          >
            {primary.map((item) => (
              <TopNavLink key={item.href} item={item} />
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-1.5 xl:gap-2">
            {status}
            <SearchMenu items={search} />
            {quickAction}
            <NotificationsMenu
              initial={notifications}
              allHref={notificationsHref}
            />
            <LiveRefresh />
            <span
              aria-hidden="true"
              className="mx-0.5 hidden h-6 w-px bg-border sm:block xl:mx-1"
            />
            <AccountMenu user={user} settingsHref={settingsHref} />
          </div>
        </div>
      </header>

      <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:py-8 xl:px-0">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
