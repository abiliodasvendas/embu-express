import { dreApi, DreConsolidado } from "@/services/api/dre.api";
import { useQuery } from "@tanstack/react-query";

export function useDRE(mes: number, ano: number, empresaId?: number) {
  return useQuery<DreConsolidado>({
    queryKey: ["dre", mes, ano, empresaId],
    queryFn: () => dreApi.getDRE(mes, ano, empresaId),
    enabled: !!mes && !!ano,
    staleTime: 30000,
  });
}
