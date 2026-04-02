import { Users, Clock, PlayCircle, LogOut, AlertTriangle } from "lucide-react";

export const STATUS_PONTO = {
  VERDE: "VERDE",
  AMARELO: "AMARELO",
  VERMELHO: "VERMELHO",
  ANTECIPADA: "ANTECIPADA",
  CINZA: "CINZA",
  EM_ANDAMENTO: "EM_ANDAMENTO",
  AUSENTE: "AUSENTE",
  PENDENTE: "PENDENTE",
} as const;

export const PONTO_STATUS_UI_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any; border: string; borderSide: string }> = {
  ALL: { label: "Todos", color: "text-primary", bg: "bg-primary/5", border: "border-primary", borderSide: "bg-primary", icon: Users },
  LATE: { label: "Atrasados", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-500", borderSide: "bg-amber-500", icon: Clock },
  WORKING: { label: "Trabalhando", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-500", borderSide: "bg-blue-500", icon: PlayCircle },
  DONE: { label: "Finalizado", color: "text-gray-400", bg: "bg-gray-100", border: "border-gray-500", borderSide: "bg-gray-400", icon: LogOut },
  WAITING: { label: "Aguar. Início", color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-300", borderSide: "bg-sky-400", icon: Clock },
  ABSENT: { label: "Ausência", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-500", borderSide: "bg-rose-500", icon: AlertTriangle },
};

export const FILTER_OPTIONS = {
  TRABALHANDO: "trabalhando",
  INICIOU: "iniciou",
  CONCLUIU: "concluiu",
  FALTA_SAIDA: "falta_saida",
  EM_ATRASO: "em_atraso",
  AGUARDANDO: "aguardando",
  NAO_INICIOU: "nao_iniciou",
  TODOS: "todos"
} as const;

export const PONTO_SIDE = {
  ENTRADA: 'entrada',
  SAIDA: 'saida',
} as const;
