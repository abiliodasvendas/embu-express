import { useSession } from "@/hooks/business/useSession";
import { Usuario } from "@/types/database";
import { Ban, Check, Edit, Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UseCollaboratorActionsProps {
  collaborator: Usuario;
  onEdit: (collaborator: Usuario) => void;
  onStatusChange: (collaborator: Usuario, newStatus: string) => void;
  onDelete: (collaborator: Usuario) => void;
}

export function useCollaboratorActions({
  collaborator,
  onEdit,
  onStatusChange,
  onDelete,
}: UseCollaboratorActionsProps) {
  const { user } = useSession();
  const navigate = useNavigate();
  const isCurrentUser = user?.id === collaborator.id;
  const status = collaborator.status;

  const actions = [
    {
      label: "Ver Detalhes",
      icon: <Eye className="h-4 w-4" />,
      onClick: () => navigate(`/colaboradores/${collaborator.id}`),
      swipeColor: "bg-primary",
      drawerClass: "text-primary",
    },
    {
      label: "Editar",
      icon: <Edit className="h-4 w-4" />,
      onClick: () => onEdit(collaborator),
      swipeColor: "bg-blue-600",
      drawerClass: "text-blue-600",
    },
  ];

  if (!isCurrentUser) {
    if (status === 'PENDENTE') {
      actions.push({
        label: "Aprovar",
        icon: <Check className="h-4 w-4" />,
        onClick: () => onStatusChange(collaborator, 'ATIVO'),
        swipeColor: "bg-green-600",
        drawerClass: "text-green-600",
      });
    } else if (status === 'ATIVO') {
      actions.push({
        label: "Desativar",
        icon: <Ban className="h-4 w-4" />,
        onClick: () => onStatusChange(collaborator, 'INATIVO'),
        swipeColor: "bg-amber-600",
        drawerClass: "text-amber-600",
      });
    } else {
      actions.push({
        label: "Ativar",
        icon: <Check className="h-4 w-4" />,
        onClick: () => onStatusChange(collaborator, 'ATIVO'),
        swipeColor: "bg-green-600",
        drawerClass: "text-green-600",
      });
    }

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

  return actions;
}
