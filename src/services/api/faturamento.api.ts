import { FaturaCliente, LoteRecebimento, StatusFatura, AgingRecebiveisResultado } from "@/types/database";
import { apiClient } from "./client";

export interface SugestaoMedicaoResponse {
  cliente_id: number;
  tipo_cobranca: string;
  valor_base: number;
  valor_diaria_glosa: number;
  periodo: { data_inicio: string; data_fim: string };
  dias_esperados: number;
  dias_trabalhados: number;
  faltas_sem_cobertura: number;
  valor_glosa: number;
  valor_sugerido: number;
}

export interface ItemRecebimentoPayload {
  fatura_id: string;
  valor_alocado: number;
  observacao?: string | null;
}

export interface LoteRecebimentoPayload {
  conta_bancaria_destino_id: string;
  data_deposito: string;
  valor_total_depositado: number;
  comprovante_url?: string | null;
  observacao?: string | null;
  itens: ItemRecebimentoPayload[];
}

export const faturamentoApi = {
  getSugestao: (clienteId: number, mes: number, ano: number, quinzena: number): Promise<SugestaoMedicaoResponse> =>
    apiClient.get("/faturamento/sugestao", {
      params: { cliente_id: clienteId, mes, ano, quinzena },
    }).then(res => res.data),

  listFaturas: (filtros?: {
    mes?: number;
    ano?: number;
    quinzena?: number;
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

  getAgingRecebiveis: (filtros?: { mes?: number; ano?: number; empresa_id?: number }): Promise<AgingRecebiveisResultado> =>
    apiClient.get("/faturamento/aging", { params: filtros }).then(res => res.data),
};
