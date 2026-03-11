import { ocorrenciaService } from "@/services/api/ocorrencia.service";
import { Ocorrencia } from "@/types/database";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateOcorrencia() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<Ocorrencia>) => ocorrenciaService.createOcorrencia(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ocorrencias"] });
            queryClient.invalidateQueries({ queryKey: ["financeiro-extrato"] });
            toast.success("Ocorrência registrada com sucesso!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Erro ao registrar ocorrência");
        },
    });
}

export function useUpdateOcorrencia() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Ocorrencia> }) =>
            ocorrenciaService.updateOcorrencia(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ocorrencias"] });
            queryClient.invalidateQueries({ queryKey: ["financeiro-extrato"] });
            toast.success("Ocorrência atualizada com sucesso!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Erro ao atualizar ocorrência");
        },
    });
}

export function useDeleteOcorrencia() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => ocorrenciaService.deleteOcorrencia(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ocorrencias"] });
            queryClient.invalidateQueries({ queryKey: ["financeiro-extrato"] });
            toast.success("Ocorrência removida com sucesso!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Erro ao remover ocorrência");
        },
    });
}

export function useCreateTipoOcorrencia() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => ocorrenciaService.createTipoOcorrencia(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tipos-ocorrencia"] });
            toast.success("Tipo de ocorrência criado com sucesso!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Erro ao criar tipo de ocorrência");
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
            toast.success("Tipo de ocorrência atualizado com sucesso!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Erro ao atualizar tipo de ocorrência");
        },
    });
}

export function useDeleteTipoOcorrencia() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => ocorrenciaService.deleteTipoOcorrencia(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tipos-ocorrencia"] });
            toast.success("Tipo de ocorrência removido com sucesso!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Erro ao remover tipo de ocorrência");
        },
    });
}
