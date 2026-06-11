export const MENU_CATEGORIES = {
  PONTO: "Atividade",
  COLABORADORES: "Colaboradores",
  CADASTROS: "Cadastros",
  FINANCEIRO: "Financeiro",
  SISTEMA: "Sistema",
} as const;

export type MenuCategory = typeof MENU_CATEGORIES[keyof typeof MENU_CATEGORIES];
