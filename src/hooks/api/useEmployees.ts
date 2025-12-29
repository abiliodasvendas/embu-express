import { funcionarioApi } from "@/services/api/funcionario.api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useEmployees(filters?: { searchTerm?: string; ativo?: string; perfil_id?: string }) {
  return useQuery({
    queryKey: ["employees", filters],
    queryFn: () => funcionarioApi.listFuncionarios(filters),
    placeholderData: keepPreviousData,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ["perfis"],
    queryFn: () => funcionarioApi.listPerfis(),
  });
}

export function useActiveEmployees(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["active-employees-filter"],
    queryFn: () => funcionarioApi.listFuncionarios({ ativo: "true" }),
    staleTime: 1000 * 60 * 5, // 5 min cache
    refetchOnMount: true, // Check for invalidation on mount
    enabled: options?.enabled,
  });
}
