// Un template se montează din nou la fiecare navigare, deci apariția discretă
// a paginii (.page-enter din globals.css) rulează la fiecare schimbare de pagină.
export default function StudentTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="page-enter">{children}</div>;
}
