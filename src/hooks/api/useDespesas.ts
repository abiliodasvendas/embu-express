import { despesaApi, CreateDespesaPayload, ListDespesasFiltros } from "@/services/api/despesa.api";
import { DespesaOperacional } from "@/types/database";
import { DespesaEscopoAcao } from "@/constants/financeiro.constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useDespesas(
  filtros?: ListDespesasFiltros,
  options?: { enabled?: boolean }
) {
  const queryClient = useQueryClient();

  const query = useQuery<DespesaOperacional[]>({
    queryKey: ["despesas", filtros],
    queryFn: () => despesaApi.list(filtros),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });

  const invalidarConsultasDespesas = () => {
    queryClient.invalidateQueries({ queryKey: ["despesas"] });
    queryClient.invalidateQueries({ queryKey: ["categorias-financeiras"] });
    queryClient.invalidateQueries({ queryKey: ["contas-pagar"] });
    queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
    queryClient.invalidateQueries({ queryKey: ["contas-bancarias-saldos"] });
    queryClient.invalidateQueries({ queryKey: ["conta-bancaria-extrato"] });
    queryClient.invalidateQueries({ queryKey: ["dre"] });
    queryClient.invalidateQueries({ queryKey: ["fluxo-caixa"] });
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateDespesaPayload) => despesaApi.create(data),
    onSuccess: () => invalidarConsultasDespesas(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDespesaPayload> }) =>
      despesaApi.update(id, data),
    onSuccess: () => invalidarConsultasDespesas(),
  });

  const deleteMutation = useMutation({
    mutationFn: (params: string | { id: string; escopo?: DespesaEscopoAcao }) => {
      if (typeof params === "string") {
        return despesaApi.delete(params);
      }
      return despesaApi.delete(params.id, params.escopo);
    },
    onSuccess: () => invalidarConsultasDespesas(),
  });

  const pagarMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { data_pagamento: string; valor_pago?: number; conta_bancaria_id?: string } }) =>
      despesaApi.marcarPaga(id, data),
    onSuccess: () => invalidarConsultasDespesas(),
  });

  const desfazerPagamentoMutation = useMutation({
    mutationFn: (id: string) => despesaApi.desfazerPagamento(id),
    onSuccess: () => invalidarConsultasDespesas(),
  });

  return {
    ...query,
    despesas: query.data || [],
    createMutation,
    updateMutation,
    deleteMutation,
    pagarMutation,
    desfazerPagamentoMutation,
  };
}
