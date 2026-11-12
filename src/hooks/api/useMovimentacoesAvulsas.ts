import {
  movimentacoesAvulsasApi,
  CreateMovimentacaoAvulsaPayload,
  CreateTransferenciaContasPayload,
  ListMovimentacoesAvulsasFiltros,
} from "@/services/api/movimentacoes-avulsas.api";
import { MovimentacaoAvulsa } from "@/types/database";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useMovimentacoesAvulsas(
  filtros?: ListMovimentacoesAvulsasFiltros,
  options?: { enabled?: boolean }
) {
  const queryClient = useQueryClient();

  const invalidateAllFinancialCaches = () => {
    queryClient.invalidateQueries({ queryKey: ["movimentacoes-avulsas"] });
    queryClient.invalidateQueries({ queryKey: ["categorias-financeiras"] });
    queryClient.invalidateQueries({ queryKey: ["contas-bancarias-saldos"] });
    queryClient.invalidateQueries({ queryKey: ["conta-bancaria-extrato"] });
    queryClient.invalidateQueries({ queryKey: ["dre"] });
    queryClient.invalidateQueries({ queryKey: ["fluxo-caixa"] });
  };

  const query = useQuery<MovimentacaoAvulsa[]>({
    queryKey: ["movimentacoes-avulsas", filtros],
    queryFn: () => movimentacoesAvulsasApi.list(filtros),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateMovimentacaoAvulsaPayload) => movimentacoesAvulsasApi.create(data),
    onSuccess: invalidateAllFinancialCaches,
  });

  const createTransferenciaMutation = useMutation({
    mutationFn: (data: CreateTransferenciaContasPayload) =>
      movimentacoesAvulsasApi.createTransferencia(data),
    onSuccess: invalidateAllFinancialCaches,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateMovimentacaoAvulsaPayload> }) =>
      movimentacoesAvulsasApi.update(id, data),
    onSuccess: invalidateAllFinancialCaches,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => movimentacoesAvulsasApi.delete(id),
    onSuccess: invalidateAllFinancialCaches,
  });

  return {
    ...query,
    movimentacoes: query.data || [],
    createMutation,
    createTransferenciaMutation,
    updateMutation,
    deleteMutation,
  };
}
