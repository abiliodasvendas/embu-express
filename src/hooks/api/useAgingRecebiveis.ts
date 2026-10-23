import { useQuery } from "@tanstack/react-query";
import { faturamentoApi } from "@/services/api/faturamento.api";

export const AGING_RECEBIVEIS_KEYS = {
  all: ["aging-recebiveis"] as const,
  filtered: (mes?: number, ano?: number, empresaId?: number) =>
    [...AGING_RECEBIVEIS_KEYS.all, mes, ano, empresaId] as const,
};

export function useAgingRecebiveis(
  mes?: number,
  ano?: number,
  empresaId?: number,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: AGING_RECEBIVEIS_KEYS.filtered(mes, ano, empresaId),
    queryFn: () => faturamentoApi.getAgingRecebiveis({ mes, ano, empresa_id: empresaId }),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
}
