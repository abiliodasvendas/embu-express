import { pontoApi } from "@/services/api/ponto.api";
import { RegistroPonto } from "@/types/database";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdatePonto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RegistroPonto> }) =>
      pontoApi.updateRegistro(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-records"] });
      toast.success("Registro atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar registro.", {
        description: error.message || "Tente novamente mais tarde.",
      });
    },
  });
}

export function useCreatePonto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<RegistroPonto>) => pontoApi.createRegistro(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-records"] });
      toast.success("registro criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar registro.", {
        description: error.message || "Tente novamente mais tarde.",
      });
    },
  });
}

export function useDeletePonto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => pontoApi.deleteRegistro(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-records"] });
      toast.success("Registro excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir registro.", {
        description: error.message || "Tente novamente mais tarde.",
      });
    },
  });
}
