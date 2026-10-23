// Tipurile pentru navigarea fiecărui rol (configurată în layout-urile din app/).

export type NavItem = {
  label: string;
  href: string;
  /** Iconița, deja randată (un element JSX), ca să poată trece de la server la client. */
  icon: React.ReactNode;
  /** Număr afișat lângă link (ex. notificări necitite). */
  badge?: number;
  /** Activ doar pe ruta exactă (ex. „Acasă”), nu și pe subpagini. */
  exact?: boolean;
};

export type NavGroup = { label?: string; items: NavItem[] };

export type ShellUser = {
  name: string;
  roleLabel: string;
  avatar?: import("@/lib/data/types").AvatarId;
};
