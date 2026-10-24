import { BookOpenText, MessageSquareText, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";

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
      <aside className="relative hidden overflow-hidden bg-[linear-gradient(140deg,var(--primary),#8a3a22_75%)] text-primary-foreground lg:sticky lg:top-0 lg:block lg:h-dvh">
        {/* Dungi oblice în colț, ca pe cardul arenei. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-6 -right-6 size-64 bg-[repeating-linear-gradient(-45deg,rgb(255_255_255/0.07)_0_10px,transparent_10px_20px)]"
        />
        <div className="relative flex h-full flex-col justify-between gap-10 overflow-y-auto p-10 xl:p-14">
          <Logo href="/autentificare" className="w-fit" />

          <div className="grid max-w-md gap-10">
            <p className="text-balance font-bold font-heading text-4xl leading-[1.05] xl:text-[2.75rem]">
              Învață programare în clase organizate de mentori, cu teme,
              quiz-uri și feedback personal.
            </p>
            <ul className="grid gap-6">
              {BENEFITS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3.5">
                  <span className="hex grid size-10 shrink-0 place-items-center bg-black/15">
                    <Icon className="size-[18px]" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-bold font-heading text-lg uppercase tracking-wide">
                      {title}
                    </p>
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
