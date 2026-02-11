import { messages } from "@/constants/messages";
import { colaboradorApi } from "@/services/api/colaborador.api";
import { formatDateToISO } from "@/utils/date";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateCollaborator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any & { silent?: boolean }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { silent, ...collaboratorData } = data;
      
      const payload = {
          ...collaboratorData,
          data_nascimento: formatDateToISO(collaboratorData.data_nascimento),
          cnh_vencimento: formatDateToISO(collaboratorData.cnh_vencimento),
          data_inicio: formatDateToISO(collaboratorData.data_inicio),
      };

      return colaboradorApi.createColaborador(payload);
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
    mutationFn: ({ id, ...data }: any) => {
        const payload = {
            ...data,
            data_nascimento: formatDateToISO(data.data_nascimento),
            cnh_vencimento: formatDateToISO(data.cnh_vencimento),
            data_inicio: formatDateToISO(data.data_inicio),
        };
        return colaboradorApi.updateColaborador(id, payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["collaborators"] });
      queryClient.invalidateQueries({ queryKey: ["collaborator", variables.id.toString()] });
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

export function useUpdateCollaboratorStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
        colaboradorApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["collaborators"] });
      queryClient.invalidateQueries({ queryKey: ["collaborator", variables.id.toString()] });
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

export function useCreateVinculo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => colaboradorApi.createVinculo(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["collaborator", variables.colaborador_id] });
      toast.success("Vínculo criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar vínculo", {
        description: error.message,
      });
    },
  });
}

export function useUpdateVinculo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => colaboradorApi.updateVinculo(id, data),
    onSuccess: (_, variables) => {
       // We might not have colaborador_id here if it's not passed, but usually it is
       queryClient.invalidateQueries({ queryKey: ["collaborator"] });
       toast.success("Vínculo atualizado!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar vínculo", {
        description: error.message,
      });
    },
  });
}

export function useDeleteVinculo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => colaboradorApi.deleteVinculo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaborator"] });
      toast.success("Vínculo removido!");
    },
    onError: (error: any) => {
      toast.error("Erro ao remover vínculo", {
        description: error.message,
      });
    },
  });
}
