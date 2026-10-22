import { ArrowLeft, Play } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Mascot } from "@/components/brand/mascot";
import { buttonVariants } from "@/components/ui/button";
import { demoLobbyPlayers, demoQuizzes } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Sesiune live" };

const DEMO_PIN = "482193";

export default function LiveSessionLobbyPage() {
  const quiz = demoQuizzes[0];

  return (
    <div className="grid gap-6">
      <Link
        href="/mentor"
        className="flex w-fit items-center gap-1 font-bold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Înapoi la panou
      </Link>

      <section className="relative overflow-hidden rounded-[2.5rem] bg-primary p-6 text-center text-primary-foreground shadow-[0_8px_0_0_var(--primary-shadow)] sm:p-10">
        <div className="bg-dots absolute inset-0 opacity-40" />
        <div className="relative">
          <p className="font-bold text-lg opacity-90">
            Intră pe{" "}
            <span className="underline decoration-wavy">eduquest.ro/intra</span>{" "}
            și scrie PIN-ul 👇
          </p>
          <p className="anim-rise mx-auto mt-5 w-fit -rotate-2 rounded-[2rem] bg-white px-8 py-4 font-bold font-mono text-6xl text-primary tracking-[0.12em] shadow-[0_6px_0_0_var(--primary-shadow)] sm:text-8xl">
            <span className="sr-only">PIN {DEMO_PIN.split("").join(" ")}</span>
            <span aria-hidden="true">
              {DEMO_PIN.slice(0, 3)} {DEMO_PIN.slice(3)}
            </span>
          </p>
          <p className="mt-6 font-bold font-heading text-xl">
            🔁 {quiz.title} · {quiz.questions} întrebări
          </p>
        </div>
      </section>

      <section className="sticker p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Mascot className="size-14" mood="wow" />
            <h2 className="font-bold text-2xl">
              {demoLobbyPlayers.length} elevi au intrat!
            </h2>
            <span className="relative flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex size-3 rounded-full bg-success" />
            </span>
          </div>
          <Link href="/live" className={buttonVariants({ size: "lg" })}>
            <Play className="fill-current" /> Începe quiz-ul
          </Link>
        </div>
        <ul className="mt-6 flex flex-wrap gap-3">
          {demoLobbyPlayers.map((p) => (
            <li
              key={p.name}
              className="flex items-center gap-2 rounded-full border-2 bg-background py-1.5 pr-5 pl-1.5 font-bold font-heading text-lg shadow-[0_3px_0_0_var(--border)]"
            >
              <span
                aria-hidden="true"
                className="grid size-10 place-items-center rounded-full bg-secondary text-2xl"
              >
                {p.avatar}
              </span>
              {p.name}
            </li>
          ))}
          <li className="flex items-center rounded-full border-2 border-dashed px-5 py-1.5 font-bold text-muted-foreground">
            se așteaptă… ⏳
          </li>
        </ul>
      </section>
    </div>
  );
}
