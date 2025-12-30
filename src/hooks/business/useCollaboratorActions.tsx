
import { useSession } from "@/hooks/business/useSession";
import { Usuario } from "@/types/database";
import { Edit, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

interface UseCollaboratorActionsProps {
  collaborator: Usuario;
  onEdit: (collaborator: Usuario) => void;
  onToggleStatus: (collaborator: Usuario) => void;
  onDelete: (collaborator: Usuario) => void;
}

export function useCollaboratorActions({
  collaborator,
  onEdit,
  onToggleStatus,
  onDelete,
}: UseCollaboratorActionsProps) {
  const { user } = useSession();
  const isCurrentUser = user?.id === collaborator.id;

  return [
    {
      label: "Editar",
      icon: <Edit className="h-4 w-4" />,
      onClick: () => onEdit(collaborator),
      swipeColor: "bg-blue-600",
      drawerClass: "text-blue-600",
    },
    !isCurrentUser && {
      label: collaborator.ativo ? "Desativar" : "Ativar",
      icon: collaborator.ativo ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />,
      onClick: () => onToggleStatus(collaborator),
      drawerClass: collaborator.ativo 
        ? "text-amber-600" 
        : "text-emerald-600",
      swipeColor: collaborator.ativo
        ? "bg-amber-600"
        : "bg-emerald-600",
    },
    !isCurrentUser && {
      label: "Excluir",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => onDelete(collaborator),
      isDestructive: true,
      swipeColor: "bg-red-600",
      drawerClass: "text-red-600",
    },
  ].filter(Boolean) as any[];
}
