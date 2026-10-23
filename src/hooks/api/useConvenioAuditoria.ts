import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { convenioAuditoriaApi } from "@/services/api/convenio-auditoria.api";

export const CONVENIO_AUDITORIA_KEYS = {
  all: ["convenio-auditoria"] as const,
  resumoGeral: (mes: number, ano: number) =>
    [...CONVENIO_AUDITORIA_KEYS.all, "resumo-geral", mes, ano] as const,
  detail: (id: string, mes: number, ano: number) =>
    [...CONVENIO_AUDITORIA_KEYS.all, id, mes, ano] as const,
};

export function useConvenioAuditoria(convenioId?: string, mes?: number, ano?: number) {
  return useQuery({
    queryKey: CONVENIO_AUDITORIA_KEYS.detail(convenioId || "", mes || 0, ano || 0),
    queryFn: () => convenioAuditoriaApi.getAuditoria(convenioId!, mes!, ano!),
    enabled: !!convenioId && !!mes && !!ano,
  });
}

export function useResumoGeralConvenios(mes: number, ano: number) {
  return useQuery({
    queryKey: CONVENIO_AUDITORIA_KEYS.resumoGeral(mes, ano),
    queryFn: () => convenioAuditoriaApi.getResumoGeral(mes, ano),
    enabled: !!mes && !!ano,
    staleTime: 30 * 1000,
  });
}

export function useLiquidarFaturaConvenio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
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
    }) => convenioAuditoriaApi.liquidarFatura(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVENIO_AUDITORIA_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["fluxo-caixa"] });
      queryClient.invalidateQueries({ queryKey: ["dre"] });
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
    },
  });
}
