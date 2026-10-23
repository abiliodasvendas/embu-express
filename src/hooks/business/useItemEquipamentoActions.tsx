import { ActionItem } from "@/types/actions";
import { ItemEquipamento } from "@/types/database";
import { Edit2, Trash2, Users } from "lucide-react";

interface UseItemEquipamentoActionsProps {
  onEdit: (item: ItemEquipamento) => void;
  onDelete: (item: ItemEquipamento) => void;
  onViewAlocados: (item: ItemEquipamento) => void;
  canEdit?: boolean;
}

export function useItemEquipamentoActions({
  onEdit,
  onDelete,
  onViewAlocados,
  canEdit = true,
}: UseItemEquipamentoActionsProps) {
  const getItemActions = (item: ItemEquipamento): ActionItem[] => {
    return [
      {
        label: "Ver Alocados",
        icon: <Users className="w-4 h-4" />,
        onClick: () => onViewAlocados(item),
      },
      {
        label: "Editar",
        icon: <Edit2 className="w-4 h-4" />,
        onClick: () => onEdit(item),
        hidden: !canEdit,
      },
      {
        label: "Excluir",
        icon: <Trash2 className="w-4 h-4 text-destructive" />,
        onClick: () => onDelete(item),
        isDestructive: true,
        variant: "destructive",
        hidden: !canEdit,
      },
    ];
  };

  return { getItemActions };
}
