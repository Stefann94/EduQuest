import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { PersonalizeButton } from "@/components/personalize/personalize-button";
import { buttonVariants } from "@/components/ui/button";
import type { Notification } from "@/lib/demo-data";
import { MobileNav } from "./mobile-nav";
import { NotificationsMenu } from "./notifications-menu";
import { PinMenu } from "./pin-menu";
import { type SearchItem, SearchMenu } from "./search-menu";
import type { NavItem, ShellUser } from "./sidebar";

export type StatusChip = { emoji: string; label: string; href: string };

export type TopBarConfig = {
  search: SearchItem[];
  searchPlaceholder: string;
  notifications: Notification[];
  /** Acțiunea rapidă: elevul intră cu PIN, mentorul pornește o sesiune. */
  quick: "pin" | "live";
  status: StatusChip[];
};

export function TopBar({
  nav,
  user,
  config,
}: {
  nav: NavItem[];
  user: ShellUser;
  config: TopBarConfig;
}) {
  return (
    <header className="sticky top-0 z-[45] border-b-2 bg-background px-3 py-3 md:top-4 md:w-fit md:max-w-full md:self-end md:rounded-[2rem] md:border-2 md:bg-card md:p-3.5 md:shadow-[0_6px_0_0_var(--border)]">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        <div className="anim-drop md:hidden">
          <MobileNav nav={nav} user={user} />
        </div>
        <Logo
          href={nav[0]?.href ?? "/"}
          className="anim-drop md:hidden [&>span]:hidden sm:[&>span]:inline [--c:1]"
        />

        <div className="stagger-drop hidden min-w-0 items-center gap-2 overflow-hidden lg:flex">
          {config.status.map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              className="flex min-w-0 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-secondary px-4 py-3 font-bold font-heading text-lg text-secondary-foreground transition-transform hover:-translate-y-0.5"
            >
              <span aria-hidden="true">{chip.emoji}</span>
              <span className="truncate">{chip.label}</span>
            </Link>
          ))}
        </div>
        <span
          aria-hidden="true"
          className="hidden h-9 w-0.5 rounded-full bg-border lg:block"
        />

        <div className="stagger-drop ml-auto flex items-center gap-2 sm:gap-3 md:ml-0">
          <SearchMenu
            items={config.search}
            placeholder={config.searchPlaceholder}
          />
          {config.quick === "pin" ? (
            <PinMenu />
          ) : (
            <Link
              href="/mentor/sesiune"
              className={buttonVariants({ className: "h-12 px-3 sm:px-5" })}
            >
              <span aria-hidden="true">⚡</span>
              <span className="hidden sm:inline">Quiz live</span>
            </Link>
          )}
          <NotificationsMenu initial={config.notifications} />
          <PersonalizeButton name={user.firstName} hint={user.role} />
        </div>
      </div>
    </header>
  );
}
