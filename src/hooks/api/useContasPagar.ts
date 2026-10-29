import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  contasPagarApi,
  ContasPagarUnificadasResponse,
  ListContasPagarFiltros,
  LiquidarIndividualPayload,
  LotePagamentoPayload,
} from "@/services/api/contas-pagar.api";

export function useContasPagar(filtros?: ListContasPagarFiltros) {
  const queryClient = useQueryClient();

  const query = useQuery<ContasPagarUnificadasResponse>({
    queryKey: ["contas-pagar", filtros],
    queryFn: () => contasPagarApi.list(filtros),
    staleTime: 2 * 60 * 1000,
  });

  const liquidarMutation = useMutation({
    mutationFn: ({
      id,
      payload,
      tipo,
    }: {
      id: string;
      payload: LiquidarIndividualPayload;
      tipo?: "DESPESA" | "CONVENIO";
    }) => contasPagarApi.liquidarIndividual(id, payload, tipo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-pagar"] });
      queryClient.invalidateQueries({ queryKey: ["despesas"] });
      queryClient.invalidateQueries({ queryKey: ["convenios"] });
      queryClient.invalidateQueries({ queryKey: ["fluxo-caixa"] });
      queryClient.invalidateQueries({ queryKey: ["dre"] });
    },
  });

  const loteMutation = useMutation({
    mutationFn: (payload: LotePagamentoPayload) => contasPagarApi.processarLote(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-pagar"] });
      queryClient.invalidateQueries({ queryKey: ["despesas"] });
      queryClient.invalidateQueries({ queryKey: ["convenios"] });
      queryClient.invalidateQueries({ queryKey: ["fluxo-caixa"] });
      queryClient.invalidateQueries({ queryKey: ["dre"] });
      queryClient.invalidateQueries({ queryKey: ["lotes-pagamento"] });
    },
  });

  return {
    ...query,
    itens: query.data?.itens || [],
    kpis: query.data?.kpis,
    liquidarMutation,
    loteMutation,
  };
}

export function useLotesPagamento(params?: { mes?: number; ano?: number }) {
  return useQuery({
    queryKey: ["lotes-pagamento", params],
    queryFn: () => contasPagarApi.listLotes(params),
    staleTime: 5 * 60 * 1000,
  });
}
