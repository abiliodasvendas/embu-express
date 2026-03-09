import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ocorrenciaService } from "@/services/api/ocorrencia.service";
import { Ocorrencia } from "@/types/database";
import { toast } from "sonner";

export function useCreateOcorrencia() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<Ocorrencia>) => ocorrenciaService.createOcorrencia(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ocorrencias"] });
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
            toast.success("Ocorrência removida com sucesso!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Erro ao remover ocorrência");
        },
    });
}
