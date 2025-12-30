import { empresaApi } from "@/services/api/empresa.api";
import { useQuery } from "@tanstack/react-query";

const cleanFilters = (filters?: { searchTerm?: string; ativo?: string; includeId?: string }) => {
  if (!filters) return undefined;
  const cleaned = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== "")
  );
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
};

export function useEmpresas(filters?: { searchTerm?: string; ativo?: string; includeId?: string }, options?: { enabled?: boolean; staleTime?: number; refetchOnWindowFocus?: boolean; refetchOnMount?: boolean }) {
  const cleanedFilters = cleanFilters(filters);
  
  return useQuery({
    queryKey: ["empresas", cleanedFilters],
    queryFn: () => empresaApi.listEmpresas(cleanedFilters as any),
    staleTime: options?.staleTime ?? 1000 * 60 * 5, // 5 minutes default cache
    refetchOnMount: options?.refetchOnMount ?? true, // Explicitly true to avoid stale listing on nav
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
    enabled: options?.enabled,
  });
}

export function useEmpresa(id: number | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["empresas", id],
    queryFn: () => empresaApi.getEmpresa(id!),
    enabled: !!id && (options?.enabled ?? true),
  });
}
