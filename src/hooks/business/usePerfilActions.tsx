import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS, PROTECTED_ROLES_NAMES } from "@/constants/permissions.enum";
import { Perfil } from "@/types/database";
import { ActionItem } from "@/types/actions";
import { Edit2, ShieldAlert, Trash2 } from "lucide-react";

interface UsePerfilActionsProps {
    perfil?: Perfil;
    onEdit: (perfil: Perfil) => void;
    onDelete: (perfil: Perfil) => void;
}

export function usePerfilActions({
    perfil,
    onEdit,
    onDelete,
}: UsePerfilActionsProps): ActionItem[] {
    const { can, isSuperAdmin } = usePermissions();
    const actions: ActionItem[] = [];

    if (!perfil) return actions;

    const isProtected = PROTECTED_ROLES_NAMES.includes(perfil.nome as any);

    if (can(PERMISSIONS.PERFIS.EDITAR)) {
        actions.push({
            label: "Editar",
            icon: <Edit2 className="h-4 w-4" />,
            onClick: () => onEdit(perfil),
            swipeColor: "bg-blue-500",
            drawerClass: "text-blue-600",
        });
    }

    if (can(PERMISSIONS.PERFIS.DELETAR) && (!isProtected || isSuperAdmin)) {
        actions.push({
            label: isProtected ? "Forçar Exclusão" : "Excluir",
            icon: isProtected ? <ShieldAlert className="h-4 w-4 text-red-600" /> : <Trash2 className="h-4 w-4 text-red-600" />,
            onClick: () => onDelete(perfil),
            isDestructive: true,
            variant: "destructive",
            swipeColor: "bg-red-500",
        });
    }

    return actions;
}
