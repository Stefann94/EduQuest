import { Logo } from "@/components/brand/logo";
import type { NavGroup } from "./nav";
import { NavLink } from "./nav-link";

/** Conținutul meniului lateral: același pe desktop și în sertarul de pe telefon. */
export function SidebarNav({
  groups,
  home,
  onNavigate,
}: {
  groups: NavGroup[];
  home: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Logo href={home} />
      </div>
      <nav
        className="flex-1 space-y-6 overflow-y-auto px-3 py-2"
        aria-label="Navigare principală"
      >
        {groups.map((group, i) => (
          <div key={group.label ?? i}>
            {group.label ? (
              <p className="mb-1.5 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                {group.label}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <NavLink item={item} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
