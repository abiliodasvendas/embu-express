import { PermissionKey, PERMISSIONS, ROLES } from "@/constants/permissions.enum";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "./useSession";
import { useCallback, useMemo } from "react";

/**
 * Hook centralizado para verificação de permissões e regras de acesso do usuário.
 * Embu Express: Baseado em Roles (admin, motoboy, super_admin, financeiro).
 */
export function usePermissions() {
  const { user, loading: loadingSession } = useSession();
  const { profile, error, isLoading: loadingProfile, refreshProfile } = useProfile(user?.id);

  const isLoading = loadingSession || loadingProfile || (!!user && !profile && !error);

  const roleName = profile?.perfil?.nome;
  const permissoesArray: string[] = useMemo(() => profile?.perfil?.perfil_permissoes?.map(
    pp => pp.permissao?.nome_interno
  ).filter((p): p is string => !!p) || [], [profile]);

  const isSuperAdmin = roleName === ROLES.SUPER_ADMIN;
  const isAdmin = roleName === ROLES.ADMIN;
  const isAnyAdmin = isSuperAdmin || isAdmin;
  const isMotoboy = roleName === ROLES.MOTOBOY;
  const isFiscal = roleName === ROLES.FISCAL;
  const isMotoboyOrFiscal = isMotoboy || isFiscal;
  const isFinanceiro = roleName?.startsWith('financeiro');

  const canOperate = roleName !== ROLES.CLIENTE;

  const can = useCallback((permissaoNecessaria: PermissionKey) => {
    if (isSuperAdmin) return true;
    return permissoesArray.includes(permissaoNecessaria);
  }, [isSuperAdmin, permissoesArray]);

  const canViewAdminPanel = useMemo(() => 
    can(PERMISSIONS.PONTO.ADMIN_VER) || can(PERMISSIONS.USUARIOS.VER) || can(PERMISSIONS.CLIENTES.VER) || can(PERMISSIONS.EMPRESAS.VER) || isAdmin
  , [can, isAdmin]);

  const canManageCollaborators = useMemo(() => can(PERMISSIONS.USUARIOS.CRIAR), [can]);
  const canManageClients = useMemo(() => can(PERMISSIONS.CLIENTES.CRIAR), [can]);

  return {
    isLoading,
    can,
    permissoes: permissoesArray,
    isSuperAdmin,
    isAdmin,
    isAnyAdmin,
    isMotoboy,
    isFiscal,
    isMotoboyOrFiscal,
    isFinanceiro,
    roleName,
    canViewAdminPanel,
    canManageCollaborators,
    canManageClients,
    canOperate,
    profile,
    refetchProfile: refreshProfile
  };
}
