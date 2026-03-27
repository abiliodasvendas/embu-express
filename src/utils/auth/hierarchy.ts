import { ROLES } from "@/constants/permissions.enum";
import { isSuperAdmin as checkIsSuperAdmin, isAdmin as checkIsAdmin, isAnyAdmin as checkIsAnyAdmin } from "../business/roles";

/**
 * Define se o usuário logado (currentUserRole) pode gerenciar (editar/excluir/status)
 * o usuário alvo (targetUserRole) baseado em uma hierarquia vertical de privilégios.
 */
export function canManageRole(currentUserRole: string | undefined, targetUserRole: string | undefined): boolean {
    if (!currentUserRole || !targetUserRole) return false;

    // Super Admin pode gerenciar qualquer um no sistema.
    if (checkIsSuperAdmin(currentUserRole)) {
        return true;
    }

    // Admin normal não pode gerenciar (editar/deletar) Super Admin nem outro Admin.
    if (checkIsAdmin(currentUserRole)) {
        if (checkIsAnyAdmin(targetUserRole)) {
            return false;
        }
        // Ele pode gerenciar quem for de nível inferior (motoboy, cliente, atendente...)
        return true;
    }

    // Outros perfis por padrão não têm poder de gerenciar perfis administrativos.
    // A própria checagem de permissões RBAC deve ter bloqueado a visualização da tela inteira antes.
    // Mas por segurança (ex: se derem permissão de view para um supervisor ver admin):
    if (checkIsAnyAdmin(targetUserRole)) {
        return false;
    }

    // Se for cargo de base contra cargo de base, o RBAC toma conta.
    return true;
}
