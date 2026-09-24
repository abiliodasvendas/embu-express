import {
  movimentacoesAvulsasApi,
  CreateMovimentacaoAvulsaPayload,
  ListMovimentacoesAvulsasFiltros,
} from "@/services/api/movimentacoes-avulsas.api";
import { MovimentacaoAvulsa } from "@/types/database";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useMovimentacoesAvulsas(filtros?: ListMovimentacoesAvulsasFiltros) {
  const queryClient = useQueryClient();

  const query = useQuery<MovimentacaoAvulsa[]>({
    queryKey: ["movimentacoes-avulsas", filtros],
    queryFn: () => movimentacoesAvulsasApi.list(filtros),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateMovimentacaoAvulsaPayload) => movimentacoesAvulsasApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movimentacoes-avulsas"] });
      queryClient.invalidateQueries({ queryKey: ["dre"] });
      queryClient.invalidateQueries({ queryKey: ["fluxo-caixa"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateMovimentacaoAvulsaPayload> }) =>
      movimentacoesAvulsasApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movimentacoes-avulsas"] });
      queryClient.invalidateQueries({ queryKey: ["dre"] });
      queryClient.invalidateQueries({ queryKey: ["fluxo-caixa"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => movimentacoesAvulsasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movimentacoes-avulsas"] });
      queryClient.invalidateQueries({ queryKey: ["dre"] });
      queryClient.invalidateQueries({ queryKey: ["fluxo-caixa"] });
    },
  });

  return {
    ...query,
    movimentacoes: query.data || [],
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
