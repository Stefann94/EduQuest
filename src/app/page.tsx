import {
  ArrowRight,
  BookOpenCheck,
  Gamepad2,
  KeyRound,
  LineChart,
  Radio,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRoundCheck,
} from "lucide-react";
import Link from "next/link";
import { HeroPreview } from "@/components/site/hero-preview";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Radio,
    title: "Quiz-uri live",
    text: "Pornești o sesiune, elevii intră cu un PIN și răspund în același timp. Clasamentul se actualizează după fiecare întrebare.",
    tint: "bg-quiz-blue/12 text-quiz-blue",
  },
  {
    icon: Gamepad2,
    title: "Jocuri rapide",
    text: "Provocări de 2–5 minute: ghicește output-ul, vânează bug-uri, pune codul în ordine.",
    tint: "bg-quiz-red/12 text-quiz-red",
  },
  {
    icon: BookOpenCheck,
    title: "Teme cu cod",
    text: "Elevii scriu și rulează cod direct în browser, apoi predau tema. Tu o corectezi și lași feedback.",
    tint: "bg-quiz-green/12 text-quiz-green",
  },
  {
    icon: LineChart,
    title: "Progres și insigne",
    text: "XP, niveluri, zile la rând și insigne. Tu vezi pe loc cine are nevoie de ajutor.",
    tint: "bg-quiz-yellow/15 text-quiz-yellow",
  },
];

const steps = [
  {
    icon: Sparkles,
    title: "Mentorul pornește sesiunea",
    text: "Alegi un quiz din bancă și primești un PIN pentru grupă.",
  },
  {
    icon: KeyRound,
    title: "Elevii intră cu PIN-ul",
    text: "De pe laptop, tabletă sau telefon. Fără instalări.",
  },
  {
    icon: Trophy,
    title: "Răspund și câștigă XP",
    text: "Răspunsurile corecte și rapide aduc mai multe puncte.",
  },
];

const safety = [
  "Copiii nu au nevoie de email: contul lor e creat de mentor.",
  "Invitații intră doar cu PIN și un nickname.",
  "Fiecare elev vede doar temele și scorurile lui.",
  "Codul scris de elevi rulează doar în browserul lor.",
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="bg-dots absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-16 pb-24 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-muted-foreground text-sm">
                <span className="size-2 rounded-full bg-success" />
                Pentru mentori și elevi de 8–16 ani
              </span>
              <h1 className="mt-6 text-balance font-bold text-4xl leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                Programare care se simte ca un{" "}
                <span className="text-primary">joc</span>.
              </h1>
              <p className="mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
                Quiz-uri live pentru toată grupa, jocuri rapide și teme cu cod,
                toate într-un singur loc. Tu predai, EduQuest ține scorul.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/intra"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 gap-2 px-6 text-base",
                  )}
                >
                  <KeyRound /> Am un PIN de joc
                </Link>
                <Link
                  href="/live"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-12 gap-2 px-6 text-base",
                  )}
                >
                  Încearcă un quiz demo <ArrowRight />
                </Link>
              </div>
              <p className="mt-4 text-muted-foreground text-sm">
                Ești mentor?{" "}
                <Link
                  href="/mentor"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Vezi panoul mentorului
                </Link>
              </p>
            </div>
            <HeroPreview />
          </div>
        </section>

        <section id="functionalitati" className="scroll-mt-20 border-t bg-card">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <h2 className="max-w-2xl text-balance font-bold text-3xl tracking-tight">
              Tot ce ai nevoie pentru o oră de programare reușită
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border bg-background p-6 transition-transform hover:-translate-y-0.5"
                >
                  <span
                    className={cn(
                      "grid size-11 place-items-center rounded-xl",
                      f.tint,
                    )}
                  >
                    <f.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-semibold text-lg">{f.title}</h3>
                  <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                    {f.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="cum-functioneaza" className="scroll-mt-20 border-t">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <h2 className="font-bold text-3xl tracking-tight">
              Un quiz live în 3 pași
            </h2>
            <ol className="mt-10 grid gap-5 md:grid-cols-3">
              {steps.map((s, i) => (
                <li
                  key={s.title}
                  className="relative rounded-2xl border bg-card p-6"
                >
                  <span className="absolute top-6 right-6 font-bold font-mono text-4xl text-muted-foreground/25">
                    0{i + 1}
                  </span>
                  <s.icon className="size-6 text-primary" />
                  <h3 className="mt-4 font-semibold text-lg">{s.title}</h3>
                  <p className="mt-2 text-muted-foreground text-sm">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="siguranta" className="scroll-mt-20 border-t bg-card">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:items-center">
            <div>
              <span className="grid size-12 place-items-center rounded-xl bg-success/12 text-success">
                <ShieldCheck className="size-6" />
              </span>
              <h2 className="mt-5 font-bold text-3xl tracking-tight">
                Gândit pentru copii, de la prima linie de cod
              </h2>
              <p className="mt-4 text-muted-foreground">
                Colectăm doar datele strict necesare. Părinții pot avea
                încredere, iar mentorii păstrează controlul.
              </p>
            </div>
            <ul className="grid gap-3">
              {safety.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-xl border bg-background p-4"
                >
                  <UserRoundCheck className="mt-0.5 size-5 shrink-0 text-success" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-14 text-center text-primary-foreground">
              <div className="bg-dots absolute inset-0 opacity-30" />
              <h2 className="relative text-balance font-bold text-3xl tracking-tight sm:text-4xl">
                Gata de primul quiz?
              </h2>
              <p className="relative mx-auto mt-3 max-w-lg opacity-90">
                Introdu PIN-ul primit de la mentor și intră în joc.
              </p>
              <Link
                href="/intra"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "relative mt-8 h-12 px-8 text-base",
                )}
              >
                Intră cu PIN
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
