import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api/client";
import { useSession } from "./useSession";
import { useProfile } from "./useProfile";
import { useMemo } from "react";
import { getLocalDate } from "@/utils/date";
import { useTogglePonto, useIniciarPausa, useFinalizarPausa } from "../api/usePontoMutations";

export function useRegistrarPontoBusiness() {
    const { user } = useSession();
    const { profile: userProfile } = useProfile(user?.id);

    const togglePonto = useTogglePonto();
    const iniciarPausa = useIniciarPausa();
    const finalizarPausa = useFinalizarPausa();

    // Fetch Today's Point Data
    const { data: pontoHoje, isLoading: isLoadingPonto, refetch } = useQuery({
        queryKey: ['ponto-hoje-smart', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const res = await apiClient.get('/pontos/hoje', {
                params: { usuarioId: user.id }
            });
            return res.data;
        },
        enabled: !!user?.id,
        refetchInterval: 60 * 1000 // Refresh every minute
    });

    const activeLinks = useMemo(() => {
        return userProfile?.links?.filter((l: any) => {
            if (!l.data_fim) return true;
            const today = getLocalDate();
            return l.data_fim >= today;
        }) || [];
    }, [userProfile]);

    const hasShifts = activeLinks.length > 0;

    const journeyMetrics = useMemo(() => {
        if (!pontoHoje) return { count: 0, totalMs: 0, kmTrabalho: 0, kmPausa: 0 };

        const allPausas = pontoHoje.pausas || [];
        const finishedPausas = allPausas.filter((p: any) => p.fim_hora) || [];

        const totalPausasMs = finishedPausas.reduce((acc: number, p: any) => {
            const s = new Date(p.inicio_hora).getTime();
            const e = new Date(p.fim_hora).getTime();
            return acc + (e - s);
        }, 0);

        const kmTrabalho = allPausas.reduce((acc: number, p: any) => acc + (Number(p.distancia_trabalho) || 0), 0) + (Number(pontoHoje.saida_distancia_trabalho) || 0);
        const kmPausa = allPausas.reduce((acc: number, p: any) => acc + (Number(p.distancia_pausa) || 0), 0);

        return {
            count: allPausas.length,
            totalMs: totalPausasMs,
            kmTrabalho,
            kmPausa
        };
    }, [pontoHoje]);

    return {
        user,
        userProfile,
        pontoHoje,
        isLoadingPonto,
        activeLinks,
        hasShifts,
        journeyMetrics,
        refetch,
        togglePonto,
        iniciarPausa,
        finalizarPausa
    };
}
