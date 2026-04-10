import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api/client";
import { useSession } from "./useSession";
import { useProfile } from "./useProfile";
import { useMemo } from "react";
import { getLocalDate } from "@/utils/date";
import { useTogglePonto, useIniciarPausa, useFinalizarPausa } from "../api/usePontoMutations";
import { RegistroPonto, ColaboradorCliente, Pausa } from "@/types/database";

export function useRegistrarPontoBusiness() {
    const { user } = useSession();
    const { profile: userProfile, isLoading: isLoadingProfile, refreshProfile } = useProfile(user?.id);

    const togglePonto = useTogglePonto();
    const iniciarPausa = useIniciarPausa();
    const finalizarPausa = useFinalizarPausa();

    // Fetch Today's Point Data
    const { data: pontoHoje, isLoading: isLoadingPonto, refetch: refetchPonto } = useQuery({
        queryKey: ['ponto-hoje-smart', user?.id],
        queryFn: async (): Promise<RegistroPonto | null> => {
            if (!user?.id) return null;
            const res = await apiClient.get('/pontos/hoje', {
                params: { usuarioId: user.id }
            });
            return res.data;
        },
        enabled: !!user?.id,
        refetchInterval: 60 * 1000 // Refresh every minute
    });

    const refetch = async () => {
        await Promise.all([
            refetchPonto(),
            refreshProfile()
        ]);
    };

    const activeLinks = useMemo(() => {
        return (userProfile?.links as ColaboradorCliente[] | undefined)?.filter((l: ColaboradorCliente) => {
            if (!l.data_fim) return true;
            const today = getLocalDate();
            return l.data_fim >= today;
        }) || [];
    }, [userProfile]);

    const hasShifts = activeLinks.length > 0;

    return {
        user,
        userProfile,
        isLoadingProfile,
        pontoHoje,
        isLoadingPonto,
        activeLinks,
        hasShifts,
        refetch,
        togglePonto,
        iniciarPausa,
        finalizarPausa
    };
}
