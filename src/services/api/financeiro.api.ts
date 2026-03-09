import { apiClient } from "./client";

export const financeiroApi = {
    getExtratoMensal: (usuarioId: string, mes: number, ano: number): Promise<any> =>
        apiClient.get(`/financeiro/extrato-mensal/${usuarioId}`, { params: { mes, ano } }).then(res => res.data),

    confirmarFechamento: (usuarioId: string, mes: number, ano: number): Promise<any> =>
        apiClient.post(`/financeiro/fechar/${usuarioId}`, { mes, ano }).then(res => res.data),

    marcarComoPago: (id: number): Promise<any> =>
        apiClient.put(`/financeiro/pagar/${id}`).then(res => res.data),
};
