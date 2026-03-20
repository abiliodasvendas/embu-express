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

export function useUnidade(id?: number | string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["unidade", id],
    queryFn: () => {
      if (!id) return null;
      return unidadeApi.getUnidade(Number(id));
    },
    enabled: !!id && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
