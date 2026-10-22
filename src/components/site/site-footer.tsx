import { Logo } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t-2 border-dashed">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 font-semibold text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <p>Făcut cu 💜 pentru micii programatori.</p>
        <p>© 2026 EduQuest</p>
      </div>
    </footer>
  );
}
