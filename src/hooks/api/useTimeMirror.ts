import { pontoApi } from "@/services/api/ponto.api";
import { useQuery } from "@tanstack/react-query";

export function useTimeMirror(usuarioId: string | undefined, mes: number, ano: number) {
    return useQuery({
        queryKey: ["time-mirror", usuarioId, mes, ano],
        queryFn: () => pontoApi.getRelatorioMensal(usuarioId!, mes, ano),
        enabled: !!usuarioId && !!mes && !!ano,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
