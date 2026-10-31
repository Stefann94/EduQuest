import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { SubNav, type SubNavItem } from "@/components/common/sub-nav";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getLiveSessions, getMentorQuizzes } from "@/lib/db/quizzes";

const base = (counts?: {
  open: number;
  ended: number;
  quizzes: number;
}): SubNavItem[] => [
  {
    label: "Live acum",
    href: "/mentor/quiz/live",
    exact: true,
    count: counts?.open,
  },
  {
    label: "Arhivate",
    href: "/mentor/quiz/live/arhivate",
    count: counts?.ended,
  },
  {
    label: "Toate quiz-urile live",
    href: "/mentor/quiz/live/quiz-uri",
    count: counts?.quizzes,
  },
];

export default function LiveQuizzesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <Suspense
          fallback={
            <SubNav label="Quiz-uri live" items={base()} className="flex-1" />
          }
        >
          <LiveNav />
        </Suspense>
        <Link
          href="/mentor/quiz/nou?mod=live"
          className={buttonVariants({ variant: "outline" })}
        >
          <Plus aria-hidden="true" /> Quiz live nou
        </Link>
      </div>
      {children}
    </div>
  );
}

async function LiveNav() {
  const me = await requireUser("mentor");
  const [sessions, quizzes] = await Promise.all([
    getLiveSessions(),
    getMentorQuizzes(me.id),
  ]);
  const ended = sessions.filter((s) => s.status === "ended").length;
  return (
    <SubNav
      label="Quiz-uri live"
      className="flex-1"
      items={base({
        open: sessions.length - ended,
        ended,
        quizzes: quizzes.filter((q) => q.live).length,
      })}
    />
  );
}
