import type { Metadata } from "next";
import { Suspense } from "react";
import { ClassSettings } from "@/components/mentor-classes/class-settings";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import { placeholderParams } from "@/lib/db/core";
import { loadMentorClass } from "../load-class";

export const metadata: Metadata = { title: "Setările clasei" };

type Props = PageProps<"/mentor/clase/[id]/setari">;

export function generateStaticParams() {
  return placeholderParams("id");
}

export default function ClassSettingsPage({ params }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton rows={3} />}>
      <Settings params={params} />
    </Suspense>
  );
}

async function Settings({ params }: { params: Props["params"] }) {
  const { classRoom: c } = await loadMentorClass(params);

  return (
    <div className="grid gap-4">
      <div>
        <h2 className="font-semibold text-lg">Setări</h2>
        <p className="text-muted-foreground text-sm">
          Detaliile clasei, codul de invitație și arhivarea.
        </p>
      </div>
      <ClassSettings
        classId={c.id}
        name={c.name}
        description={c.description}
        schedule={c.schedule}
        inviteCode={c.inviteCode}
        inviteCodeActive={c.inviteCodeActive}
        archived={c.status === "archived"}
      />
    </div>
  );
}
