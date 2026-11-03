// Răspunsurile la întrebări: o întrebare simplă are ca răspuns indexul variantei; una cu
// mai multe răspunsuri corecte (`multi`) are o mască de biți peste variante (varianta i
// aleasă ⇔ bitul i e 1; ex. variantele 0 și 2 → 0b101 = 5). Fișier fără acces la date,
// folosit și în browser.

/** Masca variantelor alese (indici 0…n−1). */
export function toMask(indices: Iterable<number>) {
  let mask = 0;
  for (const i of indices) mask |= 1 << i;
  return mask;
}

/** Indicii variantelor dintr-o mască, în ordine. */
export function fromMask(mask: number, count = 31) {
  const out: number[] = [];
  for (let i = 0; i < count; i++) if (mask & (1 << i)) out.push(i);
  return out;
}

/** Variantele alese de un răspuns (index sau mască), ca indici. */
export function chosenOptions(
  answer: number | null | undefined,
  multi: boolean,
  count?: number,
): number[] {
  if (answer === null || answer === undefined || answer < 0) return [];
  return multi ? fromMask(answer, count) : [answer];
}

/** Varianta `i` e aleasă în răspuns (index sau mască)? */
export function isChosen(
  answer: number | null | undefined,
  multi: boolean,
  i: number,
) {
  if (answer === null || answer === undefined || answer < 0) return false;
  return multi ? (answer & (1 << i)) !== 0 : answer === i;
}

/** Comută varianta `i` într-o mască. */
export const toggleInMask = (mask: number, i: number) => mask ^ (1 << i);

/** Literele variantelor (A–F), pentru afișare. */
export const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

const bits = (n: number) => {
  let c = 0;
  for (let x = n; x; x &= x - 1) c++;
  return c;
};

/**
 * Cât valorează un răspuns (0…1). La o întrebare simplă: 1 sau 0. La una cu mai multe
 * răspunsuri corecte, punctaj parțial care nu recompensează „bifez tot”:
 * corecte_bifate / total_corecte − greșite_bifate / total_greșite, cel puțin 0.
 * Aceeași regulă ca private.answer_credit din baza de date.
 */
export function answerCredit(
  key: number,
  answer: number | null | undefined,
  options: number,
  multi: boolean,
) {
  if (answer === null || answer === undefined || answer < 0) return 0;
  if (!multi) return answer === key ? 1 : 0;
  const all = (1 << options) - 1;
  const correct = bits(key);
  const wrong = options - correct;
  const hit = bits(answer & key) / (correct || 1);
  const miss = wrong ? bits(answer & ~key & all) / wrong : 0;
  return Math.max(0, Math.round((hit - miss) * 100) / 100);
}
