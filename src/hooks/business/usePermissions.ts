import { useProfile } from "@/hooks/business/useProfile";
import { ROLES } from "@/types/auth";
import { useSession } from "./useSession";

/**
 * Hook centralizado para verificação de permissões e regras de acesso do usuário.
 * Embu Express: Baseado em Roles (admin, motoboy, super_admin, financeiro).
 */
export function usePermissions() {
  const { user, loading: loadingSession } = useSession();
  const { profile, error, isLoading: loadingProfile, refreshProfile } = useProfile(user?.id);
  
  // Robust Loading Check
  const isLoading = loadingSession || loadingProfile || (!!user && !profile && !error);
  
  // Extração de Role
  const roleName = profile?.perfil?.nome;
  const isAdmin = roleName === ROLES.ADMIN || roleName === ROLES.SUPER_ADMIN;
  const isMotoboy = roleName === ROLES.MOTOBOY;
  const isFinanceiro = roleName === ROLES.FINANCEIRO;

  // Regras de Visualização (Simplificadas para o MVP)
  const canViewAdminPanel = isAdmin || isFinanceiro;
  const canManageCollaborators = isAdmin;
  const canManageClients = isAdmin;

  return {
    isLoading,
    
    // Role Helpers
    isAdmin,
    isMotoboy,
    isFinanceiro,
    roleName,

    // Permissions
    canViewAdminPanel,
    canManageCollaborators,
    canManageClients,
    
    // Raw Data
    profile,
    refetchProfile: refreshProfile
  };
}
