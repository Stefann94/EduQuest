import { ArrowRight, Check, Play } from "lucide-react";
import Link from "next/link";
import { Mascot } from "@/components/brand/mascot";
import { ColorPicker } from "@/components/personalize/theme-picker";
import { HeroPreview } from "@/components/site/hero-preview";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    emoji: "⚡",
    title: "Quiz-uri live",
    text: "Toată grupa răspunde în același timp. Cine e corect și rapid urcă în clasament!",
    color: "bg-fun-blue",
    soft: "bg-fun-blue/12",
  },
  {
    emoji: "🎮",
    title: "Jocuri rapide",
    text: "Ghicește output-ul, vânează bug-uri, pune codul în ordine. Câte 2–5 minute.",
    color: "bg-fun-pink",
    soft: "bg-fun-pink/12",
  },
  {
    emoji: "💻",
    title: "Teme cu cod",
    text: "Scrii și rulezi cod direct în browser, apoi îl trimiți mentorului.",
    color: "bg-fun-green",
    soft: "bg-fun-green/12",
  },
  {
    emoji: "🏅",
    title: "XP și insigne",
    text: "Strângi puncte, urci în nivel și colecționezi insigne pentru fiecare reușită.",
    color: "bg-fun-orange",
    soft: "bg-fun-orange/12",
  },
];

const steps = [
  {
    title: "Mentorul pornește jocul",
    text: "Pe ecran apare un PIN pentru toată grupa.",
    color: "bg-fun-purple",
  },
  {
    title: "Tu intri cu PIN-ul",
    text: "De pe laptop, tabletă sau telefon. Fără instalări!",
    color: "bg-fun-pink",
  },
  {
    title: "Răspunzi și câștigi XP",
    text: "Cu cât răspunzi mai repede, cu atât primești mai multe puncte.",
    color: "bg-fun-yellow",
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
          <Blob className="-top-24 -left-24 bg-fun-pink/25" />
          <Blob className="top-40 -right-32 bg-fun-yellow/30" />

          <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-14 pb-20 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
            <div>
              <span className="sticker inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-bold text-sm shadow-[0_3px_0_0_var(--border)]">
                👋 Salut, viitor programator!
              </span>
              <h1 className="mt-6 text-balance font-bold text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Programarea e mai tare când e un{" "}
                <span className="relative inline-block text-primary">
                  joc
                  <Squiggle />
                </span>
                !
              </h1>
              <p className="mt-6 max-w-xl text-pretty font-semibold text-lg text-muted-foreground sm:text-xl">
                Quiz-uri live cu toată grupa, jocuri rapide și teme cu cod
                adevărat. Strângi XP, urci în nivel și te distrezi învățând.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/intra" className={buttonVariants({ size: "lg" })}>
                  Am un PIN de joc 🎟️
                </Link>
                <Link
                  href="/live"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  <Play className="fill-current" /> Încearcă un quiz
                </Link>
              </div>
              <p className="mt-5 font-semibold text-muted-foreground">
                Ești mentor?{" "}
                <Link
                  href="/mentor"
                  className="font-bold text-primary underline decoration-2 underline-offset-4"
                >
                  Vezi panoul tău
                </Link>
              </p>
            </div>
            <HeroPreview />
          </div>
        </section>

        <section className="px-4">
          <div className="sticker relative mx-auto flex max-w-6xl flex-col items-center gap-6 p-6 sm:p-8 md:flex-row">
            <Mascot className="size-28 animate-float sm:size-32" />
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-bold text-3xl">
                Alege-ți culoarea preferată!
              </h2>
              <p className="mt-1 font-semibold text-muted-foreground">
                Apasă pe o culoare și toată platforma se colorează pentru tine.
                Bit, robotul nostru, se schimbă și el. 🤖
              </p>
            </div>
            <ColorPicker
              legend=""
              className="w-full md:w-auto"
              gridClassName="grid-cols-4 sm:grid-cols-8 md:w-[26rem]"
            />
          </div>
        </section>

        <section id="functionalitati" className="scroll-mt-28 px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <SectionTitle emoji="🎮" title="Ce poți face pe EduQuest" />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f, i) => (
                <div
                  key={f.title}
                  className={cn(
                    "sticker p-6 transition-transform hover:-translate-y-1",
                    i % 2 === 0 ? "hover:-rotate-1" : "hover:rotate-1",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-16 place-items-center rounded-3xl text-3xl",
                      f.soft,
                    )}
                  >
                    {f.emoji}
                  </span>
                  <h3 className="mt-5 font-bold text-2xl">{f.title}</h3>
                  <p className="mt-2 font-semibold text-muted-foreground leading-relaxed">
                    {f.text}
                  </p>
                  <span
                    className={cn("mt-5 block h-2 w-12 rounded-full", f.color)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="cum-functioneaza"
          className="scroll-mt-28 bg-primary-soft px-4 py-20"
        >
          <div className="mx-auto max-w-6xl">
            <SectionTitle emoji="🚀" title="Un quiz live în 3 pași" />
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.title} className="sticker relative p-6 pt-10">
                  <span
                    className={cn(
                      "absolute -top-6 left-6 grid size-14 -rotate-6 place-items-center rounded-2xl font-bold font-heading text-3xl text-white shadow-[0_4px_0_0_rgb(0_0_0/0.15)]",
                      s.color,
                    )}
                  >
                    {i + 1}
                  </span>
                  <h3 className="font-bold text-2xl">{s.title}</h3>
                  <p className="mt-2 font-semibold text-muted-foreground">
                    {s.text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="parinti" className="scroll-mt-28 px-4 py-20">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center">
            <div>
              <SectionTitle emoji="💛" title="Pentru părinți: în siguranță" />
              <p className="mt-4 font-semibold text-lg text-muted-foreground">
                Colectăm doar datele strict necesare. Părinții pot avea
                încredere, iar mentorii păstrează controlul.
              </p>
            </div>
            <ul className="grid gap-3">
              {safety.map((item) => (
                <li
                  key={item}
                  className="sticker flex items-start gap-3 rounded-2xl p-4 font-semibold"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-success text-white">
                    <Check className="size-4" strokeWidth={3} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-4">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-primary px-8 py-14 text-center text-primary-foreground shadow-[0_8px_0_0_var(--primary-shadow)]">
            <div className="bg-dots absolute inset-0 opacity-40" />
            <div className="relative mx-auto grid size-28 animate-float place-items-center rounded-full bg-white shadow-[0_5px_0_0_var(--primary-shadow)]">
              <Mascot mood="wow" className="size-20" />
            </div>
            <h2 className="relative mt-4 text-balance font-bold text-4xl sm:text-5xl">
              Gata de primul quiz?
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg font-semibold text-lg opacity-90">
              Scrie PIN-ul primit de la mentor și intră în joc!
            </p>
            <Link
              href="/intra"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "relative mt-8",
              )}
            >
              Intră în joc <ArrowRight />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function SectionTitle({ emoji, title }: { emoji: string; title: string }) {
  return (
    <h2 className="flex items-center gap-3 text-balance font-bold text-4xl tracking-tight">
      <span
        aria-hidden="true"
        className="sticker grid size-14 shrink-0 -rotate-6 place-items-center rounded-2xl text-3xl"
      >
        {emoji}
      </span>
      {title}
    </h2>
  );
}

function Blob({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("absolute -z-10 size-80 rounded-full blur-3xl", className)}
    />
  );
}

function Squiggle() {
  return (
    <svg
      viewBox="0 0 120 16"
      aria-hidden="true"
      preserveAspectRatio="none"
      className="absolute -bottom-2 left-0 h-4 w-full"
    >
      <path
        d="M2 10c12-8 22-8 34 0s22 8 34 0 22-8 34 0 10 6 14 4"
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        className="stroke-fun-yellow"
      />
    </svg>
  );
}
