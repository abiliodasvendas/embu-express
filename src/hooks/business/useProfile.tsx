import { colaboradorApi } from "@/services/api/colaborador.api";
import { sessionManager } from "@/services/sessionManager";
import { Perfil, Usuario } from "@/types/database";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export type ProfileWithRole = Usuario & {
  perfil?: Perfil;
};

export async function fetchProfile(uid: string): Promise<ProfileWithRole | null> {
  try {
    const data = await colaboradorApi.getColaborador(uid);
    return data as unknown as ProfileWithRole;
  } catch (error: any) {
    if (error.response && [401, 403, 404].includes(error.response.status)) {
      throw error;
    }
    throw error;
  }
}

export function useProfile(uid?: string) {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: uid ? ["profile", uid] : ["profile"],
    queryFn: () => {
      if (!uid) return null;
      return fetchProfile(uid);
    },
    enabled: !!uid,
    staleTime: 5000,
    refetchOnWindowFocus: true,
    retry: false,
  });

  useEffect(() => {
    if (error) {
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
