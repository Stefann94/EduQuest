import type { Metadata } from "next";
import { HomeworkTabs } from "@/components/app/homework-tabs";
import { PageHeader } from "@/components/app/page-header";
import { demoHomework } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Teme" };

export default function HomeworkPage() {
  return (
    <div className="grid gap-8">
      <PageHeader
        emoji="📚"
        title="Teme"
        description="Temele primite de la mentor. Le rezolvi direct în platformă."
      />
      <HomeworkTabs homework={demoHomework} />
    </div>
  );
}
