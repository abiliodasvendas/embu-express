export const FINANCEIRO_STATUS = {
    RASCUNHO: 'RASCUNHO',
    PAGO: 'PAGO',
} as const;

export type FinanceiroStatus = keyof typeof FINANCEIRO_STATUS;

export const LANCAMENTO_TIPO = {
    ENTRADA: 'ENTRADA',
    SAIDA: 'SAIDA',
} as const;

export type LancamentoTipo = keyof typeof LANCAMENTO_TIPO;

export const PIX_TYPES = {
    CPF: 'CPF',
    CNPJ: 'CNPJ',
    EMAIL: 'EMAIL',
    TELEFONE: 'TELEFONE',
    ALEATORIA: 'ALEATORIA',
} as const;

export type PixType = keyof typeof PIX_TYPES;

export const CALENDARIO_STATUS = {
    TRABALHADO: 'TRABALHADO',
    SEM_ATIVIDADE: 'SEM_ATIVIDADE',
    NAO_VIGENTE: 'NAO_VIGENTE',
    FUTURO: 'FUTURO',
    FERIADO: 'FERIADO',
} as const;

export type CalendarioStatus = keyof typeof CALENDARIO_STATUS;

export const STATUS_FATURA = {
    PENDENTE: 'PENDENTE',
    PAGO_PARCIAL: 'PAGO_PARCIAL',
    LIQUIDADA: 'LIQUIDADA',
    CANCELADA: 'CANCELADA',
} as const;

export type StatusFaturaType = typeof STATUS_FATURA[keyof typeof STATUS_FATURA];

export const STATUS_FATURA_CONVENIO = {
    PENDENTE: 'PENDENTE',
    PAGO_PARCIAL: 'PAGO_PARCIAL',
    PAGA: 'PAGA',
    CANCELADA: 'CANCELADA',
    EM_AUDITORIA: 'EM_AUDITORIA',
    APROVADA: 'APROVADA',
    GLOSADA: 'GLOSADA',
} as const;

export type StatusFaturaConvenioType = typeof STATUS_FATURA_CONVENIO[keyof typeof STATUS_FATURA_CONVENIO];

export const STATUS_FATURA_LABELS: Record<StatusFaturaType, string> = {
    PENDENTE: 'Pendente / Aguardando',
    PAGO_PARCIAL: 'Pago Parcialmente',
    LIQUIDADA: 'Liquidada',
    CANCELADA: 'Cancelada',
};

export const PERIODICIDADE_FATURAMENTO = {
    QUINZENAL: 'QUINZENAL',
    MENSAL: 'MENSAL',
    SEMANAL: 'SEMANAL',
} as const;

export type PeriodicidadeFaturamentoType = typeof PERIODICIDADE_FATURAMENTO[keyof typeof PERIODICIDADE_FATURAMENTO];

export const PERIODICIDADE_FATURAMENTO_LABELS: Record<PeriodicidadeFaturamentoType, string> = {
    QUINZENAL: 'Quinzenal (Duas vezes no mês)',
    MENSAL: 'Mensal (Uma vez no mês)',
    SEMANAL: 'Semanal',
};

export const PERIODICIDADE_LABELS_CURTO: Record<PeriodicidadeFaturamentoType, string> = {
    QUINZENAL: 'Quinzenal',
    MENSAL: 'Mensal',
    SEMANAL: 'Semanal',
};

export function getPeriodicidadeLabel(periodicidade?: string | null): string {
    if (periodicidade === PERIODICIDADE_FATURAMENTO.SEMANAL) return PERIODICIDADE_LABELS_CURTO.SEMANAL;
    if (periodicidade === PERIODICIDADE_FATURAMENTO.MENSAL) return PERIODICIDADE_LABELS_CURTO.MENSAL;
    return PERIODICIDADE_LABELS_CURTO.QUINZENAL;
}

export const TIPO_PERIODO_FATURA = {
    QUINZENAL: 'QUINZENAL',
    MENSAL: 'MENSAL',
    SEMANAL: 'SEMANAL',
} as const;

export type TipoPeriodoFaturaType = typeof TIPO_PERIODO_FATURA[keyof typeof TIPO_PERIODO_FATURA];

export const FILTRO_PERIODO_FATURA = {
    TODOS: 'todas',
    QUINZENA_1: '1',
    QUINZENA_2: '2',
    MENSAL: 'MENSAL',
    SEMANA_1: 'SEM_1',
    SEMANA_2: 'SEM_2',
    SEMANA_3: 'SEM_3',
    SEMANA_4: 'SEM_4',
    SEMANA_5: 'SEM_5',
} as const;

export type FiltroPeriodoFaturaType = typeof FILTRO_PERIODO_FATURA[keyof typeof FILTRO_PERIODO_FATURA];

export const STATUS_INTERCOMPANY = {
    PENDENTE_ACERTO: 'PENDENTE_ACERTO',
    COMPENSADO: 'COMPENSADO',
} as const;

export type StatusIntercompanyType = typeof STATUS_INTERCOMPANY[keyof typeof STATUS_INTERCOMPANY];

export const TIPO_COBRANCA_CLIENTE = {
    DIARIA_MOTOBOY: 'DIARIA_MOTOBOY',
    FIXO_MENSAL: 'FIXO_MENSAL',
    PRODUCAO_ENTREGA: 'PRODUCAO_ENTREGA',
} as const;

export type TipoCobrancaClienteType = typeof TIPO_COBRANCA_CLIENTE[keyof typeof TIPO_COBRANCA_CLIENTE];

export const CATEGORIA_DESPESA = {
    DESPESA_FIXA: 'DESPESA_FIXA',
    TRIBUTO_DAS: 'TRIBUTO_DAS',
    PARCELAMENTO_FISCAL: 'PARCELAMENTO_FISCAL',
    INVESTIMENTO_FINANCIAMENTO: 'INVESTIMENTO_FINANCIAMENTO',
    DESPESA_FINANCEIRA: 'DESPESA_FINANCEIRA',
    PROLABORE: 'PROLABORE',
    INVESTIMENTO_PATRIMONIAL: 'INVESTIMENTO_PATRIMONIAL',
    CARTAO_CREDITO: 'CARTAO_CREDITO',
    DESPESA_ADMINISTRATIVA: 'DESPESA_ADMINISTRATIVA',
    DESPESA_FROTA_DOCUMENTO: 'DESPESA_FROTA_DOCUMENTO',
} as const;

export type CategoriaDespesaType = typeof CATEGORIA_DESPESA[keyof typeof CATEGORIA_DESPESA];

export const CATEGORIA_DESPESA_LABELS: Record<CategoriaDespesaType, string> = {
    DESPESA_FIXA: 'Despesa Operacional Fixa',
    DESPESA_ADMINISTRATIVA: 'Despesa Administrativa / Escritório / Contas',
    CARTAO_CREDITO: 'Cartão de Crédito Corporativo',
    DESPESA_FROTA_DOCUMENTO: 'Frota: Documentação e IPVA',
    TRIBUTO_DAS: 'Tributo DAS / Simples Nacional',
    PROLABORE: 'Retirada de Pró-labore dos Sócios',
    PARCELAMENTO_FISCAL: 'Parcelamentos Fiscais / Dívidas',
    INVESTIMENTO_PATRIMONIAL: 'Investimentos e Patrimônio',
    INVESTIMENTO_FINANCIAMENTO: 'Amortização de Empréstimos / Financiamentos',
    DESPESA_FINANCEIRA: 'Juros e Tarifas Financeiras',
};

export const STATUS_DESPESA = {
    PENDENTE: 'PENDENTE',
    ADIADA: 'ADIADA',
    PAGO: 'PAGO',
    CANCELADO: 'CANCELADO',
} as const;

export type StatusDespesaType = typeof STATUS_DESPESA[keyof typeof STATUS_DESPESA];

export const TIPO_MOVIMENTACAO_AVULSA = {
    ENTRADA: 'ENTRADA',
    SAIDA: 'SAIDA',
} as const;

export type TipoMovimentacaoAvulsaType = typeof TIPO_MOVIMENTACAO_AVULSA[keyof typeof TIPO_MOVIMENTACAO_AVULSA];

export const CATEGORIA_MOVIMENTACAO_AVULSA = {
    FRETE_ESPORADICO: 'FRETE_ESPORADICO',
    RENDIMENTO_APLICACAO: 'RENDIMENTO_APLICACAO',
    REEMBOLSO_CLIENTE: 'REEMBOLSO_CLIENTE',
    DOACAO_APORTE: 'DOACAO_APORTE',
    OUTRAS_ENTRADAS: 'OUTRAS_ENTRADAS',
    DESPESA_OPERACIONAL_AVULSA: 'DESPESA_OPERACIONAL_AVULSA',
    REEMBOLSO_DESPESA: 'REEMBOLSO_DESPESA',
    TARIFA_BANCARIA: 'TARIFA_BANCARIA',
    OUTRAS_SAIDAS: 'OUTRAS_SAIDAS',
} as const;

export type CategoriaMovimentacaoAvulsaType = typeof CATEGORIA_MOVIMENTACAO_AVULSA[keyof typeof CATEGORIA_MOVIMENTACAO_AVULSA];

export const CATEGORIA_MOVIMENTACAO_AVULSA_LABELS: Record<CategoriaMovimentacaoAvulsaType, string> = {
    FRETE_ESPORADICO: 'Frete Esporádico / À Vista',
    RENDIMENTO_APLICACAO: 'Rendimento de Aplicação',
    REEMBOLSO_CLIENTE: 'Reembolso de Cliente',
    DOACAO_APORTE: 'Aporte / Doação / Capital',
    OUTRAS_ENTRADAS: 'Outras Entradas',
    DESPESA_OPERACIONAL_AVULSA: 'Despesa Operacional Direta',
    REEMBOLSO_DESPESA: 'Reembolso de Despesa',
    TARIFA_BANCARIA: 'Tarifa / Custo Bancário',
    OUTRAS_SAIDAS: 'Outras Saídas',
};

export const CATEGORIAS_ENTRADA: CategoriaMovimentacaoAvulsaType[] = [
    CATEGORIA_MOVIMENTACAO_AVULSA.FRETE_ESPORADICO,
    CATEGORIA_MOVIMENTACAO_AVULSA.RENDIMENTO_APLICACAO,
    CATEGORIA_MOVIMENTACAO_AVULSA.REEMBOLSO_CLIENTE,
    CATEGORIA_MOVIMENTACAO_AVULSA.DOACAO_APORTE,
    CATEGORIA_MOVIMENTACAO_AVULSA.OUTRAS_ENTRADAS,
];

export const CATEGORIAS_SAIDA: CategoriaMovimentacaoAvulsaType[] = [
    CATEGORIA_MOVIMENTACAO_AVULSA.DESPESA_OPERACIONAL_AVULSA,
    CATEGORIA_MOVIMENTACAO_AVULSA.REEMBOLSO_DESPESA,
    CATEGORIA_MOVIMENTACAO_AVULSA.TARIFA_BANCARIA,
    CATEGORIA_MOVIMENTACAO_AVULSA.OUTRAS_SAIDAS,
];

export const NIVEL_RISCO_VALE = {
    NORMAL: 'NORMAL',
    RISCO_MEDIO: 'RISCO_MEDIO',
    RISCO_ALTO: 'RISCO_ALTO',
    TRATADO_SEGURO: 'TRATADO_SEGURO',
    AJUSTADO_MARGEM_CRITICA: 'AJUSTADO_MARGEM_CRITICA',
} as const;

export type NivelRiscoValeType = typeof NIVEL_RISCO_VALE[keyof typeof NIVEL_RISCO_VALE];

export const CLIENTES_ESPECIAIS = {
    INTERNO: 'INTERNO',
} as const;

