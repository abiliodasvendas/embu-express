import { clienteApi } from "@/services/api/cliente.api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const cleanFilters = (filters?: { searchTerm?: string; ativo?: string; includeId?: string }) => {
  if (!filters) return undefined;
  const cleaned = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== "")
  );
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
};

export function useClients(
  filters?: { searchTerm?: string; ativo?: string; includeId?: string },
  options?: { enabled?: boolean; staleTime?: number; refetchOnWindowFocus?: boolean; refetchOnMount?: boolean }
) {
  const cleanedFilters = cleanFilters(filters);

  return useQuery({
    queryKey: ["clients", cleanedFilters],
    queryFn: () => clienteApi.listClientes(cleanedFilters as any),
    placeholderData: keepPreviousData,
    staleTime: options?.staleTime ?? 1000 * 60 * 5,
    refetchOnMount: options?.refetchOnMount ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
    enabled: options?.enabled,
  });
}
