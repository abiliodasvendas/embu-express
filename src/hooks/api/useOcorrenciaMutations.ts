import { messages } from "@/constants/messages";
import { ocorrenciaService } from "@/services/api/ocorrencia.service";
import { Ocorrencia } from "@/types/database";
import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

async function invalidateOccurrenceCache(queryClient: QueryClient, colaboradorId?: string) {
    await queryClient.removeQueries({ queryKey: ["ocorrencias"] });
    await queryClient.invalidateQueries({ queryKey: ["ocorrencias"] });

    if (colaboradorId) {
        await queryClient.removeQueries({ queryKey: ["collaborator", colaboradorId] });
        await queryClient.invalidateQueries({ queryKey: ["collaborator", colaboradorId] });

        await queryClient.invalidateQueries({ queryKey: ["financeiro-extrato", colaboradorId] });
        await queryClient.invalidateQueries({ queryKey: ["time-mirror", colaboradorId] });
    }

    queryClient.invalidateQueries({ queryKey: ["collaborators"] });
    queryClient.invalidateQueries({ queryKey: ["financeiro-extrato"] });
    queryClient.invalidateQueries({ queryKey: ["time-mirror"] });
}

export function useCreateOcorrencia() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<Ocorrencia>) => ocorrenciaService.createOcorrencia(data),
        onSuccess: async (_data, variables) => {
            await invalidateOccurrenceCache(queryClient, variables.colaborador_id);
            toast.success(messages.ocorrencia.sucesso.criada);
        },
        onError: (error: any) => {
            toast.error(messages.ocorrencia.erro.criar, {
                description: error.response?.data?.error || error.message
            });
        },
    });
}

export function useUpdateOcorrencia() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Ocorrencia> }) =>
            ocorrenciaService.updateOcorrencia(id, data),
        onSuccess: async (_data, variables) => {
            await invalidateOccurrenceCache(queryClient, variables.data?.colaborador_id);
            toast.success(messages.ocorrencia.sucesso.atualizada);
        },
        onError: (error: any) => {
            toast.error(messages.ocorrencia.erro.atualizar, {
                description: error.response?.data?.error || error.message
            });
        },
    });
}

export function useDeleteOcorrencia() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => ocorrenciaService.deleteOcorrencia(id),
        onSuccess: async () => {
            await invalidateOccurrenceCache(queryClient);
            toast.success(messages.ocorrencia.sucesso.excluida);
        },
        onError: (error: any) => {
            toast.error(messages.ocorrencia.erro.excluir, {
                description: error.response?.data?.error || error.message
            });
        },
    });
}

export function useCreateTipoOcorrencia() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => ocorrenciaService.createTipoOcorrencia(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tipos-ocorrencia"] });
            toast.success(messages.ocorrencia.sucesso.tipo.criado);
        },
        onError: (error: any) => {
            toast.error(messages.ocorrencia.erro.tipo.criar, {
                description: error.response?.data?.error || error.message
            });
        },
    });
}

export function useUpdateTipoOcorrencia() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            ocorrenciaService.updateTipoOcorrencia(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tipos-ocorrencia"] });
            toast.success(messages.ocorrencia.sucesso.tipo.atualizado);
        },
        onError: (error: any) => {
            toast.error(messages.ocorrencia.erro.tipo.atualizar, {
                description: error.response?.data?.error || error.message
            });
        },
    });
}

export function useDeleteTipoOcorrencia() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => ocorrenciaService.deleteTipoOcorrencia(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tipos-ocorrencia"] });
            toast.success(messages.ocorrencia.sucesso.tipo.excluido);
        },
        onError: (error: any) => {
            toast.error(messages.ocorrencia.erro.tipo.excluir, {
                description: error.response?.data?.error || error.message
            });
        },
    });
}
