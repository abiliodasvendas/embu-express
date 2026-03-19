import { messages } from "@/constants/messages";
import { ClientFormData } from "@/schemas/clientSchema";
import { clienteApi } from "@/services/api/cliente.api";
import { Client } from "@/types/database";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { onlyNumbers } from "@/utils/string";

import { ApiError } from "@/types/api";

interface CreateClientVariables extends ClientFormData {
  silent?: boolean;
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClientVariables) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { silent, ...clientData } = data;
      const payload = {
        ...clientData,
        cnpj: onlyNumbers(clientData.cnpj),
        cep: onlyNumbers(clientData.cep),
      };
      return clienteApi.createCliente(payload as Partial<Client>);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      if (!variables.silent) {
        toast.success(messages.cliente.sucesso.criado);
      }
    },
    onError: (error: ApiError, variables) => {
      if (!variables.silent) {
        toast.error(messages.cliente.erro.criar, { description: error.response?.data?.error || error.message });
      }
    },
  });
}

interface UpdateClientVariables extends ClientFormData {
  id: number;
  silent?: boolean;
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, silent, ...data }: UpdateClientVariables) => {
      const payload = {
        ...data,
        cnpj: onlyNumbers(data.cnpj),
        cep: onlyNumbers(data.cep),
      };
      return clienteApi.updateCliente(id, payload as Partial<Client>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["collaborators"] });
      queryClient.invalidateQueries({ queryKey: ["active-collaborators-filter"] });
      queryClient.invalidateQueries({ queryKey: ["active-collaborators-combo"] });
      toast.success(messages.cliente.sucesso.atualizado);
    },
    onError: (error: ApiError, variables) => {
      if (!variables.silent) {
        toast.error(messages.cliente.erro.atualizar, { description: error.response?.data?.error || error.message });
      }
    },
  });
}

export function useToggleClientStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ativo }: { id: number; ativo: boolean }) =>
      clienteApi.toggleStatus(id, ativo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["collaborators"] });
      queryClient.invalidateQueries({ queryKey: ["active-collaborators-filter"] });
      queryClient.invalidateQueries({ queryKey: ["active-collaborators-combo"] });
      toast.success(messages.cliente.sucesso.status);
    },
    onError: (error: ApiError) => {
      toast.error(messages.cliente.erro.toggleStatus, { description: error.response?.data?.error || error.message });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => clienteApi.deleteCliente(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });

      // Force reset to ensure fresh fetch
      queryClient.resetQueries({ queryKey: ["collaborators"] });
      queryClient.resetQueries({ queryKey: ["active-collaborators-filter"] });
      queryClient.resetQueries({ queryKey: ["active-collaborators-combo"] });
      toast.success(messages.cliente.sucesso.excluido);
    },
    onError: (error: ApiError) => {
      toast.error(messages.cliente.erro.excluir, { description: error.response?.data?.error || error.message });
    },
  });
}
