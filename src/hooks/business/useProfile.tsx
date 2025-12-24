import { supabase } from "@/integrations/supabase/client";
import { Perfil, Usuario } from "@/types/database";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export type ProfileWithRole = Usuario & {
  perfil?: Perfil;
};

export async function fetchProfile(uid: string): Promise<ProfileWithRole | null> {
  const { data, error } = await (supabase as any)
    .from("usuarios")
    .select(
      `
      *,
      perfil:perfis (*)
    `
    )
    .eq("id", uid)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as ProfileWithRole | null;
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
      supabase.auth.signOut().catch(() => {});
    }
  }, [error]);

  return {
    profile: data,
    error,
    isLoading,
    refreshProfile: refetch,
  };
}
