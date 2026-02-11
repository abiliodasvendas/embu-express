import { messages } from "@/constants/messages";
import { empresaApi } from "@/services/api/empresa.api";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateEmpresa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any & { silent?: boolean }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { silent, ...empresaData } = data;
      return empresaApi.createEmpresa(empresaData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
      if (!variables.silent) {
        toast.success(messages.empresa.sucesso.criada);
      }
    },
    onError: (error: any) => {
      toast.error(messages.empresa.erro.criar, {
        description: error.userMessage || error.message,
      });
    },
  });
}

export function useUpdateEmpresa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => empresaApi.updateEmpresa(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
      // Invalidate collaborators in case we show company info there
      queryClient.invalidateQueries({ queryKey: ["collaborators"] }); 
      toast.success(messages.empresa.sucesso.atualizada);
    },
    onError: (error: any) => {
      toast.error(messages.empresa.erro.atualizar, {
        description: error.userMessage || error.message,
      });
    },
  });
}

export function useToggleEmpresaStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ativo }: { id: number; ativo: boolean }) => 
        empresaApi.toggleStatus(id, ativo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
      toast.success(messages.empresa.sucesso.status);
    },
    onError: (error: any) => {
      toast.error(messages.empresa.erro.status, {
        description: error.userMessage || error.message,
      });
    },
  });
}

export function useDeleteEmpresa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => empresaApi.deleteEmpresa(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
      // Invalidate collaborators as they might be unlinked
      queryClient.invalidateQueries({ queryKey: ["collaborators"] });
      toast.success(messages.empresa.sucesso.excluida);
    },
    onError: (error: any) => {
      toast.error(messages.empresa.erro.excluir, {
        description: error.userMessage || error.message,
      });
    },
  });
}
