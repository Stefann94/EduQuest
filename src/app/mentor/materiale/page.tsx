import { Lightbulb, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { ContentManager } from "@/components/mentor-content/content-manager";
import { buttonVariants } from "@/components/ui/button";
import {
  getMentorClasses,
  getMentorContent,
  getViewer,
} from "@/lib/data/queries";

export const metadata: Metadata = { title: "Materiale" };

export default async function MentorMaterialsPage() {
  const me = await getViewer("mentor");
  const [content, classes] = await Promise.all([
    getMentorContent(me.id),
    getMentorClasses(me.id),
  ]);
  const byDate = <T extends { publishedAt: string }>(a: T, b: T) =>
    b.publishedAt.localeCompare(a.publishedAt);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Materiale"
        description="Lecțiile, fișele și problemele rezolvate pe care le pregătești pentru clasele tale sau ca resurse globale, disponibile tuturor elevilor."
        actions={
          <>
            <Link
              href="/mentor/materiale/probleme/nou"
              className={buttonVariants({ variant: "outline" })}
            >
              <Lightbulb aria-hidden="true" /> Problemă rezolvată nouă
            </Link>
            <Link href="/mentor/materiale/nou" className={buttonVariants()}>
              <Plus aria-hidden="true" /> Material nou
            </Link>
          </>
        }
      />
      <ContentManager
        materials={[...content.materials].sort(byDate)}
        problems={[...content.problems].sort(byDate)}
        classes={[...classes.active, ...classes.archived].map((c) => ({
          id: c.id,
          name: c.name,
        }))}
      />
    </div>
  );
}
