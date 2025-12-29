import { clienteApi } from "@/services/api/cliente.api";
import { useQuery } from "@tanstack/react-query";

const cleanFilters = (filters?: { searchTerm?: string; ativo?: string; includeId?: string }) => {
  if (!filters) return undefined;
  const cleaned = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== "")
  );
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
};

export function useClients(filters?: { searchTerm?: string; ativo?: string; includeId?: string }, options?: { enabled?: boolean; staleTime?: number; refetchOnWindowFocus?: boolean; refetchOnMount?: boolean }) {
  const cleanedFilters = cleanFilters(filters);
  
  return useQuery({
    queryKey: ["clients", cleanedFilters],
    queryFn: () => clienteApi.listClientes(cleanedFilters as any),
    staleTime: options?.staleTime ?? 1000 * 60 * 5, // 5 minutes default cache
    refetchOnMount: options?.refetchOnMount,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
    enabled: options?.enabled,
  });
}
