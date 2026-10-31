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
