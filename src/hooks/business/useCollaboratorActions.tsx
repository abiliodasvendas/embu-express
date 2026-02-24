import { useSession } from "@/hooks/business/useSession";
import { usePermissions } from "@/hooks/business/usePermissions";
import { canManageRole } from "@/utils/auth/hierarchy";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { Usuario } from "@/types/database";
import { ActionItem } from "@/types/actions";
import { Ban, Check, Edit, Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { STATUS_CADASTRO } from "@/constants/cadastro";

interface UseCollaboratorActionsProps {
  collaborator?: Usuario;
  onEdit: (collaborator: Usuario) => void;
  onStatusChange: (collaborator: Usuario, newStatus: string) => void;
  onDelete: (collaborator: Usuario) => void;
  hideDetails?: boolean;
}

export function useCollaboratorActions({
  collaborator,
  onEdit,
  onStatusChange,
  onDelete,
  hideDetails = false,
}: UseCollaboratorActionsProps) {
  const { user } = useSession();
  const { can, roleName: currentUserRole } = usePermissions();
  const navigate = useNavigate();

  const actions: ActionItem[] = [];
  if (!collaborator) return actions;

  const isCurrentUser = user?.id === collaborator.id;
  const targetUserRole = collaborator.perfil?.nome;
  const status = collaborator.status;

  const canManageHierarchy = canManageRole(currentUserRole, targetUserRole);

  // SEMPRE PODE VER DETALHES se não estivermos na view de detalhes.
  if (!hideDetails) {
    actions.push({
      label: "Ver Detalhes",
      icon: <Eye className="h-4 w-4" />,
      onClick: () => navigate(`/colaboradores/${collaborator.id}`),
      swipeColor: "bg-primary",
      drawerClass: "text-primary",
    });
  }

  if (can(PERMISSIONS.USUARIOS.EDITAR)) {
    if (isCurrentUser || canManageHierarchy) {
      actions.push({
        label: "Editar",
        icon: <Edit className="h-4 w-4" />,
        onClick: () => onEdit(collaborator),
        swipeColor: "bg-blue-600",
        drawerClass: "text-blue-600",
      });
    }
  }

  if (!isCurrentUser && canManageHierarchy) {
    if (can(PERMISSIONS.USUARIOS.STATUS)) {
      if (status === STATUS_CADASTRO.PENDENTE) {
        actions.push({
          label: "Aprovar",
          icon: <Check className="h-4 w-4" />,
          onClick: () => onStatusChange(collaborator, STATUS_CADASTRO.ATIVO),
          swipeColor: "bg-green-600",
          drawerClass: "text-green-600",
        });
      } else if (status === STATUS_CADASTRO.ATIVO) {
        actions.push({
          label: "Desativar",
          icon: <Ban className="h-4 w-4" />,
          onClick: () => onStatusChange(collaborator, STATUS_CADASTRO.INATIVO),
          swipeColor: "bg-amber-600",
          drawerClass: "text-amber-600",
        });
      } else {
        actions.push({
          label: "Ativar",
          icon: <Check className="h-4 w-4" />,
          onClick: () => onStatusChange(collaborator, STATUS_CADASTRO.ATIVO),
          swipeColor: "bg-green-600",
          drawerClass: "text-green-600",
        });
      }
    }

    if (can(PERMISSIONS.USUARIOS.DELETAR)) {
      actions.push({
        label: "Excluir",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: () => onDelete(collaborator),
        // @ts-ignore
        isDestructive: true,
        swipeColor: "bg-red-600",
        drawerClass: "text-red-600",
      });
    }
  }

  return actions;
}
