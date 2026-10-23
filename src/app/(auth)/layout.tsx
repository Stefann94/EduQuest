import { BookOpenText, MessageSquareText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Logo, LogoMark } from "@/components/brand/logo";

const BENEFITS = [
  {
    icon: BookOpenText,
    title: "Materiale clare, pas cu pas",
    text: "Lecții, exemple de cod și probleme rezolvate, organizate pe clase.",
  },
  {
    icon: MessageSquareText,
    title: "Feedback de la mentor",
    text: "Comentarii personale la teme, fără note. Progresul se vede prin XP.",
  },
  {
    icon: ShieldCheck,
    title: "Confidențialitate implicită",
    text: "Profil minim, vizibil doar în clasele tale. Nu există un director public.",
  },
] as const;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:sticky lg:top-0 lg:block lg:h-dvh">
        {/* Un halou discret, fără elemente decorative în plus. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgb(255_255_255/0.12),transparent_60%)]"
        />
        <div className="relative flex h-full flex-col justify-between gap-10 overflow-y-auto p-10 xl:p-14">
          <Link
            href="/autentificare"
            className="flex w-fit items-center gap-2.5 rounded-lg font-semibold text-[17px] tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-white/50"
          >
            <LogoMark className="bg-white/15 ring-1 ring-white/25" />
            EduQuest
          </Link>

          <div className="grid max-w-md gap-10">
            <p className="text-balance font-semibold text-3xl leading-tight tracking-tight xl:text-[34px]">
              Învață programare în clase organizate de mentori, cu teme,
              quiz-uri și feedback personal.
            </p>
            <ul className="grid gap-6">
              {BENEFITS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 ring-1 ring-white/15">
                    <Icon className="size-[18px]" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-primary-foreground/75 text-sm">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-primary-foreground/60 text-xs">
            Platformă dezvoltată într-un program educațional de voluntariat.
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex h-16 items-center px-4 sm:px-6 lg:hidden">
          <Logo href="/autentificare" />
        </header>
        <main className="flex flex-1 items-start justify-center px-4 py-6 sm:items-center sm:px-6 sm:py-10">
          {children}
        </main>
        <footer className="px-6 pb-6 text-center text-muted-foreground text-xs">
          Versiune demo: conturile și emailurile sunt simulate.
        </footer>
      </div>
    </div>
  );
}
