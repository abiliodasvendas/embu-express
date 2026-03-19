import { colaboradorApi } from "@/services/api/colaborador.api";
import { sessionManager } from "@/services/sessionManager";
import { Perfil, Usuario } from "@/types/database";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSession } from "./useSession";
import { ApiError } from "@/types/api";

export type ProfileWithRole = Usuario & {
  perfil?: Perfil;
};

export async function fetchProfile(uid: string): Promise<ProfileWithRole | null> {
  try {
    const data = await colaboradorApi.getColaborador(uid);
    return data as unknown as ProfileWithRole;
  } catch (err: unknown) {
    const error = err as ApiError;
    if (error.response && [401, 403, 404].includes(error.response.status!)) {
      throw error;
    }
    throw error;
  }
}

export function useProfile(uid?: string) {
  const { session } = useSession();
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: uid ? ["profile", uid] : ["profile"],
    queryFn: () => {
      if (!uid) return null;
      return fetchProfile(uid);
    },
    enabled: !!uid && !!session,
    staleTime: 5000,
    refetchOnWindowFocus: true,
    // Habilitar retentativa para erros de rede/timeout
    retry: (failureCount, err: unknown) => {
      const error = err as ApiError;
      if (failureCount < 3 && !error.response) return true;
      return false;
    },
    refetchInterval: 120000, // Heartbeat: check user status every 2 minutes
  });

  useEffect(() => {
    // SÓ desloga se o erro for explicitamente de autorização (401/403)
    // Erros de rede (sem response) são ignorados para evitar logout por instabilidade
    const apiError = error as ApiError | null;
    if (apiError && apiError.response?.status && [401, 403].includes(apiError.response.status)) {
      console.warn("[useProfile] Sessão inválida detectada no heartbeat. Deslogando...");
      sessionManager.signOut().catch(() => { });
    }
  }, [error]);

  return {
    profile: data,
    error,
    isLoading,
    refreshProfile: refetch,
  };
}
