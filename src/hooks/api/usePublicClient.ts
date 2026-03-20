import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api/client";
import { RegistroPonto, Usuario, Client } from "@/types/database";
import { EspelhoPontoMensal } from "@/types/ponto-relatorio";

export function usePublicClient(uuid?: string) {
    return useQuery({
        queryKey: ["public-client", uuid],
        queryFn: async (): Promise<Partial<Client> | null> => {
            if (!uuid) return null;
            const { data } = await api.get(`/public/c/${uuid}`);
            return data;
        },
        enabled: !!uuid,
        retry: false
    });
}

export function usePublicCollaborators(uuid?: string) {
    return useQuery({
        queryKey: ["public-collaborators", uuid],
        queryFn: async (): Promise<Partial<Usuario>[]> => {
            if (!uuid) return [];
            const { data } = await api.get(`/public/c/${uuid}/colaboradores`);
            return data;
        },
        enabled: !!uuid
    });
}

export function usePublicTimeTracking(uuid?: string, date?: string) {
    return useQuery({
        queryKey: ["public-time-tracking", uuid, date],
        queryFn: async (): Promise<RegistroPonto[]> => {
            if (!uuid || !date) return [];
            const { data } = await api.get(`/public/c/${uuid}/controle-ponto`, {
                params: { date }
            });
            return data;
        },
        enabled: !!uuid && !!date
    });
}

export function usePublicTimeMirror(uuid?: string, usuarioId?: string, mes?: number, ano?: number) {
    return useQuery({
        queryKey: ["public-time-mirror", uuid, usuarioId, mes, ano],
        queryFn: async (): Promise<EspelhoPontoMensal[]> => {
            if (!uuid || !usuarioId || !mes || !ano) return [];
            const { data } = await api.get(`/public/c/${uuid}/espelho-ponto/${usuarioId}`, {
                params: { mes, ano }
            });
            return data;
        },
        enabled: !!uuid && !!usuarioId && !!mes && !!ano
    });
}
