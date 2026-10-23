import { dreApi, DreConsolidado } from "@/services/api/dre.api";
import { useQuery } from "@tanstack/react-query";

export function useDRE(
  mes: number,
  ano: number,
  empresaId?: number,
  tipoVisao: "realizado" | "projetado" = "projetado"
) {
  return useQuery<DreConsolidado>({
    queryKey: ["dre", mes, ano, empresaId, tipoVisao],
    queryFn: () => dreApi.getDRE(mes, ano, empresaId, tipoVisao),
    enabled: !!mes && !!ano,
    staleTime: 30000,
  });
}
