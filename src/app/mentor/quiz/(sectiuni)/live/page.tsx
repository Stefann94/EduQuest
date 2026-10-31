import type { Metadata } from "next";
import { Suspense } from "react";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import { LiveNow } from "@/components/mentor-content/live-now";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Live acum" };

type Props = PageProps<"/mentor/quiz/live">;

export default function LiveNowPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton rows={3} />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}

async function Content({
  searchParams,
}: {
  searchParams: Props["searchParams"];
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
