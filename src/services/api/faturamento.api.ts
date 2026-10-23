import { FaturaCliente, LoteRecebimento, StatusFatura, AgingRecebiveisResultado } from "@/types/database";
import { apiClient } from "./client";

export interface ItemRecebimentoPayload {
  fatura_id: string;
  valor_alocado: number;
  observacao?: string | null;
}

export interface LoteRecebimentoPayload {
  conta_bancaria_destino_id: string;
  data_deposito: string;
  valor_total_depositado: number;
  observacao?: string | null;
  itens: ItemRecebimentoPayload[];
}

export interface LiquidarFaturaPayload {
  conta_bancaria_id: string;
  data_recebimento: string;
  valor_pago: number;
  observacao?: string | null;
}

export const faturamentoApi = {
  listFaturas: (filtros?: {
    mes?: number;
    ano?: number;
    quinzena?: number;
    tipo_periodo?: string;
    numero_periodo?: number;
    empresa_id?: number;
    cliente_id?: number;
    status?: StatusFatura;
  }): Promise<FaturaCliente[]> =>
    apiClient.get("/faturamento", { params: filtros }).then(res => res.data),

  getFatura: (id: string): Promise<FaturaCliente> =>
    apiClient.get(`/faturamento/${id}`).then(res => res.data),

  createFatura: (data: Partial<FaturaCliente>): Promise<FaturaCliente> =>
    apiClient.post("/faturamento", data).then(res => res.data),

  updateFatura: (id: string, data: Partial<FaturaCliente>): Promise<FaturaCliente> =>
    apiClient.put(`/faturamento/${id}`, data).then(res => res.data),

  deleteFatura: (id: string): Promise<void> =>
    apiClient.delete(`/faturamento/${id}`).then(res => res.data),

  processarLoteRecebimento: (payload: LoteRecebimentoPayload): Promise<LoteRecebimento> =>
    apiClient.post("/faturamento/lote-recebimento", payload).then(res => res.data),

  liquidarFatura: (id: string, payload: LiquidarFaturaPayload): Promise<FaturaCliente> =>
    apiClient.post(`/faturamento/${id}/liquidar`, payload).then(res => res.data),

  getAgingRecebiveis: (filtros?: { mes?: number; ano?: number; empresa_id?: number }): Promise<AgingRecebiveisResultado> =>
    apiClient.get("/faturamento/aging", { params: filtros }).then(res => res.data),
};
