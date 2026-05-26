import { ExtratoMensal } from "@/types/financeiro";
import { apiClient } from "./client";

export const financeiroApi = {
    getExtratoMensal: (usuarioId: string, mes: number, ano: number): Promise<ExtratoMensal> =>
        apiClient.get(`/financeiro/extrato-mensal/${usuarioId}`, { params: { mes, ano } }).then(res => res.data),

    processarPagamento: (usuarioId: string, mes: number, ano: number): Promise<any> =>
        apiClient.post(`/financeiro/pagar/${usuarioId}`, { mes, ano }).then(res => res.data),

    confirmarAdiantamento: (usuarioId: string, mes: number, ano: number): Promise<any> =>
        apiClient.post(`/financeiro/confirmar-adiantamento/${usuarioId}`, { mes, ano }).then(res => res.data),

    desconfirmarAdiantamento: (usuarioId: string, mes: number, ano: number): Promise<any> =>
        apiClient.delete(`/financeiro/desconfirmar-adiantamento/${usuarioId}`, { params: { mes, ano } }),

    desfazerPagamento: (usuarioId: string, mes: number, ano: number): Promise<any> =>
        apiClient.delete(`/financeiro/desfazer-pagamento/${usuarioId}`, { params: { mes, ano } }),

    getStatusGeral: (mes: number, ano: number): Promise<StatusGeralFechamento[]> =>
        apiClient.get(`/financeiro/status-geral`, { params: { mes, ano } }).then(res => res.data),
};

export interface StatusGeralFechamento {
  colaborador_id: string;
  nome_completo: string;
  email: string;
  adiantamento_confirmado: boolean;
  data_confirmacao_adiantamento: string | null;
  pago: boolean;
  data_pagamento: string | null;
  valor_adiantamento_configurado: number;
  valor_final: number;
  clientes: string[];
}
