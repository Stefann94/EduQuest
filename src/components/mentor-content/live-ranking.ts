// Regulile de clasament și XP pentru quiz-ul live (PROJECT.md §10.2).
// Modul comun: îl folosesc atât panoul de control (în browser), cât și Server Action-ul.

/** XP pentru locurile 1–4; ceilalți participanți primesc +1 XP. */
export const LIVE_XP_BY_RANK = [5, 4, 3, 2] as const;
export const LIVE_XP_PARTICIPATION = 1;

export function liveXpForRank(rank: number) {
  return LIVE_XP_BY_RANK[rank - 1] ?? LIVE_XP_PARTICIPATION;
}

/**
 * Clasamentul final. La punctaj egal, elevii împart locul și primesc același XP;
 * locul următor se sare (1, 2, 2, 4). Ordinea de intrare se păstrează la egalitate.
 */
export function rankLiveResults<T extends { score: number }>(rows: T[]) {
  const sorted = [...rows].sort((a, b) => b.score - a.score);
  let rank = 0;
  return sorted.map((r, i) => {
    if (i === 0 || r.score !== sorted[i - 1].score) rank = i + 1;
    return { ...r, rank, xp: liveXpForRank(rank) };
  });
}

/** „264 817”: codul sesiunii, mai ușor de citit de pe ecranul proiectat. */
export function formatSessionCode(code: string) {
  return code.length === 6 ? `${code.slice(0, 3)} ${code.slice(3)}` : code;
}
