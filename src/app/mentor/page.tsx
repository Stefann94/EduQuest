import {
  BookOpenCheck,
  CalendarClock,
  ChevronRight,
  ListChecks,
  Plus,
  Radio,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    { label: "Elevi activi", value: totalStudents, icon: Users },
    { label: "Grupe", value: demoGroups.length, icon: CalendarClock },
    { label: "Quiz-uri create", value: demoQuizzes.length, icon: ListChecks },
    {
      label: "Teme de corectat",
      value: demoToGrade.length,
      icon: BookOpenCheck,
    },
  ];

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-muted-foreground">Bună, {demoMentor.name}!</p>
          <h1 className="mt-1 font-bold text-3xl tracking-tight">
            Panoul mentorului
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 gap-2 px-4",
            )}
          >
            <Plus /> Temă nouă
          </button>
          <Link
            href="/mentor/sesiune"
            className={cn(buttonVariants({ size: "lg" }), "h-11 gap-2 px-4")}
          >
            <Radio /> Pornește quiz live
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-5">
            <s.icon className="size-5 text-primary" />
            <p className="mt-3 font-bold text-3xl tabular-nums">{s.value}</p>
            <p className="text-muted-foreground text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Grupele mele</CardTitle>
            <CardDescription>Progresul prin curriculum</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3">
              {demoGroups.map((g) => (
                <li key={g.id} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{g.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {g.schedule} · {g.students} elevi
                      </p>
                    </div>
                    <span className="font-semibold text-sm tabular-nums">
                      {g.progress}%
                    </span>
                  </div>
                  <Progress
                    value={g.progress}
                    aria-label={`Progres ${g.name}`}
                    className="mt-3 [&_[data-slot=progress-track]]:h-2"
                  />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">De corectat</CardTitle>
            <CardDescription>Teme predate recent</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2">
              {demoToGrade.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary font-semibold text-secondary-foreground text-xs">
                    {t.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sm">{t.student}</p>
                    <p className="truncate text-muted-foreground text-xs">
                      {t.homework} · {t.submitted}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Banca de quiz-uri</CardTitle>
          <CardDescription>Alege un quiz și pornește-l live</CardDescription>
          <CardAction>
            <button
              type="button"
              disabled
              className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}
            >
              <Plus /> Quiz nou
            </button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 md:grid-cols-3">
            {demoQuizzes.map((q) => (
              <li
                key={q.id}
                className="flex flex-col gap-4 rounded-xl border p-4"
              >
                <div>
                  <p className="font-medium">{q.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {q.questions} întrebări · jucat de {q.plays} ori
                  </p>
                </div>
                <Link
                  href="/mentor/sesiune"
                  className={cn(
                    buttonVariants({ variant: "secondary" }),
                    "mt-auto gap-1.5",
                  )}
                >
                  <Radio /> Pornește live
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
