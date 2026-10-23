import { ActionItem } from "@/types/actions";
import { Feriado } from "@/types/database";
import { Edit2, Trash2 } from "lucide-react";

interface UseFeriadoActionsProps {
  onEdit: (feriado: Feriado) => void;
  onDelete: (feriado: Feriado) => void;
  canEdit?: boolean;
}

export function useFeriadoActions({
  onEdit,
  onDelete,
  canEdit = true,
}: UseFeriadoActionsProps) {
  const getFeriadoActions = (feriado: Feriado): ActionItem[] => {
    return [
      {
        label: "Editar",
        icon: <Edit2 className="w-4 h-4" />,
        onClick: () => onEdit(feriado),
        hidden: !canEdit,
      },
      {
        label: "Excluir",
        icon: <Trash2 className="w-4 h-4 text-destructive" />,
        onClick: () => onDelete(feriado),
        isDestructive: true,
        variant: "destructive",
        hidden: !canEdit,
      },
    ];
  };

  return { getFeriadoActions };
}
