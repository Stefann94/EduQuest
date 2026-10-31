import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import { LiveNow } from "@/components/mentor-content/live-now";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Quiz live" };

/** Scurtătura din bara de sus: deschide o sesiune live (`?clasa=<id>` alege clasa). */
export default function MentorLivePage({
  searchParams,
}: PageProps<"/mentor/live">) {
  return (
    <div className="grid gap-6">
      <PageHeader
        back={{ href: "/mentor/quiz/live", label: "Quiz-uri live" }}
        title="Quiz live"
        description="Jucat împreună, în timpul orei. Tu controlezi întrebările; elevii răspund de pe dispozitivele lor."
      />
      <Suspense fallback={<SectionSkeleton rows={4} />}>
        <Content searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Content({
  searchParams,
}: {
  searchParams: PageProps<"/mentor/live">["searchParams"];
}) {
  const { clasa } = await searchParams;
  const me = await requireUser("mentor");
  return (
    <LiveNow
      mentorId={me.id}
      defaultClassId={typeof clasa === "string" ? clasa : undefined}
    />
  );
}
