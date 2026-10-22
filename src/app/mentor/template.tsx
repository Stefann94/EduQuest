// Vezi (elev)/template.tsx: reia animația de intrare la fiecare schimbare de pagină.
export default function MentorTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="page-enter">{children}</div>;
}
