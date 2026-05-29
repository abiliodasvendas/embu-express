import { pontoApi } from "@/services/api/ponto.api";
import { useQuery } from "@tanstack/react-query";

export function useCollaboratorMap(usuarioId: string | undefined, mes: number, ano: number) {
    return useQuery<any[]>({
        queryKey: ["collaborator-map", usuarioId, mes, ano],
        queryFn: () => pontoApi.getGeolocalizacaoMensal(usuarioId!, mes, ano),
        enabled: !!usuarioId && !!mes && !!ano,
        staleTime: 5 * 60 * 1000,
    });
}
