import { SubNav } from "@/components/common/sub-nav";

const SECTIONS = [
  { label: "Prezentare", slug: "" },
  { label: "Membri", slug: "membri" },
  { label: "Materiale", slug: "lectii" },
  { label: "Teme", slug: "teme" },
  { label: "Quiz-uri", slug: "quiz" },
  { label: "Prezență", slug: "prezenta" },
  { label: "Clasament", slug: "clasament" },
  { label: "Setări", slug: "setari" },
] as const;

/** Navigarea între secțiunile unei clase, cu secțiunea curentă evidențiată. */
export function ClassNav({ classId }: { classId: string }) {
  const base = `/mentor/clase/${classId}`;
  return (
    <SubNav
      label="Secțiunile clasei"
      items={SECTIONS.map((s) => ({
        label: s.label,
        href: s.slug ? `${base}/${s.slug}` : base,
        exact: !s.slug,
      }))}
    />
  );
}
