import { ActionItem } from "@/types/actions";
import { Perfil } from "@/types/database";
import { PROTECTED_ROLES_NAMES, PERMISSIONS } from "@/constants/permissions.enum";
import { canManageRole } from "@/utils/auth/hierarchy";
import { usePermissions } from "@/hooks/business/usePermissions";
import { Edit2, ShieldAlert, Trash2 } from "lucide-react";

interface UsePerfilActionsProps {
  onEdit: (perfil: Perfil) => void;
  onDelete: (perfil: Perfil) => void;
}

export function usePerfilActions({ onEdit, onDelete }: UsePerfilActionsProps) {
  const { can, isSuperAdmin, roleName: currentUserRole } = usePermissions();

  const getPerfilActions = (perfil: Perfil): ActionItem[] => {
    const actions: ActionItem[] = [];
    if (!perfil) return actions;

    const isProtected = PROTECTED_ROLES_NAMES.includes(perfil.nome as any);
    const targetUserRole = perfil.nome;
    const canManageHierarchy = canManageRole(currentUserRole, targetUserRole);

    if (can(PERMISSIONS.PERFIS.EDITAR) && canManageHierarchy) {
      actions.push({
        label: "Editar",
        icon: <Edit2 className="h-4 w-4" />,
        onClick: () => onEdit(perfil),
      });
    }

    if (can(PERMISSIONS.PERFIS.DELETAR) && canManageHierarchy && (!isProtected || isSuperAdmin)) {
      actions.push({
        label: isProtected ? "Forçar Exclusão" : "Excluir",
        icon: isProtected ? <ShieldAlert className="h-4 w-4 text-destructive" /> : <Trash2 className="h-4 w-4 text-destructive" />,
        onClick: () => onDelete(perfil),
        isDestructive: true,
        variant: "destructive",
      });
    }

    return actions;
  };

  return { getPerfilActions };
}
