import { apiClient } from "./client";

export const financeiroApi = {
    getExtratoMensal: (usuarioId: string, mes: number, ano: number): Promise<any> =>
        apiClient.get(`/financeiro/extrato-mensal/${usuarioId}`, { params: { mes, ano } }).then(res => res.data),

    processarPagamento: (usuarioId: string, mes: number, ano: number): Promise<any> =>
        apiClient.post(`/financeiro/pagar/${usuarioId}`, { mes, ano }).then(res => res.data),

    confirmarAdiantamento: (usuarioId: string, mes: number, ano: number): Promise<any> =>
        apiClient.post(`/financeiro/confirmar-adiantamento/${usuarioId}`, { mes, ano }).then(res => res.data),

    desconfirmarAdiantamento: (usuarioId: string, mes: number, ano: number): Promise<any> =>
        apiClient.delete(`/financeiro/desconfirmar-adiantamento/${usuarioId}`, { params: { mes, ano } }),

    desfazerPagamento: (usuarioId: string, mes: number, ano: number): Promise<any> =>
        apiClient.delete(`/financeiro/desfazer-pagamento/${usuarioId}`, { params: { mes, ano } }),
};
