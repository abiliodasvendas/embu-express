import {
  AuditoriaConvenioResultado,
  FaturaFornecedorConvenio,
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

  getResumoGeral: (
    mes: number,
    ano: number
  ): Promise<ResumoGeralConveniosResultado> =>
    apiClient
      .get("/convenios/resumo-geral", { params: { mes, ano } })
      .then((res) => res.data),

  liquidarFatura: (data: {
    fatura_id?: string | null;
    convenio_id: string;
    mes_competencia: number;
    ano_competencia: number;
    data_vencimento: string;
    valor_total_fatura: number;
    valor_pago: number;
    data_pagamento: string;
    empresa_id: number;
    conta_bancaria_id: string;
    observacoes?: string | null;
  }): Promise<FaturaFornecedorConvenio> =>
    apiClient
      .post("/convenios/liquidar-fatura", data)
      .then((res) => res.data),
};
