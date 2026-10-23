import { Logo } from "@/components/brand/logo";
import type { Notification } from "@/lib/data/types";
import { AccountMenu } from "./account-menu";
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
  children: React.ReactNode;
}) {
  const primary = nav[0]?.items ?? [];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-[45] border-b bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4 sm:px-6 xl:px-0">
          <div className="lg:hidden">
            <MobileNav groups={nav} home={home} />
          </div>
          <Logo
            href={home}
            className="mr-2 [&>span:last-child]:hidden sm:[&>span:last-child]:inline"
          />

          <nav
            aria-label="Navigare principală"
            className="hidden h-16 items-stretch lg:flex"
          >
            {primary.map((item) => (
              <TopNavLink key={item.href} item={item} />
            ))}
          </nav>

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
        </div>
      </header>

      <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:py-8 xl:px-0">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
