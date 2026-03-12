import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ocorrenciaService } from "@/services/api/ocorrencia.service";
import { TipoOcorrencia } from "@/types/database";

export function useOcorrencias(filtros?: {
    usuario_id?: string;
    colaborador_cliente_id?: number;
    data_inicio?: string;
    data_fim?: string;
    order?: string;
    ascending?: boolean;
}) {
    return useQuery({
        queryKey: ["ocorrencias", filtros],
        queryFn: () => ocorrenciaService.listOcorrencias(filtros),
    });
}

export function useTiposOcorrencia(options?: Omit<UseQueryOptions<TipoOcorrencia[]>, 'queryKey' | 'queryFn'>) {
    return useQuery({
        queryKey: ["tipos-ocorrencia"],
        queryFn: () => ocorrenciaService.listTiposOcorrencia(),
        ...options
    });
}
