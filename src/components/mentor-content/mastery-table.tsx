import { cn } from "@/lib/utils";

type Cell = { correct: number; total: number };

// Pragurile culorilor, ca mentorul să vadă dintr-o privire unde trebuie reluată o lecție.
function tone(pct: number) {
  if (pct >= 80) return "bg-success-soft text-success";
  if (pct >= 50) return "bg-xp-soft text-xp-foreground";
  return "bg-danger-soft text-destructive";
}

/**
 * Elevi × lecții: cât la sută din întrebările fiecărei lecții a răspuns corect fiecare
 * elev (din ultima încercare la fiecare quiz dat clasei). Textul are și procentul, nu
 * doar culoarea.
 */
export function MasteryTable({
  lessons,
  students,
}: {
  lessons: { id: string; title: string }[];
  students: { id: string; name: string; cells: Map<string, Cell> }[];
}) {
  const lessonAvg = lessons.map((l) => {
    const cells = students.flatMap((s) => {
      const c = s.cells.get(l.id);
      return c ? [c] : [];
    });
    const correct = cells.reduce((s, c) => s + c.correct, 0);
    const total = cells.reduce((s, c) => s + c.total, 0);
    return total > 0 ? Math.round((correct / total) * 100) : null;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max border-separate border-spacing-1 text-sm">
        <caption className="sr-only">
          Procentul de răspunsuri corecte al fiecărui elev, pe lecții
        </caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="px-2 py-2 text-left font-bold font-heading uppercase tracking-wide"
            >
              Elev
            </th>
            {lessons.map((l) => (
              <th
                key={l.id}
                scope="col"
                className="max-w-36 px-2 py-2 text-left align-bottom font-medium text-muted-foreground"
              >
                {l.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <th
                scope="row"
                className="whitespace-nowrap px-2 py-1.5 text-left font-medium"
              >
                {s.name}
              </th>
              {lessons.map((l) => {
                const c = s.cells.get(l.id);
                if (!c)
                  return (
                    <td
                      key={l.id}
                      className="bg-muted/40 px-2 py-1.5 text-center text-muted-foreground"
                    >
                      –<span className="sr-only">fără răspunsuri</span>
                    </td>
                  );
                const pct = Math.round((c.correct / c.total) * 100);
                return (
                  <td
                    key={l.id}
                    className={cn(
                      "px-2 py-1.5 text-center font-semibold tabular-nums",
                      tone(pct),
                    )}
                    title={`${c.correct} din ${c.total} corecte`}
                  >
                    {pct}%
                    <span className="block font-normal text-[0.7rem] opacity-80">
                      {c.correct}/{c.total}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th
              scope="row"
              className="px-2 py-2 text-left font-bold font-heading uppercase tracking-wide"
            >
              Media clasei
            </th>
            {lessonAvg.map((pct, i) => (
              <td
                key={lessons[i].id}
                className={cn(
                  "px-2 py-2 text-center font-bold tabular-nums",
                  pct === null ? "text-muted-foreground" : tone(pct),
                )}
              >
                {pct === null ? "–" : `${pct}%`}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
