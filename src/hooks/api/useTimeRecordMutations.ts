import { messages } from "@/constants/messages";
import { apiClient } from "@/services/api/client";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateTimeRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post("/pontos", data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-records"] });
      toast.success(messages.ponto.sucesso.registrado);
    },
    onError: (error: any) => {
      toast.error(messages.ponto.erro.registrar, {
        description: error.message,
      });
    },
  });
}

export function useUpdateTimeRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiClient.put(`/pontos/${id}`, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-records"] });
      toast.success(messages.ponto.sucesso.atualizado);
    },
    onError: (error: any) => {
      toast.error(messages.ponto.erro.atualizar, {
        description: error.message,
      });
    },
  });
}

export function useDeleteTimeRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/pontos/${id}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-records"] });
      toast.success(messages.ponto.sucesso.excluido);
    },
    onError: (error: any) => {
      toast.error(messages.ponto.erro.excluir, {
        description: error.message,
      });
    },
  });
}
