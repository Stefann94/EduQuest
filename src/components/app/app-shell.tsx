import { type NavItem, type ShellUser, SidebarContent } from "./sidebar";
import { TopBar, type TopBarConfig } from "./top-bar";

export type { NavItem } from "./sidebar";
export type { TopBarConfig } from "./top-bar";

export function AppShell({
  nav,
  user,
  topBar,
  children,
}: {
  nav: NavItem[];
  user: ShellUser;
  topBar: TopBarConfig;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh md:gap-6 md:p-4">
      <aside className="hidden overflow-hidden rounded-[2rem] bg-primary text-primary-foreground shadow-[0_6px_0_0_var(--primary-shadow)] md:sticky md:top-4 md:block md:h-[calc(100dvh-2rem)] md:w-72 md:shrink-0">
        <SidebarContent nav={nav} user={user} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:gap-6">
        <TopBar nav={nav} user={user} config={topBar} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-2 md:py-0 md:pb-4">
          {children}
        </main>
      </div>
    </div>
  );
}
