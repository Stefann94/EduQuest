import { Trophy } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { LeaderboardManager } from "@/components/mentor-classes/leaderboard-manager";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import {
  demoIds,
  getClass,
  getLeaderboard,
  getViewer,
} from "@/lib/data/queries";

export const metadata: Metadata = { title: "Clasament" };

type Props = PageProps<"/mentor/clase/[id]/clasament">;

export function generateStaticParams() {
  return demoIds.classes();
}

export default function ClassLeaderboardPage({ params }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton rows={6} />}>
      <Leaderboard params={params} />
    </Suspense>
  );
}

const SOURCES = [
  ["Prezență la întâlnire", "+2"],
  ["Temă trimisă", "+2"],
  ["Bonus de calitate la temă", "0–5"],
  ["Quiz live, locurile 1–4", "+5, +4, +3, +2"],
  ["Quiz live, ceilalți participanți", "+1"],
  ["Ajustare făcută de mentor", "-10…+10"],
] as const;

async function Leaderboard({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const me = await getViewer("mentor");
  const c = await getClass(me, id);
  if (!c) notFound();
  const board = await getLeaderboard(c.id);

  return (
    <div className="grid gap-4">
      <div>
        <h2 className="font-semibold text-lg">Clasament</h2>
        <p className="text-muted-foreground text-sm">
          XP-ul strâns de fiecare elev în această clasă. Elevii văd clasamentul
          cu numele afișate; la XP egal, împart locul.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {board.length > 0 ? (
            <LeaderboardManager
              classId={c.id}
              canAdjust={c.status === "active"}
              initialRows={board.map((r) => ({
                id: r.student.id,
                displayName: r.student.displayName,
                username: r.student.username,
                avatar: r.student.avatar,
                xp: r.xp,
              }))}
            />
          ) : (
            <EmptyState
              icon={Trophy}
              title="Clasamentul e gol"
              description="Când elevii se înscriu și participă la activități, XP-ul lor apare aici."
            />
          )}
        </div>

        <aside className="h-fit rounded-xl border bg-card p-5 shadow-xs">
          <h3 className="font-semibold">Cum se strânge XP-ul</h3>
          <p className="mt-1 text-muted-foreground text-sm">
            XP-ul răsplătește participarea și efortul, nu este o notă.
          </p>
          <dl className="mt-4 grid gap-2.5 text-sm">
            {SOURCES.map(([label, value]) => (
              <div
                key={label}
                className="flex items-baseline justify-between gap-3"
              >
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="shrink-0 font-medium tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 border-t pt-4 text-muted-foreground text-xs">
            Fiecare acordare sau corectură se păstrează în istoricul de XP, cu
            sursa ei. XP-ul pentru aceeași activitate nu se acordă de două ori.
          </p>
        </aside>
      </div>
    </div>
  );
}
