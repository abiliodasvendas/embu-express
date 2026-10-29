import { ContaPagarItem, ContasPagarKpis, LotePagamento } from "@/types/database";
import { apiClient } from "./client";

export interface ItemPagamentoLotePayload {
  id: string;
  tipo: "DESPESA" | "CONVENIO";
  valor_alocado: number;
}

export interface LotePagamentoPayload {
  conta_bancaria_origem_id: string;
  data_pagamento: string;
  valor_total_pago: number;
  observacao?: string | null;
  itens: ItemPagamentoLotePayload[];
}

export interface LiquidarIndividualPayload {
  conta_bancaria_id: string;
  data_pagamento: string;
  valor_pago: number;
}

export interface ListContasPagarFiltros {
  mes?: number;
  ano?: number;
  empresa_id?: number;
  status?: string;
  busca?: string;
}

export interface ContasPagarUnificadasResponse {
  itens: ContaPagarItem[];
  kpis: ContasPagarKpis;
}

export const contasPagarApi = {
  list: (filtros?: ListContasPagarFiltros): Promise<ContasPagarUnificadasResponse> =>
    apiClient.get("/contas-pagar/unificado", { params: filtros }).then((res) => res.data),

  processarLote: (payload: LotePagamentoPayload): Promise<LotePagamento> =>
    apiClient.post("/contas-pagar/lote", payload).then((res) => res.data),

  listLotes: (params?: { mes?: number; ano?: number }): Promise<LotePagamento[]> =>
    apiClient.get("/contas-pagar/lotes", { params }).then((res) => res.data),

  liquidarIndividual: (
    id: string,
    payload: LiquidarIndividualPayload,
    tipo?: "DESPESA" | "CONVENIO"
  ): Promise<unknown> =>
    apiClient
      .post(`/contas-pagar/${id}/liquidar`, payload, { params: { tipo } })
      .then((res) => res.data),
};
