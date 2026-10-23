// Regulile pentru parole, folosite și pe server (validare), și în browser (lista de cerințe).
export const PASSWORD_RULES = [
  {
    id: "length",
    label: "Cel puțin 8 caractere",
    test: (v: string) => v.length >= 8,
  },
  {
    id: "letter",
    label: "Cel puțin o literă",
    test: (v: string) => /\p{L}/u.test(v),
  },
  {
    id: "digit",
    label: "Cel puțin o cifră",
    test: (v: string) => /\d/.test(v),
  },
] as const;
