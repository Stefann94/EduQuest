import { Archive, Users } from "lucide-react";
import type { Metadata } from "next";
import { ClassCard } from "@/components/classes/class-card";
import { JoinClassDialog } from "@/components/classes/join-class-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStudentClasses, getViewer } from "@/lib/data/queries";

export const metadata: Metadata = { title: "Clasele mele" };

export default async function MyClassesPage() {
  const me = await getViewer("student");
  const { active, archived } = await getStudentClasses(me.id);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Clasele mele"
        description="Clasele în care ești înscris. Intră într-una ca să vezi materialele, temele și clasamentul."
        actions={<JoinClassDialog />}
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
                    href={`/clase/${c.id}`}
                    viewAs="student"
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Users}
              title="Nu ești înscris în nicio clasă"
              description="Cere-i mentorului codul de invitație și alătură-te clasei."
              action={<JoinClassDialog />}
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
                    href={`/clase/${c.id}`}
                    viewAs="student"
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Archive}
              title="Nicio clasă arhivată"
              description="Clasele încheiate apar aici, ca să poți reciti materialele."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
