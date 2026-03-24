import { pontoApi } from "@/services/api/ponto.api";
import { useQuery } from "@tanstack/react-query";
import { EspelhoPontoMensal } from "@/types/ponto-relatorio";

export function useTimeMirror(usuarioId: string | undefined, mes: number, ano: number) {
    return useQuery<EspelhoPontoMensal[]>({
        queryKey: ["time-mirror", usuarioId, mes, ano],
        queryFn: () => pontoApi.getEspelhoPonto(usuarioId!, mes, ano),
        enabled: !!usuarioId && !!mes && !!ano,
        staleTime: 0,
        refetchInterval: 30000, // 30 seconds
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    });
}
