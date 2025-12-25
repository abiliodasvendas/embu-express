import { messages } from "@/constants/messages";
import { clienteApi } from "@/services/api/cliente.api";
import { Client } from "@/types/database";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useClients(filters?: { searchTerm?: string; ativo?: string }) {
  return useQuery({
    queryKey: ["clients", filters],
    queryFn: () => clienteApi.listClientes(filters),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Client, "id" | "created_at" | "updated_at"> & { silent?: boolean }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { silent, ...clientData } = data;
      return clienteApi.createCliente(clientData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      if (!variables.silent) {
        toast.success(messages.cliente.sucesso.criado);
      }
    },
    onError: (error: any) => {
      toast.error(messages.cliente.erro.criar, { description: error.message });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Client> & { id: number }) => 
      clienteApi.updateCliente(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success(messages.cliente.sucesso.atualizado);
    },
    onError: (error: any) => {
      toast.error(messages.cliente.erro.atualizar, { description: error.message });
    },
  });
}

export function useToggleClientStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ativo }: { id: number; ativo: boolean }) => 
      clienteApi.updateCliente(id, { ativo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success(messages.cliente.sucesso.status);
    },
    onError: (error: any) => {
      toast.error(messages.cliente.erro.toggleStatus, { description: error.message });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => clienteApi.deleteCliente(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success(messages.cliente.sucesso.excluido);
    },
    onError: (error: any) => {
      toast.error(messages.cliente.erro.excluir, { description: error.message });
    },
  });
}
