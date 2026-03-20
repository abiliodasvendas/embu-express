import { messages } from "@/constants/messages";
import { collaboratorSchema, CollaboratorFormData } from "@/schemas/collaboratorSchema";
import { colaboradorApi } from "@/services/api/colaborador.api";
import { formatDateToISO } from "@/utils/date";
import { toast } from "@/utils/notifications/toast";
import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import { Usuario, ColaboradorCliente } from "@/types/database";

import { ApiError } from "@/types/api";

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

interface CreateCollaboratorVariables extends CollaboratorFormData {
  silent?: boolean;
}

export function useCreateCollaborator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCollaboratorVariables) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { silent, isMotoboyOrFiscal, ...collaboratorData } = data;

      const payload = {
        ...collaboratorData,
        data_nascimento: formatDateToISO(collaboratorData.data_nascimento),
        cnh_vencimento: formatDateToISO(collaboratorData.cnh_vencimento),
        // Certificar que perfil_id é number
        perfil_id: typeof collaboratorData.perfil_id === 'string' ? parseInt(collaboratorData.perfil_id) : (collaboratorData.perfil_id as number)
      };

      return colaboradorApi.createColaborador(payload as Partial<Usuario>);
    },
    onSuccess: async (_, variables) => {
      await invalidateCollaboratorCache(queryClient);
      if (!variables.silent) {
        toast.success(messages.colaborador.sucesso.criado);
      }
    },
    onError: (error: Error, variables) => {
      if (!variables.silent) {
        toast.error(messages.colaborador.erro.criar, {
          description: error.message,
        });
      }
    },
  });
}

interface UpdateCollaboratorVariables extends CollaboratorFormData {
  id: string;
  silent?: boolean;
}

export function useUpdateCollaborator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isMotoboyOrFiscal, silent, ...data }: UpdateCollaboratorVariables) => {
      const payload = {
        ...data,
        data_nascimento: formatDateToISO(data.data_nascimento),
        cnh_vencimento: formatDateToISO(data.cnh_vencimento),
        // Certificar que perfil_id é number
        perfil_id: typeof data.perfil_id === 'string' ? parseInt(data.perfil_id) : (data.perfil_id as number)
      };
      return colaboradorApi.updateColaborador(id, payload as Partial<Usuario>);
    },
    onSuccess: async (_, variables) => {
      await invalidateCollaboratorCache(queryClient, variables.id);

      if (!variables.silent) {
        toast.success(messages.colaborador.sucesso.atualizado);
      }
    },
    onError: (error: Error, variables) => {
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
    onError: (error: ApiError) => {
      toast.error(messages.colaborador.erro.toggleStatus, {
        description: error.response?.data?.error || error.message,
      });
    },
  });
}

export function useResetCollaboratorPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => colaboradorApi.resetPassword(id),
    onSuccess: async (_, id) => {
      await invalidateCollaboratorCache(queryClient, id);
      toast.success("Senha resetada com sucesso para o padrão");
    },
    onError: (error: ApiError) => {
      toast.error("Erro ao resetar senha", {
        description: error.response?.data?.error || error.message,
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
    onError: (error: ApiError) => {
      toast.error(messages.colaborador.erro.excluir, {
        description: error.response?.data?.error || error.message,
      });
    },
  });
}

export function useCreateVinculo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ColaboradorCliente>) => colaboradorApi.createVinculo(data),
    onSuccess: async (_, variables) => {
      await invalidateCollaboratorCache(queryClient, variables.colaborador_id);
      toast.success(messages.vinculo.sucesso.criado);
    },
    onError: (error: ApiError) => {
      toast.error(messages.vinculo.erro.criar, {
        description: error.response?.data?.error || error.message,
      });
    },
  });
}

export function useUpdateVinculo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, silent: _, ...data }: { id: number; silent?: boolean } & Partial<ColaboradorCliente>) => colaboradorApi.updateVinculo(id, data),
    onSuccess: async (_, variables) => {
      await invalidateCollaboratorCache(queryClient, variables.colaborador_id);
      toast.success(messages.vinculo.sucesso.atualizado);
    },
    onError: (error: ApiError) => {
      toast.error(messages.vinculo.erro.atualizar, {
        description: error.response?.data?.error || error.message,
      });
    },
  });
}

export function useDeleteVinculo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number; colaboradorId: string }) => colaboradorApi.deleteVinculo(id),
    onSuccess: async (_, variables) => {
      await invalidateCollaboratorCache(queryClient, variables.colaboradorId);
      toast.success(messages.vinculo.sucesso.excluido);
    },
    onError: (error: ApiError) => {
      toast.error(messages.vinculo.erro.excluir, {
        description: error.response?.data?.error || error.message,
      });
    },
  });
}
