import type { Metadata } from "next";
import { Suspense } from "react";
import { HomeworkForm } from "@/components/homework/homework-form";
import { localInputValue } from "@/components/mentor-classes/dates";
import { FormSkeleton } from "@/components/mentor-content/skeletons";
import { placeholderParams } from "@/lib/db/core";
import { loadMentorClass } from "../../load-class";

type Props = PageProps<"/mentor/clase/[id]/teme/nou">;

export const metadata: Metadata = { title: "Temă nouă" };

const WEEK = 7 * 24 * 60 * 60 * 1000;

export function generateStaticParams() {
  return placeholderParams("id");
}

export default function ClassNewHomeworkPage({ params }: Props) {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <Form params={params} />
    </Suspense>
  );
}

async function Form({ params }: { params: Props["params"] }) {
  const { classRoom: c } = await loadMentorClass(params);
  // Termenul propus: peste o săptămână, la 22:00 (ora României).
  const nextWeek = localInputValue(
    new Date(Date.now() + WEEK).toISOString(),
  ).slice(0, 10);
  return (
    <div className="grid max-w-4xl gap-4">
      <div>
        <h2 className="text-2xl">Temă nouă pentru {c.name}</h2>
        <p className="text-muted-foreground text-sm">
          Tema se dă direct acestei clase. Din secțiunea Teme o poți da apoi și
          altor clase, fiecare cu termenul ei.
        </p>
      </div>
      <HomeworkForm
        draft={{ title: "", description: "", required: true, problems: [] }}
        forClass={{
          classId: c.id,
          className: c.name,
          defaultDeadline: `${nextWeek}T22:00`,
        }}
      />
    </div>
  );
}
