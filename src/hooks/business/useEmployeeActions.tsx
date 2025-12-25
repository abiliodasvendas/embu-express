import { ActionItem } from "@/types/actions";
import { Usuario } from "@/types/database";
import { Edit2, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { useSession } from "../business/useSession";

interface UseEmployeeActionsProps {
  employee: Usuario;
  onEdit: (employee: Usuario) => void;
  onToggleStatus: (employee: Usuario) => void;
  onDelete: (employee: Usuario) => void;
}

export function useEmployeeActions({
  employee,
  onEdit,
  onToggleStatus,
  onDelete,
}: UseEmployeeActionsProps): ActionItem[] {
  const { user } = useSession();
  const isCurrentUser = user?.id === employee.id;

  const actions = [
    {
      label: "Editar",
      icon: <Edit2 className="h-4 w-4" />,
      onClick: () => onEdit(employee),
      swipeColor: "bg-blue-500",
    },
    {
      label: employee.ativo ? "Inativar" : "Reativar",
      icon: employee.ativo ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />,
      onClick: () => onToggleStatus(employee),
      disabled: isCurrentUser,
      swipeColor: employee.ativo ? "bg-amber-500" : "bg-emerald-500",
    },
    {
      label: "Remover",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => onDelete(employee),
      variant: "destructive" as const,
      disabled: isCurrentUser,
      swipeColor: "bg-red-500",
    },
  ];

  if (isCurrentUser) {
    // Allow editing self, but hide other dangerous actions
    return actions
      .filter((a) => a.label === "Editar")
      .map((a) => ({ ...a, label: "Editar (Você)" }));
  }

  return actions;
}
