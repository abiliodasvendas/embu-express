import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  categoriasFinanceirasApi,
  CreateCategoriaFinanceiraPayload,
  ListCategoriasFinanceirasFiltros,
  UpdateCategoriaFinanceiraPayload,
} from "@/services/api/categorias-financeiras.api";
import { CategoriaFinanceira } from "@/types/database";

export function useCategoriasFinanceirasQuery(filtros?: ListCategoriasFinanceirasFiltros) {
  return useQuery<CategoriaFinanceira[]>({
    queryKey: ["categorias-financeiras", filtros],
    queryFn: () => categoriasFinanceirasApi.list(filtros),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCategoriaFinanceira() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCategoriaFinanceiraPayload) =>
      categoriasFinanceirasApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias-financeiras"] });
    },
  });
}

export function useUpdateCategoriaFinanceira() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoriaFinanceiraPayload }) =>
      categoriasFinanceirasApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias-financeiras"] });
      queryClient.invalidateQueries({ queryKey: ["dre"] });
      queryClient.invalidateQueries({ queryKey: ["conta-bancaria-extrato"] });
    },
  });
}

export function useDeleteCategoriaFinanceira() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriasFinanceirasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias-financeiras"] });
    },
  });
}
