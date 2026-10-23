import {
  ArrowRight,
  CalendarCheck,
  Medal,
  Radio,
  Send,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { Section } from "@/components/common/section";
import { UserAvatar } from "@/components/common/user-avatar";
import { SectionSkeleton } from "@/components/student-class/skeletons";
import { buttonVariants } from "@/components/ui/button";
import { getLeaderboard } from "@/lib/data/queries";
import { cn } from "@/lib/utils";
import { loadStudentClass } from "../load-class";

type Props = PageProps<"/clase/[id]/clasament">;

export const metadata: Metadata = { title: "Clasamentul clasei" };

export default function ClassLeaderboardPage({ params }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton rows={6} />}>
      <Content params={params} />
    </Suspense>
  );
}

const XP_WAYS = [
  { icon: CalendarCheck, text: "Participi la întâlnirile clasei" },
  { icon: Send, text: "Trimiți temele" },
  { icon: Sparkles, text: "Primești bonus pentru o temă lucrată atent" },
  { icon: Radio, text: "Participi la quiz-urile live" },
];

async function Content({ params }: { params: Props["params"] }) {
  const { viewer, classRoom: c } = await loadStudentClass(params);
  const board = await getLeaderboard(c.id);
  const me = board.find((r) => r.student.id === viewer.id);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Section
        title="Clasament"
        description="XP-ul adunat în această clasă"
        className="lg:col-span-2"
        bodyClassName="p-2"
      >
        {board.length > 0 ? (
          <ol className="stagger grid gap-1">
            {board.map((r) => {
              const mine = r.student.id === viewer.id;
              const top = r.rank <= 3;
              return (
                <li
                  key={r.student.id}
                  aria-current={mine ? "true" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5",
                    mine && "bg-primary-soft ring-1 ring-primary/25",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-full font-semibold text-sm tabular-nums",
                      top
                        ? "bg-xp-soft text-xp-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <span className="sr-only">Locul </span>
                    {r.rank}
                  </span>
                  <UserAvatar
                    name={r.student.displayName}
                    avatar={r.student.avatar}
                  />
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <span className={cn("truncate", mine && "font-semibold")}>
                      {r.student.displayName}
                    </span>
                    {mine ? (
                      <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 font-semibold text-[11px] text-primary-foreground">
                        Tu
                      </span>
                    ) : null}
                    {top ? (
                      <Medal
                        className="size-4 shrink-0 text-xp"
                        aria-hidden="true"
                      />
                    ) : null}
                  </span>
                  <span className="shrink-0 font-medium text-sm tabular-nums">
                    {r.xp} XP
                  </span>
                </li>
              );
            })}
          </ol>
        ) : (
          <EmptyState
            icon={Users}
            title="Clasamentul este gol"
            description="Clasamentul apare după primele activități din clasă."
            className="border-0"
          />
        )}
      </Section>

      <div className="grid content-start gap-6">
        {me ? (
          <section className="rounded-xl border bg-card p-5 shadow-xs">
            <h2 className="font-semibold">Poziția ta</h2>
            <p className="mt-3 flex items-baseline gap-2">
              <Star
                className="size-6 self-center fill-xp text-xp"
                aria-hidden="true"
              />
              <span className="font-semibold text-4xl tabular-nums tracking-tight">
                {me.xp}
              </span>
              <span className="text-muted-foreground">XP</span>
            </p>
            <p className="mt-2 text-muted-foreground text-sm">
              Locul{" "}
              <span className="font-medium text-foreground">{me.rank}</span> din{" "}
              {board.length}. Fiecare activitate te aduce mai aproape de
              următorul pas.
            </p>
          </section>
        ) : null}

        <Section title="Cum câștigi XP">
          <ul className="grid gap-3 text-sm">
            {XP_WAYS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground"
                >
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-muted-foreground text-sm">
            XP-ul răsplătește implicarea și progresul, nu doar viteza. Contează
            fiecare pas.
          </p>
          <Link
            href="/progres"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "mt-4 w-full",
            )}
          >
            Vezi progresul tău <ArrowRight />
          </Link>
        </Section>
      </div>
    </div>
  );
}
