import { ChevronRight, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { SectionTitle } from "@/components/app/section-title";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  demoGroups,
  demoMentor,
  demoQuizzes,
  demoToGrade,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Panou mentor" };

export default function MentorHomePage() {
  const totalStudents = demoGroups.reduce((sum, g) => sum + g.students, 0);

  const stats = [
    {
      label: "Elevi activi",
      value: totalStudents,
      emoji: "👦",
    },
    {
      label: "Grupe",
      value: demoGroups.length,
      emoji: "🗓️",
    },
    {
      label: "Quiz-uri create",
      value: demoQuizzes.length,
      emoji: "📝",
    },
    {
      label: "Teme de corectat",
      value: demoToGrade.length,
      emoji: "📬",
    },
  ];

  return (
    <div className="grid gap-8">
      <PageHeader
        emoji="📊"
        title="Panoul mentorului"
        description={`Bună, ${demoMentor.name}! Iată ce se întâmplă în grupele tale.`}
        action={
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled
              className={buttonVariants({ variant: "outline" })}
            >
              <Plus /> Temă nouă
            </button>
            <Link href="/mentor/sesiune" className={buttonVariants()}>
              ⚡ Pornește quiz live
            </Link>
          </div>
        }
      />

      <div className="stagger-rise grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="sticker p-5">
            <span
              aria-hidden="true"
              className="grid size-12 place-items-center rounded-2xl bg-secondary text-2xl"
            >
              {s.emoji}
            </span>
            <p className="mt-3 font-bold font-heading text-4xl tabular-nums">
              {s.value}
            </p>
            <p className="font-bold text-muted-foreground text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="groups grid gap-6 lg:grid-cols-5">
        <section className="sticker p-5 sm:p-6 lg:col-span-3">
          <SectionTitle
            emoji="👥"
            title="Grupele mele"
            hint="Progresul prin curriculum"
          />
          <ul className="stagger-slide mt-5 grid gap-3">
            {demoGroups.map((g) => (
              <li key={g.id} className="rounded-2xl border-2 bg-background p-4">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-11 place-items-center rounded-2xl bg-secondary text-2xl"
                  >
                    {g.emoji}
                  </span>
                  <div className="flex-1">
                    <p className="font-bold font-heading text-lg">{g.name}</p>
                    <p className="font-semibold text-muted-foreground text-xs">
                      {g.schedule} · {g.students} elevi
                    </p>
                  </div>
                  <span className="font-bold font-heading text-xl tabular-nums">
                    {g.progress}%
                  </span>
                </div>
                <Progress
                  value={g.progress}
                  aria-label={`Progres ${g.name}`}
                  className="mt-3"
                />
              </li>
            ))}
          </ul>
        </section>

        <section className="sticker p-5 sm:p-6 lg:col-span-2">
          <SectionTitle
            emoji="📬"
            title="De corectat"
            hint="Teme trimise recent"
          />
          <ul className="stagger-slide mt-5 grid gap-2">
            {demoToGrade.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-2xl px-2 py-2 hover:bg-secondary"
              >
                <span
                  aria-hidden="true"
                  className="grid size-11 shrink-0 place-items-center rounded-2xl bg-secondary text-2xl"
                >
                  {t.avatar}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{t.student}</p>
                  <p className="truncate font-semibold text-muted-foreground text-xs">
                    {t.homework} · {t.submitted}
                  </p>
                </div>
                <ChevronRight className="size-5 text-muted-foreground" />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="sticker p-5 sm:p-6">
        <SectionTitle
          emoji="📝"
          title="Banca de quiz-uri"
          hint="Alege un quiz și pornește-l live"
          action={
            <button
              type="button"
              disabled
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Plus /> Quiz nou
            </button>
          }
        />
        <ul className="stagger-rise mt-5 grid gap-4 md:grid-cols-3">
          {demoQuizzes.map((q, i) => (
            <li
              key={q.id}
              className="flex flex-col gap-4 rounded-2xl border-2 bg-background p-4"
            >
              <div>
                <p className="font-bold font-heading text-lg">
                  {["🔁", "📦", "🧪"][i]} {q.title}
                </p>
                <p className="font-semibold text-muted-foreground text-xs">
                  {q.questions} întrebări · jucat de {q.plays} ori
                </p>
              </div>
              <Link
                href="/mentor/sesiune"
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "mt-auto",
                )}
              >
                ⚡ Pornește live
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
