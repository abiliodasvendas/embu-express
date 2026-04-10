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
