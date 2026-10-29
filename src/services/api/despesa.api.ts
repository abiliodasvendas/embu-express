import { DespesaOperacional, CategoriaDespesa, StatusDespesa } from "@/types/database";
import { apiClient } from "./client";

export interface CreateDespesaPayload {
  empresa_id?: number | null;
  categoria: CategoriaDespesa;
  descricao: string;
  mes_competencia: number;
  ano_competencia: number;
  valor_previsto: number;
  valor_pago?: number;
  data_vencimento: string;
  data_pagamento?: string | null;
  status?: StatusDespesa;
  is_holding?: boolean;
  is_parcelado?: boolean;
  quantidade_parcelas?: number;
  is_recorrente?: boolean;
  meses_recorrencia?: number;
  grupo_parcelamento_id?: string | null;
  numero_parcela?: number | null;
  total_parcelas?: number | null;
}

export interface ListDespesasFiltros {
  mes?: number;
  ano?: number;
  empresa_id?: number;
  categoria?: CategoriaDespesa;
  status?: StatusDespesa;
}

export const despesaApi = {
  list: (filtros?: ListDespesasFiltros): Promise<DespesaOperacional[]> =>
    apiClient.get("/despesas", { params: filtros }).then((res) => res.data),

  getById: (id: string): Promise<DespesaOperacional> =>
    apiClient.get(`/despesas/${id}`).then((res) => res.data),

  create: (data: CreateDespesaPayload): Promise<DespesaOperacional> =>
    apiClient.post("/despesas", data).then((res) => res.data),

  update: (id: string, data: Partial<CreateDespesaPayload>): Promise<DespesaOperacional> =>
    apiClient.put(`/despesas/${id}`, data).then((res) => res.data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/despesas/${id}`).then((res) => res.data),

  marcarPaga: (id: string, data: { data_pagamento: string; valor_pago?: number; conta_bancaria_id?: string }): Promise<DespesaOperacional> =>
    apiClient.patch(`/despesas/${id}/pagar`, data).then((res) => res.data),
};
