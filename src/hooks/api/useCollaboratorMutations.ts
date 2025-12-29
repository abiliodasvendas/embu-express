import { messages } from "@/constants/messages";
import { colaboradorApi } from "@/services/api/colaborador.api";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateCollaborator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any & { silent?: boolean }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { silent, ...collaboratorData } = data;
      return colaboradorApi.createColaborador(collaboratorData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["collaborators"] });
      queryClient.invalidateQueries({ queryKey: ["active-collaborators-filter"] });
      queryClient.invalidateQueries({ queryKey: ["active-collaborators-combo"] });
      if (!variables.silent) {
        toast.success(messages.colaborador.sucesso.criado);
      }
    },
    onError: (error: any) => {
      toast.error(messages.colaborador.erro.criar, {
        description: error.message,
      });
    },
  });
}

export function useUpdateCollaborator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => colaboradorApi.updateColaborador(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaborators"] });
      queryClient.invalidateQueries({ queryKey: ["active-collaborators-filter"] });
      queryClient.invalidateQueries({ queryKey: ["active-collaborators-combo"] });
      toast.success(messages.colaborador.sucesso.atualizado);
    },
    onError: (error: any) => {
      toast.error(messages.colaborador.erro.atualizar, {
        description: error.message,
      });
    },
  });
}

export function useToggleCollaboratorStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => 
        colaboradorApi.toggleStatus(id, ativo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaborators"] });
      queryClient.invalidateQueries({ queryKey: ["active-collaborators-filter"] });
      queryClient.invalidateQueries({ queryKey: ["active-collaborators-combo"] });
      toast.success(messages.colaborador.sucesso.status);
    },
    onError: (error: any) => {
      toast.error(messages.colaborador.erro.toggleStatus, {
        description: error.message,
      });
    },
  });
}

export function useDeleteCollaborator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => colaboradorApi.deleteColaborador(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaborators"] });
      queryClient.invalidateQueries({ queryKey: ["active-collaborators-filter"] });
      queryClient.invalidateQueries({ queryKey: ["active-collaborators-combo"] });
      queryClient.invalidateQueries({ queryKey: ["time-records"] });
      toast.success(messages.colaborador.sucesso.excluido);
    },
    onError: (error: any) => {
      toast.error(messages.colaborador.erro.excluir, {
        description: error.message,
      });
    },
  });
}
