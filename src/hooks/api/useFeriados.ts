import { messages } from "@/constants/messages";
import { feriadoApi } from "@/services/api/feriado.api";
import { Feriado } from "@/types/database";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FeriadoFormValues } from "@/schemas/feriadoSchema";
import { ApiError } from "@/types/api";

export function useFeriados(ano?: number) {
    return useQuery({
        queryKey: ["feriados", ano],
        queryFn: () => feriadoApi.listFeriados(ano),
    });
}

export function useCreateFeriado() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: FeriadoFormValues) => feriadoApi.createFeriado(data as { data: string; descricao: string }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feriados"] });
            toast.success(messages.feriado.sucesso.criado);
        },
        onError: (error: ApiError) => {
            toast.error(messages.feriado.erro.criar, {
                description: error.response?.data?.message || error.message,
            });
        },
    });
}

export function useDeleteFeriado() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => feriadoApi.deleteFeriado(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feriados"] });
            toast.success(messages.feriado.sucesso.excluido);
        },
        onError: (error: ApiError) => {
            toast.error(messages.feriado.erro.excluir, {
                description: error.response?.data?.message || error.message,
            });
        },
    });
}

export function useUpdateFeriado() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: { id: number } & FeriadoFormValues) => 
            feriadoApi.updateFeriado(id, data as { data: string; descricao: string }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feriados"] });
            toast.success(messages.feriado.sucesso.atualizado);
        },
        onError: (error: ApiError) => {
            toast.error(messages.feriado.erro.atualizar, {
                description: error.response?.data?.message || error.message,
            });
        },
    });
}
