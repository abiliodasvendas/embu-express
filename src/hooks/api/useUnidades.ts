import { unidadeApi } from "@/services/api/unidade.api";
import { useQuery } from "@tanstack/react-query";

export function useUnidades(clienteId?: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["unidades", clienteId],
    queryFn: () => {
      if (!clienteId) return [];
      return unidadeApi.listUnidadesByCliente(clienteId);
    },
    enabled: !!clienteId && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
