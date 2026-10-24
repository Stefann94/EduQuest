import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { LiveControl } from "@/components/mentor-content/live-control";
import { DetailSkeleton } from "@/components/mentor-content/skeletons";
import { requireUser } from "@/lib/auth";
import { mentorClassIds } from "@/lib/db/classes";
import { placeholderParams } from "@/lib/db/core";
import { getLiveSession } from "@/lib/db/quizzes";

export const metadata: Metadata = { title: "Quiz live" };

type Props = PageProps<"/mentor/live/[id]">;

export function generateStaticParams() {
  return placeholderParams("id");
}

export default function LiveSessionPage({ params }: Props) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const me = await requireUser("mentor");
  const [session, mine] = await Promise.all([
    getLiveSession(id),
    mentorClassIds(me.id),
  ]);
  if (!session || !mine.includes(session.classId)) notFound();

  return (
    <div className="grid gap-6">
      <PageHeader
        back={{ href: "/mentor/live", label: "Sesiuni live" }}
        title="Panoul quiz-ului live"
        description={`Quiz: ${session.quizTitle}. Proiectează pagina în clasă; elevii răspund de pe dispozitivele lor.`}
      />
      <LiveControl sessionId={session.id} className={session.className} />
    </div>
  );
}
