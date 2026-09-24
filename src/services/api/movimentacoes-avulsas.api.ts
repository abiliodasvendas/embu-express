import { MovimentacaoAvulsa, TipoMovimentacaoAvulsa, CategoriaMovimentacaoAvulsa } from "@/types/database";
import { apiClient } from "./client";

export interface CreateMovimentacaoAvulsaPayload {
  empresa_id: number;
  conta_bancaria_id?: string | null;
  tipo_movimentacao: TipoMovimentacaoAvulsa;
  categoria: CategoriaMovimentacaoAvulsa;
  descricao: string;
  valor: number;
  data_movimentacao: string;
  comprovante_url?: string | null;
}

export interface ListMovimentacoesAvulsasFiltros {
  mes?: number;
  ano?: number;
  empresa_id?: number;
  tipo_movimentacao?: TipoMovimentacaoAvulsa;
  categoria?: CategoriaMovimentacaoAvulsa;
}

export const movimentacoesAvulsasApi = {
  list: (filtros?: ListMovimentacoesAvulsasFiltros): Promise<MovimentacaoAvulsa[]> =>
    apiClient.get("/movimentacoes-avulsas", { params: filtros }).then((res) => res.data),

  getById: (id: string): Promise<MovimentacaoAvulsa> =>
    apiClient.get(`/movimentacoes-avulsas/${id}`).then((res) => res.data),

  create: (data: CreateMovimentacaoAvulsaPayload): Promise<MovimentacaoAvulsa> =>
    apiClient.post("/movimentacoes-avulsas", data).then((res) => res.data),

  update: (id: string, data: Partial<CreateMovimentacaoAvulsaPayload>): Promise<MovimentacaoAvulsa> =>
    apiClient.put(`/movimentacoes-avulsas/${id}`, data).then((res) => res.data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/movimentacoes-avulsas/${id}`).then((res) => res.data),
};
