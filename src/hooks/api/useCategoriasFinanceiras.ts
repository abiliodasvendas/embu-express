import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  categoriasFinanceirasApi,
  CreateCategoriaFinanceiraPayload,
  ListCategoriasFinanceirasFiltros,
  UpdateCategoriaFinanceiraPayload,
} from "@/services/api/categorias-financeiras.api";
import { CategoriaFinanceira } from "@/types/database";

function extractErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { error?: string; message?: string } } }).response?.data === "object"
  ) {
    const data = (error as { response?: { data?: { error?: string; message?: string } } }).response?.data;
    if (data?.error) return data.error;
    if (data?.message) return data.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

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
      toast.success("Categoria criada com sucesso!");
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, "Erro ao criar categoria financeira."));
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
      toast.success("Categoria atualizada com sucesso!");
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, "Erro ao atualizar categoria financeira."));
    },
  });
}

export function useDeleteCategoriaFinanceira() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriasFinanceirasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias-financeiras"] });
      toast.success("Categoria excluída com sucesso!");
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, "Não foi possível excluir esta categoria."));
    },
  });
}
