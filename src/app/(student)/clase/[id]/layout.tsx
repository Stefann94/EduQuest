import { Suspense } from "react";
import { ClassHeader } from "@/components/student-class/class-header";
import { ClassHeaderSkeleton } from "@/components/student-class/skeletons";
import { placeholderParams } from "@/lib/db/core";
import { loadStudentClass } from "./load-class";

type Props = LayoutProps<"/clase/[id]">;

export function generateStaticParams() {
  return placeholderParams("id");
}

export default function StudentClassLayout({ children, params }: Props) {
  return (
    <div className="grid gap-6">
      <Suspense fallback={<ClassHeaderSkeleton />}>
        <Header params={params} />
      </Suspense>
      {children}
    </div>
  );
}

async function Header({ params }: { params: Props["params"] }) {
  const { classRoom } = await loadStudentClass(params);
  return <ClassHeader classRoom={classRoom} />;
}
