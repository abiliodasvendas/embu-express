import { PermissionKey, PERMISSIONS, ROLES } from "@/constants/permissions.enum";
import { useProfile } from "@/hooks/business/useProfile";
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

  // Extração de Permissões
  const permissoesArray: string[] = (profile?.perfil as any)?.perfil_permissoes?.map(
    (pp: any) => pp.permissao?.nome_interno
  ) || [];

  // Super Admin Base
  const isSuperAdmin = roleName === ROLES.SUPER_ADMIN;

  // Função centralizada para verificar permissões granulares
  const can = (permissaoNecessaria: PermissionKey) => {
    // Super admin bypassa todas as checagens no fronte
    if (isSuperAdmin) return true;
    return permissoesArray.includes(permissaoNecessaria);
  };

  // Helpers para o legado enquanto migramos, ou para lógicas macro
  // Removemos as checagens por roleName ('motoboy', 'admin', etc) para depender puramente das Permissões!
  const isAdmin = isSuperAdmin;
  const isMotoboy = roleName === ROLES.MOTOBOY;
  const isFinanceiro = roleName?.startsWith('financeiro');

  // Acesso Operacional via Permissão Real
  const canOperate = can(PERMISSIONS.PONTO.REGISTRAR);

  // Regras de Visualização
  // Quem pode ter acesso ao painel Master é quem tem QUALQUER permissão administrativa:
  const canViewAdminPanel = can(PERMISSIONS.PONTO.ADMIN_VER) || can(PERMISSIONS.USUARIOS.VER) || can(PERMISSIONS.CLIENTES.VER) || can(PERMISSIONS.EMPRESAS.VER) || isAdmin;

  const canManageCollaborators = can(PERMISSIONS.USUARIOS.CRIAR);
  const canManageClients = can(PERMISSIONS.CLIENTES.CRIAR);

  return {
    isLoading,

    // Core RBAC Function
    can,
    permissoes: permissoesArray,

    // Role Helpers (Legado/Atalhos)
    isSuperAdmin,
    isAdmin,
    isMotoboy,
    isFinanceiro,
    roleName,

    // Permissions (Legado/Atalhos)
    canViewAdminPanel,
    canManageCollaborators,
    canManageClients,
    canOperate,

    // Raw Data
    profile,
    refetchProfile: refreshProfile
  };
}
