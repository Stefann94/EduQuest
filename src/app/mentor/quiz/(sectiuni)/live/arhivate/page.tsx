import type { Metadata } from "next";
import { Suspense } from "react";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import { LiveSessionList } from "@/components/mentor-content/live-session-list";
import { requireUser } from "@/lib/auth";
import { getLiveSessions } from "@/lib/db/quizzes";

export const metadata: Metadata = { title: "Sesiuni live arhivate" };

export default function ArchivedLivePage() {
  return (
    <Suspense fallback={<SectionSkeleton rows={5} />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  await requireUser("mentor");
  // Sesiunile din clasele mentorului (RLS le arată doar pe ale lui), cele mai noi primele.
  const ended = (await getLiveSessions()).filter((s) => s.status === "ended");
  return (
    <div className="grid gap-3">
      <p className="text-muted-foreground text-sm">
        Sesiunile încheiate, cu data, clasa și câți au jucat. Deschide una ca să
        vezi clasamentul final.
      </p>
      <LiveSessionList
        sessions={ended}
        showClass
        empty={{
          title: "Nicio sesiune încheiată",
          description:
            "După ce închei o sesiune live, o găsești aici, cu clasamentul final.",
        }}
      />
    </div>
  );
}
