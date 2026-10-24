import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { HomeworkForm } from "@/components/homework/homework-form";
import { FormSkeleton } from "@/components/mentor-content/skeletons";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Temă nouă" };

export default function NewHomeworkPage() {
  return (
    <div className="grid max-w-4xl gap-6">
      <PageHeader
        back={{ href: "/mentor/teme", label: "Teme" }}
        title="Temă nouă"
        description="Scrie problemele temei. În pasul următor o dai uneia sau mai multor clase, fiecare cu termenul ei."
      />
      <Suspense fallback={<FormSkeleton />}>
        <Form />
      </Suspense>
    </div>
  );
}

async function Form() {
  await requireUser("mentor");
  return (
    <HomeworkForm
      draft={{ title: "", description: "", required: true, problems: [] }}
    />
  );
}
