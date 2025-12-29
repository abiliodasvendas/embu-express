import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "./useSession";

/**
 * Hook centralizado para verificação de permissões e regras de acesso do usuário.
 * Embu Express: Baseado em Roles (admin, motoboy, super_admin, financeiro).
 */
export function usePermissions() {
  const { user } = useSession();
  const { profile, isLoading, refreshProfile } = useProfile(user?.id);
  
  // Extração de Role
  const roleName = profile?.perfil?.nome;
  const isAdmin = roleName === 'admin' || roleName === 'super_admin';
  const isMotoboy = roleName === 'motoboy';
  const isFinanceiro = roleName === 'financeiro';

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
