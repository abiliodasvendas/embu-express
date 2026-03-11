import { apiClient } from "./client";

export const financeiroApi = {
    getExtratoMensal: (usuarioId: string, mes: number, ano: number): Promise<any> =>
        apiClient.get(`/financeiro/extrato-mensal/${usuarioId}`, { params: { mes, ano } }).then(res => res.data),

    processarPagamento: (usuarioId: string, mes: number, ano: number): Promise<any> =>
        apiClient.post(`/financeiro/pagar/${usuarioId}`, { mes, ano }).then(res => res.data),
};
