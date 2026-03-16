import { messages } from "@/constants/messages";
import { colaboradorApi } from "@/services/api/colaborador.api";
import { formatDateToISO } from "@/utils/date";
import { toast } from "@/utils/notifications/toast";
import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Invalida caches de colaborador de forma robusta.
 */
async function invalidateCollaboratorCache(queryClient: QueryClient, id?: string) {
  // Invalida listas
  await queryClient.invalidateQueries({ queryKey: ["collaborators"] });
  await queryClient.invalidateQueries({ queryKey: ["active-collaborators-filter"] });
  await queryClient.invalidateQueries({ queryKey: ["active-collaborators-combo"] });

  if (id) {
    // Invalida o colaborador específico
    await queryClient.removeQueries({ queryKey: ["collaborator", id.toString()] });
    await queryClient.invalidateQueries({ queryKey: ["collaborator", id.toString()] });
    
    // Invalida caches derivados (financeiro)
    await queryClient.invalidateQueries({ queryKey: ["financeiro-extrato", id.toString()] });
  }
}

export function useCreateCollaborator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any & { silent?: boolean }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { silent, isMotoboyOrFiscal, ...collaboratorData } = data;

      const payload = {
        ...collaboratorData,
        data_nascimento: formatDateToISO(collaboratorData.data_nascimento),
        cnh_vencimento: formatDateToISO(collaboratorData.cnh_vencimento),
        data_inicio: formatDateToISO(collaboratorData.data_inicio),
      };

      return colaboradorApi.createColaborador(payload);
    },
    onSuccess: async (_, variables) => {
      await invalidateCollaboratorCache(queryClient);
      if (!variables.silent) {
        toast.success(messages.colaborador.sucesso.criado);
      }
    },
    onError: (error: any, variables) => {
      if (!variables.silent) {
        toast.error(messages.colaborador.erro.criar, {
          description: error.message,
        });
      }
    },
  });
}

export function useUpdateCollaborator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isMotoboyOrFiscal, silent, ...data }: any) => {
      const payload = {
        ...data,
        data_nascimento: formatDateToISO(data.data_nascimento),
        cnh_vencimento: formatDateToISO(data.cnh_vencimento),
        data_inicio: formatDateToISO(data.data_inicio),
      };
      return colaboradorApi.updateColaborador(id, payload);
    },
    onSuccess: async (_, variables) => {
      await invalidateCollaboratorCache(queryClient, variables.id);

      if (!variables.silent) {
        toast.success(messages.colaborador.sucesso.atualizado);
      }
    },
    onError: (error: any, variables) => {
      if (!variables.silent) {
        toast.error(messages.colaborador.erro.atualizar, {
          description: error.message,
        });
      }
    },
  });
}

export function useUpdateCollaboratorStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      colaboradorApi.updateStatus(id, status),
    onSuccess: async (_, variables) => {
      await invalidateCollaboratorCache(queryClient, variables.id);
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
    onSuccess: async () => {
      await invalidateCollaboratorCache(queryClient);
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
    onSuccess: async (_, variables) => {
      await invalidateCollaboratorCache(queryClient, variables.colaborador_id);
      toast.success(messages.vinculo.sucesso.criado);
    },
    onError: (error: any) => {
      toast.error(messages.vinculo.erro.criar, {
        description: error.message,
      });
    },
  });
}

export function useUpdateVinculo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, silent, ...data }: any) => colaboradorApi.updateVinculo(id, data),
    onSuccess: async (_, variables) => {
      await invalidateCollaboratorCache(queryClient, variables.colaborador_id);
      toast.success(messages.vinculo.sucesso.atualizado);
    },
    onError: (error: any) => {
      toast.error(messages.vinculo.erro.atualizar, {
        description: error.message,
      });
    },
  });
}

export function useDeleteVinculo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => colaboradorApi.deleteVinculo(id),
    onSuccess: async () => {
      await invalidateCollaboratorCache(queryClient);
      toast.success(messages.vinculo.sucesso.excluido);
    },
    onError: (error: any) => {
      toast.error(messages.vinculo.erro.excluir, {
        description: error.message,
      });
    },
  });
}
