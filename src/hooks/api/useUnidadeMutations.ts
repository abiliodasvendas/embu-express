import { messages } from "@/constants/messages";
import { unidadeApi } from "@/services/api/unidade.api";
import { Unidade } from "@/types/database";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateUnidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Unidade>) => unidadeApi.createUnidade(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unidades"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success(messages.sucesso.salvar);
    },
    onError: (error: Error) => {
      toast.error(messages.erro.cadastrar, { description: error.message });
    },
  });
}

export function useUpdateUnidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Unidade> & { id: number }) => unidadeApi.updateUnidade(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["unidades"] });
      queryClient.invalidateQueries({ queryKey: ["unidade", variables.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success(messages.sucesso.atualizar);
    },
    onError: (error: Error) => {
      toast.error(messages.erro.atualizar, { description: error.message });
    },
  });
}

export function useDeleteUnidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => unidadeApi.deleteUnidade(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unidades"] });
      queryClient.invalidateQueries({ queryKey: ["unidade"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success(messages.sucesso.excluir);
    },
    onError: (error: Error) => {
      toast.error(messages.erro.excluir, { description: error.message });
    },
  });
}

export function useToggleUnidadeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ativo }: { id: number; ativo: boolean }) =>
      unidadeApi.updateUnidade(id, { ativo }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["unidades"] });
      queryClient.invalidateQueries({ queryKey: ["unidade", variables.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success(messages.sucesso.atualizar);
    },
    onError: (error: Error) => {
      toast.error(messages.erro.atualizar, { description: error.message });
    },
  });
}
