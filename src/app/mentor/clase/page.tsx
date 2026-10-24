import { Archive, Users } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ClassCard } from "@/components/classes/class-card";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { CreateClassDialog } from "@/components/mentor-classes/create-class-dialog";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireUser } from "@/lib/auth";
import { getMentorClasses } from "@/lib/db/classes";

export const metadata: Metadata = { title: "Clasele mele" };

export default function MentorClassesPage() {
  return (
    <Suspense
      fallback={
        <div className="grid gap-6">
          <PageHeader
            title="Clasele mele"
            description="Clasele pe care le predai. Deschide o clasă ca să gestionezi elevii, prezența, temele și clasamentul."
          />
          <SectionSkeleton rows={3} />
        </div>
      }
    >
      <Content />
    </Suspense>
  );
}

async function Content() {
  const me = await requireUser("mentor");
  const { active, archived } = await getMentorClasses(me.id);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Clasele mele"
        description="Clasele pe care le predai. Deschide o clasă ca să gestionezi elevii, prezența, temele și clasamentul."
        actions={<CreateClassDialog />}
      />

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="archived">
            Arhivate ({archived.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {active.length > 0 ? (
            <ul className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {active.map((c) => (
                <li key={c.id}>
                  <ClassCard
                    classRoom={c}
                    href={`/mentor/clase/${c.id}`}
                    viewAs="mentor"
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Users}
              title="Nu ai nicio clasă activă"
              description="Creează o clasă și trimite-le elevilor codul de invitație."
              action={<CreateClassDialog />}
            />
          )}
        </TabsContent>

        <TabsContent value="archived" className="mt-4">
          {archived.length > 0 ? (
            <ul className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {archived.map((c) => (
                <li key={c.id}>
                  <ClassCard
                    classRoom={c}
                    href={`/mentor/clase/${c.id}`}
                    viewAs="mentor"
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Archive}
              title="Nicio clasă arhivată"
              description="Când arhivezi o clasă încheiată, o găsești aici. Elevii păstrează accesul la materiale."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
