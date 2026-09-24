import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { convenioAuditoriaApi } from "@/services/api/convenio-auditoria.api";
import {
  FaturaFornecedorConvenio,
  StatusFaturaFornecedorConvenio,
} from "@/types/database";

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

export function useSalvarFaturaFornecedor(convenioId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<FaturaFornecedorConvenio>) =>
      convenioAuditoriaApi.salvarFaturaFornecedor(convenioId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVENIO_AUDITORIA_KEYS.all });
    },
  });
}

export function useAtualizarStatusFaturaFornecedor(convenioId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      faturaId,
      status,
      observacoes,
    }: {
      faturaId: string;
      status: StatusFaturaFornecedorConvenio;
      observacoes?: string | null;
    }) =>
      convenioAuditoriaApi.atualizarStatusFatura(
        convenioId,
        faturaId,
        status,
        observacoes
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVENIO_AUDITORIA_KEYS.all });
    },
  });
}
