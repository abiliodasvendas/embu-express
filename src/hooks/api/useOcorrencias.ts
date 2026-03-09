import { useQuery } from "@tanstack/react-query";
import { ocorrenciaService } from "@/services/api/ocorrencia.service";

export function useOcorrencias(filtros?: {
    usuario_id?: string;
    colaborador_cliente_id?: number;
    data_inicio?: string;
    data_fim?: string;
}) {
    return useQuery({
        queryKey: ["ocorrencias", filtros],
        queryFn: () => ocorrenciaService.listOcorrencias(filtros),
    });
}

export function useTiposOcorrencia() {
    return useQuery({
        queryKey: ["tipos-ocorrencia"],
        queryFn: () => ocorrenciaService.listTiposOcorrencia(),
    });
}
