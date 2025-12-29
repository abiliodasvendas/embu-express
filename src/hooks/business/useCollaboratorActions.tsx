
import { Usuario } from "@/types/database";
import { Edit, Power, Trash2 } from "lucide-react";

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
  return [
    {
      label: "Editar",
      icon: <Edit className="h-4 w-4" />,
      onClick: () => onEdit(collaborator),
    },
    {
      label: collaborator.ativo ? "Desativar" : "Ativar",
      icon: <Power className="h-4 w-4" />,
      onClick: () => onToggleStatus(collaborator),
      className: collaborator.ativo ? "text-red-600 focus:text-red-600 focus:bg-red-50" : "text-green-600 focus:text-green-600 focus:bg-green-50",
    },
    {
      label: "Excluir",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => onDelete(collaborator),
      className: "text-red-600 focus:text-red-600 focus:bg-red-50",
    },
  ];
}
