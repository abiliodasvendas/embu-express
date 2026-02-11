import { colaboradorApi } from "@/services/api/colaborador.api";
import { useQuery } from "@tanstack/react-query";

export function useCollaborators(filters?: { searchTerm?: string; status?: string; perfil_id?: string; cliente_id?: string; empresa_id?: string }) {
  return useQuery({
    queryKey: ["collaborators", filters],
    queryFn: () => colaboradorApi.listColaboradores(filters),
    // placeholderData: keepPreviousData, // Removed to show skeleton on filter change
    refetchOnMount: true, // Ensure we fetch fresh data on navigation if invalidated
  });
}

export function useCollaborator(id?: string) {
  return useQuery({
    queryKey: ["collaborator", id],
    queryFn: () => colaboradorApi.getColaborador(id!),
    enabled: !!id,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ["perfis"],
    queryFn: () => colaboradorApi.listPerfis(),
  });
}

export function useActiveCollaborators(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["active-collaborators-filter"],
    queryFn: () => colaboradorApi.listColaboradores({ ativo: "true" }),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: options?.enabled,
  });
}
