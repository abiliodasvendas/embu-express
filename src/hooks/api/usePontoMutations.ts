import { messages } from "@/constants/messages";
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
      toast.success(messages.ponto.sucesso.atualizado);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.response?.data?.message || error.message || messages.erro.generico;
      toast.error(messages.ponto.erro.atualizar, {
        description: message,
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
      toast.success(messages.ponto.sucesso.criado);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.response?.data?.message || error.message || messages.erro.generico;
      toast.error(messages.ponto.erro.criar, {
        description: message,
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
      toast.success(messages.ponto.sucesso.excluido);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.response?.data?.message || error.message || messages.erro.generico;
      toast.error(messages.ponto.erro.excluir, {
        description: message,
      });
    },
  });
}

export function useTogglePonto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => pontoApi.toggle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-records"] });
      toast.success(messages.ponto.sucesso.registrado);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.response?.data?.message || error.message || messages.erro.generico;
      toast.error(messages.ponto.erro.registrar, {
        description: message,
      });
    },
  });
}

export function useIniciarPausa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pontoId, data }: { pontoId: number; data: any }) => 
      pontoApi.iniciarPausa(pontoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-records"] });
      toast.success(messages.ponto.sucesso.pausaIniciada);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.response?.data?.message || error.message || messages.ponto.erro.iniciarPausa;
      toast.error(message);
    },
  });
}

export function useFinalizarPausa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pausaId, data }: { pausaId: number; data: any }) => 
      pontoApi.finalizarPausa(pausaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-records"] });
      toast.success(messages.ponto.sucesso.pausaFinalizada);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.response?.data?.message || error.message || messages.ponto.erro.finalizarPausa;
      toast.error(message);
    },
  });
}
