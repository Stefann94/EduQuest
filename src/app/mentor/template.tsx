// Vezi (student)/template.tsx: reia apariția discretă la fiecare schimbare de pagină.
export default function MentorTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="page-enter">{children}</div>;
}
