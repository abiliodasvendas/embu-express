import { unidadeApi } from "@/services/api/unidade.api";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateUnidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => unidadeApi.createUnidade(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unidades"] });
      toast.success("Unidade criada com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar unidade", { description: error.message });
    },
  });
}

export function useUpdateUnidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: any) => unidadeApi.updateUnidade(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unidades"] });
      toast.success("Unidade atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar unidade", { description: error.message });
    },
  });
}

export function useDeleteUnidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => unidadeApi.deleteUnidade(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unidades"] });
      toast.success("Unidade removida com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao remover unidade", { description: error.message });
    },
  });
}

export function useToggleUnidadeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ativo }: { id: number; ativo: boolean }) =>
      unidadeApi.updateUnidade(id, { ativo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unidades"] });
    },
    onError: (error: any) => {
      toast.error("Erro ao alterar status da unidade", { description: error.message });
    },
  });
}
