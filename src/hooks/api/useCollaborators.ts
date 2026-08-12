import { colaboradorApi } from "@/services/api/colaborador.api";
import { useQuery } from "@tanstack/react-query";

export function useCollaborators(
  filters?: {
    searchTerm?: string;
    status?: string;
    perfil_id?: string;
    cliente_id?: string;
    empresa_id?: string;
    page?: number;
    pageSize?: number;
    all?: boolean;
  },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["collaborators", filters],
    queryFn: () => colaboradorApi.listColaboradores(filters),
    enabled: options?.enabled ?? true,
    refetchOnMount: true,
  });
}

export function useCollaborator(id?: string) {
  return useQuery({
    queryKey: ["collaborator", id],
    queryFn: () => colaboradorApi.getColaborador(id!),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useRoles(isPublic: boolean = false) {
  return useQuery({
    queryKey: ["perfis", isPublic],
    queryFn: () => isPublic ? colaboradorApi.listPublicPerfis() : colaboradorApi.listPerfis(),
  });
}

export function useActiveCollaborators(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["active-collaborators-filter"],
    queryFn: async () => {
      const res = await colaboradorApi.listColaboradores({ status: "ATIVO", all: true });
      return Array.isArray(res) ? res : res.data;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: options?.enabled,
  });
}
