export enum StatusUsuario {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
  PENDENTE = 'PENDENTE'
}

export enum StatusPonto {
  TRABALHANDO = 'trabalhando',
  PAUSADO = 'pausado',
  FINALIZADO = 'finalizado',
  AGUARDANDO = 'aguardando'
}

export enum StatusOcorrencia {
  PENDENTE = 'pendente',
  APROVADA = 'aprovada',
  REPROVADA = 'reprovada'
}

export enum OccurrenceFormMode {
  GENERAL = 'general',
  FINANCIAL = 'financial'
}

export enum StatusVisualPonto {
  VERDE = "VERDE",
  AMARELO = "AMARELO",
  VERMELHO = "VERMELHO",
  ANTECIPADA = "ANTECIPADA",
  CINZA = "CINZA",
  EM_ANDAMENTO = "EM_ANDAMENTO",
  AUSENTE = "AUSENTE",
  PENDENTE = "PENDENTE",
}

export enum FilterOptions {
  TRABALHANDO = "trabalhando",
  INICIOU = "iniciou",
  CONCLUIU = "concluiu",
  FALTA_SAIDA = "falta_saida",
  EM_ATRASO = "em_atraso",
  AGUARDANDO = "aguardando",
  NAO_INICIOU = "nao_iniciou",
  TODOS = "todos"
}

export enum PontoSide {
  ENTRADA = 'entrada',
  SAIDA = 'saida'
}

export enum ManagementStatus {
  ALL = 'ALL',
  LATE = 'LATE',
  WORKING = 'WORKING',
  OVERTIME = 'OVERTIME',
  DONE = 'DONE',
  WAITING = 'WAITING',
  ABSENT = 'ABSENT'
}

export enum TicketType {
  BUG = 'BUG',
  FEATURE = 'FEATURE',
  IMPROVEMENT = 'IMPROVEMENT'
}

export const TICKET_TYPE_LABELS: Record<TicketType, string> = {
  [TicketType.BUG]: "Erro (Bug)",
  [TicketType.FEATURE]: "Nova Funcionalidade",
  [TicketType.IMPROVEMENT]: "Ajustes/Alterações"
};

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELED = 'CANCELED'
}

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  [TicketStatus.CANCELED]: "Cancelado",
  [TicketStatus.OPEN]: "Aberto",
  [TicketStatus.IN_PROGRESS]: "Em Andamento",
  [TicketStatus.DONE]: "Concluído"
};

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  [TicketPriority.LOW]: "Baixa",
  [TicketPriority.MEDIUM]: "Média",
  [TicketPriority.HIGH]: "Alta"
};
