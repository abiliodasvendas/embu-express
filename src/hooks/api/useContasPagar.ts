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

  const invalidateAllRelated = () => {
    queryClient.invalidateQueries({ queryKey: ["contas-pagar"] });
    queryClient.invalidateQueries({ queryKey: ["despesas"] });
    queryClient.invalidateQueries({ queryKey: ["convenios"] });
    queryClient.invalidateQueries({ queryKey: ["convenio-auditoria"] });
    queryClient.invalidateQueries({ queryKey: ["fluxo-caixa"] });
    queryClient.invalidateQueries({ queryKey: ["dre"] });
    queryClient.invalidateQueries({ queryKey: ["financeiro-extrato"] });
    queryClient.invalidateQueries({ queryKey: ["financeiro-status-geral"] });
    queryClient.invalidateQueries({ queryKey: ["financeiro-dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["contas-bancarias-saldos"] });
    queryClient.invalidateQueries({ queryKey: ["conta-bancaria-extrato"] });
  };

  const liquidarMutation = useMutation({
    mutationFn: ({
      id,
      payload,
      tipo,
    }: {
      id: string;
      payload: LiquidarIndividualPayload;
      tipo?: "DESPESA" | "CONVENIO" | "COLABORADOR";
    }) => contasPagarApi.liquidarIndividual(id, payload, tipo),
    onSuccess: () => {
      invalidateAllRelated();
    },
  });

  const loteMutation = useMutation({
    mutationFn: (payload: LotePagamentoPayload) => contasPagarApi.processarLote(payload),
    onSuccess: () => {
      invalidateAllRelated();
      queryClient.invalidateQueries({ queryKey: ["lotes-pagamento"] });
    },
  });

  const desfazerLiquidacaoMutation = useMutation({
    mutationFn: ({
      id,
      tipo,
    }: {
      id: string;
      tipo?: "DESPESA" | "CONVENIO" | "COLABORADOR";
    }) => contasPagarApi.desfazerLiquidacao(id, tipo),
    onSuccess: () => {
      invalidateAllRelated();
    },
  });

  return {
    ...query,
    itens: query.data?.itens || [],
    kpis: query.data?.kpis,
    liquidarMutation,
    loteMutation,
    desfazerLiquidacaoMutation,
  };
}

export function useLotesPagamento(params?: { mes?: number; ano?: number }) {
  return useQuery({
    queryKey: ["lotes-pagamento", params],
    queryFn: () => contasPagarApi.listLotes(params),
    staleTime: 5 * 60 * 1000,
  });
}
