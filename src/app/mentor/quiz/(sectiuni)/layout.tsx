import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { QuizSectionSwitch } from "@/components/mentor-content/quiz-section-switch";

// Secțiunea Quiz-uri: Live (sesiuni cu cod) și Pentru clase (rezolvate oricând).
// Editorul (/mentor/quiz/[id]) și quiz-ul nou stau în afara acestui layout.
export default function QuizSectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Quiz-uri"
        description="Live, jucate împreună în timpul orei, sau pentru clase, rezolvate oricând."
      />
      {/* Linkul activ depinde de adresă; sub /clase/[id] adresa se știe abia la cerere. */}
      <Suspense fallback={<div className="h-16" aria-hidden="true" />}>
        <QuizSectionSwitch />
      </Suspense>
      {children}
    </div>
  );
}
