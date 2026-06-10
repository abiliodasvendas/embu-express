import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api/client";

// Tipos
export interface Convenio {
    id: string;
    nome: string;
    ativo: boolean;
    token: string;
    created_at: string;
}

export interface LancamentoConvenio {
    id: string;
    convenio_id: string;
    colaborador_id: string | null;
    data_lancamento: string;
    valor: number;
    descricao?: string;
    moto_embu: boolean;
    created_at: string;
    updated_at?: string;
    colaborador?: { id: string; nome_completo: string; cpf?: string };
}

// ---------------------------------------------
// HOOKS ADMIN
// ---------------------------------------------

export function useConvenios() {
    return useQuery({
        queryKey: ["convenios"],
        queryFn: async () => {
            const { data } = await api.get<Convenio[]>("/convenios");
            return data;
        },
        refetchOnMount: true
    });
}

export function useConvenio(id: string) {
    return useQuery({
        queryKey: ["convenio", id],
        queryFn: async () => {
            const { data } = await api.get<Convenio>(`/convenios/${id}`);
            return data;
        },
        enabled: !!id,
        refetchOnMount: true
    });
}

export function useConvenioLancamentos(id: string, ano: number, mes: number) {
    return useQuery({
        queryKey: ["convenio_lancamentos", id, ano, mes],
        queryFn: async () => {
            const { data } = await api.get<LancamentoConvenio[]>(`/convenios/${id}/lancamentos`, {
                params: { ano, mes }
            });
            return data;
        },
        enabled: !!id,
        refetchOnMount: true
    });
}

export function useCreateConvenio() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { nome: string; ativo?: boolean }) => {
            const { data } = await api.post<Convenio>("/convenios", payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["convenios"] });
        }
    });
}

export function useUpdateConvenio() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...payload }: { id: string; nome?: string; ativo?: boolean }) => {
            const { data } = await api.put<Convenio>(`/convenios/${id}`, payload);
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["convenios"] });
            if (variables?.id) {
                queryClient.invalidateQueries({ queryKey: ["convenio", variables.id] });
            }
            if (data?.token) {
                queryClient.invalidateQueries({ queryKey: ["public_convenio", data.token] });
            }
        }
    });
}

export function useDeleteConvenio() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/convenios/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["convenios"] });
        }
    });
}

// ---------------------------------------------
// HOOKS PUBLIC (PORTAL DO CONVÊNIO)
// ---------------------------------------------

export function usePublicConvenio(token: string) {
    return useQuery({
        queryKey: ["public_convenio", token],
        queryFn: async () => {
            const { data } = await api.get<Convenio>(`/convenios/public/${token}`);
            return data;
        },
        enabled: !!token,
        retry: false,
        refetchOnMount: true
    });
}

export function usePublicCollaborators(token: string) {
    return useQuery({
        queryKey: ["public_collaborators", token],
        queryFn: async () => {
            const { data } = await api.get<{ id: string; nome_completo: string }[]>(`/convenios/public/${token}/colaboradores`);
            return data;
        },
        enabled: !!token
    });
}

export function usePublicLancamentosMes(token: string, ano: number, mes: number) {
    return useQuery({
        queryKey: ["public_lancamentos", token, ano, mes],
        queryFn: async () => {
            const { data } = await api.get<LancamentoConvenio[]>(`/convenios/public/${token}/lancamentos`, {
                params: { ano, mes }
            });
            return data;
        },
        enabled: !!token,
        refetchOnMount: true
    });
}

export function useCreatePublicLancamento() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ token, payload }: { token: string; payload: any }) => {
            const { data } = await api.post<LancamentoConvenio>(`/convenios/public/${token}/lancamentos`, payload);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["public_lancamentos", variables.token] });
        }
    });
}

export function useUpdatePublicLancamento() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ token, id, payload }: { token: string; id: string; payload: any }) => {
            const { data } = await api.put<LancamentoConvenio>(`/convenios/public/${token}/lancamentos/${id}`, payload);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["public_lancamentos", variables.token] });
        }
    });
}

export function useDeletePublicLancamento() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ token, id }: { token: string; id: string }) => {
            await api.delete(`/convenios/public/${token}/lancamentos/${id}`);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["public_lancamentos", variables.token] });
        }
    });
}

export function useCreateAdminLancamento() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ convenioId, payload }: { convenioId: string; payload: any }) => {
            const { data } = await api.post<LancamentoConvenio>(`/convenios/${convenioId}/lancamentos`, payload);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["convenio_lancamentos", variables.convenioId] });
        }
    });
}

export function useUpdateAdminLancamento() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ convenioId, id, payload }: { convenioId: string; id: string; payload: any }) => {
            const { data } = await api.put<LancamentoConvenio>(`/convenios/${convenioId}/lancamentos/${id}`, payload);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["convenio_lancamentos", variables.convenioId] });
        }
    });
}

export function useDeleteAdminLancamento() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ convenioId, id }: { convenioId: string; id: string }) => {
            await api.delete(`/convenios/${convenioId}/lancamentos/${id}`);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["convenio_lancamentos", variables.convenioId] });
        }
    });
}
