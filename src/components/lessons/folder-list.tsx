import { ChevronRight, Folder } from "lucide-react";
import Link from "next/link";
import type { SubfolderSummary } from "@/lib/db/lessons";
import { plural } from "@/lib/format";

/** Subfolderele unui folder, ca niște dosare pe care le deschizi. */
export function FolderList({
  folders,
  href,
}: {
  folders: SubfolderSummary[];
  href: (id: string) => string;
}) {
  if (folders.length === 0) return null;
  return (
    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {folders.map((f) => {
        const parts = [
          f.folderCount > 0
            ? plural(f.folderCount, "subfolder", "subfoldere")
            : null,
          plural(f.itemCount, "material", "materiale"),
        ].filter(Boolean);
        return (
          <li key={f.id}>
            <Link
              href={href(f.id)}
              className="group flex h-full cut-sm items-center gap-3 bg-card px-4 py-3 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70"
            >
              <span
                aria-hidden="true"
                className="grid size-10 shrink-0 cut-xs place-items-center bg-xp-soft text-xp-foreground"
              >
                <Folder className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold font-heading uppercase tracking-wide">
                  {f.title}
                </span>
                <span className="block text-muted-foreground text-sm">
                  {parts.join(" · ")}
                </span>
              </span>
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
