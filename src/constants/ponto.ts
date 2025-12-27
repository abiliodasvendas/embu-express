export const STATUS_PONTO = {
  ENTRADA: {
    NO_HORARIO: "VERDE",
    ATRASO: "AMARELO",
    MUITO_ATRASO: "VERMELHO",
  },
  SAIDA: {
    TRABALHANDO: "EM_ANDAMENTO",
    NO_HORARIO: "VERDE",
    HORA_EXTRA: "AMARELO",
    HORA_EXTRA_EXCESSIVA: "VERMELHO",
    INDEFINIDO: "CINZA"
  }
} as const;

export const FILTER_OPTIONS = {
    TRABALHANDO: "trabalhando",
    TODOS: "todos"
} as const;
