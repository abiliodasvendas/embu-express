export const FINANCEIRO_STATUS = {
    DRAFT: 'DRAFT',
    FECHADO: 'FECHADO',
    PAGO: 'PAGO',
} as const;

export type FinanceiroStatus = keyof typeof FINANCEIRO_STATUS;
