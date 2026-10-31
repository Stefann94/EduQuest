import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { SubNav, type SubNavItem } from "@/components/common/sub-nav";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getMentorClasses } from "@/lib/db/classes";
import { getMentorQuizzes } from "@/lib/db/quizzes";

const ALL: SubNavItem = {
  label: "Toate",
  href: "/mentor/quiz/clase",
  exact: true,
};

export default function ClassQuizzesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        {/* Clasele vin din baza de date; până atunci, doar „Toate”. */}
        <Suspense
          fallback={
            <div className="min-w-0 flex-1">
              <SubNav label="Quiz-uri pe clase" items={[ALL]} />
            </div>
          }
        >
          <ClassesNav />
        </Suspense>
        <Link
          href="/mentor/quiz/nou?mod=clase"
          className={buttonVariants({ variant: "outline" })}
        >
          <Plus aria-hidden="true" /> Quiz nou
        </Link>
      </div>
      {children}
    </div>
  );
}

async function ClassesNav() {
  const me = await requireUser("mentor");
  const [classes, quizzes] = await Promise.all([
    getMentorClasses(me.id),
    getMentorQuizzes(me.id),
  ]);
  const forClasses = quizzes.filter((q) => !q.live);
  const items: SubNavItem[] = [
    { ...ALL, count: forClasses.length },
    ...classes.active.map((c) => ({
      label: c.name,
      href: `/mentor/quiz/clase/${c.id}`,
      count: forClasses.filter((q) => q.classes.some((x) => x.id === c.id))
        .length,
    })),
  ];
  return (
    <div className="min-w-0 flex-1">
      <SubNav label="Quiz-uri pe clase" items={items} />
    </div>
  );
}
