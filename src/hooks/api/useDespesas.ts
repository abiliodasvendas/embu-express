import { despesaApi, CreateDespesaPayload, ListDespesasFiltros } from "@/services/api/despesa.api";
import { DespesaOperacional } from "@/types/database";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useDespesas(filtros?: ListDespesasFiltros) {
  const queryClient = useQueryClient();

  const query = useQuery<DespesaOperacional[]>({
    queryKey: ["despesas", filtros],
    queryFn: () => despesaApi.list(filtros),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateDespesaPayload) => despesaApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["despesas"] });
      queryClient.invalidateQueries({ queryKey: ["dre"] });
      queryClient.invalidateQueries({ queryKey: ["fluxo-caixa"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDespesaPayload> }) =>
      despesaApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["despesas"] });
      queryClient.invalidateQueries({ queryKey: ["dre"] });
      queryClient.invalidateQueries({ queryKey: ["fluxo-caixa"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => despesaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["despesas"] });
      queryClient.invalidateQueries({ queryKey: ["dre"] });
      queryClient.invalidateQueries({ queryKey: ["fluxo-caixa"] });
    },
  });

  return {
    ...query,
    despesas: query.data || [],
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
