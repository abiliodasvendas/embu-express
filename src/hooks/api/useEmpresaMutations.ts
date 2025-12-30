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
        toast.success("Empresa criada com sucesso!");
      }
    },
    onError: (error: any) => {
      toast.error("Erro ao criar empresa", {
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
      toast.success("Empresa atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar empresa", {
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
      toast.success("Status atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao alterar status", {
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
      toast.success("Empresa excluída com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir empresa", {
        description: error.userMessage || error.message,
      });
    },
  });
}
