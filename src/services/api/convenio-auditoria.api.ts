import {
  AuditoriaConvenioResultado,
  FaturaFornecedorConvenio,
  StatusFaturaFornecedorConvenio,
  ResumoGeralConveniosResultado,
} from "@/types/database";
import { apiClient } from "./client";

export const convenioAuditoriaApi = {
  getAuditoria: (
    convenioId: string,
    mes: number,
    ano: number
  ): Promise<AuditoriaConvenioResultado> =>
    apiClient
      .get(`/convenios/${convenioId}/auditoria`, { params: { mes, ano } })
      .then((res) => res.data),

  salvarFaturaFornecedor: (
    convenioId: string,
    data: Partial<FaturaFornecedorConvenio>
  ): Promise<FaturaFornecedorConvenio> =>
    apiClient
      .post(`/convenios/${convenioId}/fatura-fornecedor`, data)
      .then((res) => res.data),

  atualizarStatusFatura: (
    convenioId: string,
    faturaId: string,
    status: StatusFaturaFornecedorConvenio,
    observacoes?: string | null
  ): Promise<FaturaFornecedorConvenio> =>
    apiClient
      .patch(`/convenios/${convenioId}/fatura-fornecedor/${faturaId}/status`, {
        status,
        observacoes,
      })
      .then((res) => res.data),

  getResumoGeral: (
    mes: number,
    ano: number
  ): Promise<ResumoGeralConveniosResultado> =>
    apiClient
      .get("/convenios/resumo-geral", { params: { mes, ano } })
      .then((res) => res.data),
};
