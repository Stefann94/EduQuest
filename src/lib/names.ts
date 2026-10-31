// Numele unui elev, după cine îl vede. Mentorul vede numele real (teme, prezență,
// activitate); colegii văd username-ul (clasamente, quiz-uri, echipe).

type Named = { displayName: string; username?: string | null };

/** Cum îl văd colegii pe un elev: username-ul, iar dacă nu are, numele. */
export function peerName(u: Named) {
  return u.username || u.displayName;
}
