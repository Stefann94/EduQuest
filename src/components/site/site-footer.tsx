import { Logo } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <p>Programare pentru copii, prin joc și curiozitate.</p>
        <p>© 2026 EduQuest</p>
      </div>
    </footer>
  );
}
