import { messages } from "@/constants/messages";
import { pontoApi } from "@/services/api/ponto.api";
import { RegistroPonto } from "@/types/database";
import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Invalida caches relacionados ao ponto para garantir que o espelho e o financeiro estejam sempre corretos.
 */
async function invalidatePontoCache(queryClient: QueryClient, colaboradorId?: string) {
  await queryClient.invalidateQueries({ queryKey: ["time-records"] });
  await queryClient.invalidateQueries({ queryKey: ["time-mirror"] });
  await queryClient.invalidateQueries({ queryKey: ["financeiro-extrato"] });

  if (colaboradorId) {
    await queryClient.invalidateQueries({ queryKey: ["time-mirror", colaboradorId] });
    await queryClient.invalidateQueries({ queryKey: ["financeiro-extrato", colaboradorId] });
  }
}

export function useUpdatePonto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RegistroPonto> }) =>
      pontoApi.updateRegistro(id, data),
    onSuccess: async (_data, variables) => {
      await invalidatePontoCache(queryClient, variables.data?.usuario_id);
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
    onSuccess: async (_data, variables) => {
      await invalidatePontoCache(queryClient, variables.usuario_id);
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
    onSuccess: async () => {
      await invalidatePontoCache(queryClient);
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
    onSuccess: async () => {
      await invalidatePontoCache(queryClient);
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
    onSuccess: async () => {
      await invalidatePontoCache(queryClient);
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
    onSuccess: async () => {
      await invalidatePontoCache(queryClient);
      toast.success(messages.ponto.sucesso.pausaFinalizada);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.response?.data?.message || error.message || messages.ponto.erro.finalizarPausa;
      toast.error(message);
    },
  });
}
