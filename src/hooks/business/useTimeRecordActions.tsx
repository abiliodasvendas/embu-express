import { RegistroPonto } from "@/types/database";
import { Edit2, Eye, Trash2 } from "lucide-react";

interface UseTimeRecordActionsProps {
  record: RegistroPonto;
  onDetails?: (record: RegistroPonto) => void;
  onEdit: (record: RegistroPonto) => void;
  onDelete: (record: RegistroPonto) => void;
}

export function useTimeRecordActions({
  record,
  onDetails,
  onEdit,
  onDelete,
}: UseTimeRecordActionsProps) {
  return [
    {
      label: "Ver detalhes",
      icon: <Eye className="h-4 w-4" />,
      onClick: () => onDetails?.(record),
      show: !!onDetails,
      swipeColor: "bg-blue-600",
      drawerClass: "text-blue-600",
    },
    {
      label: "Editar registro",
      icon: <Edit2 className="h-4 w-4" />,
      onClick: () => onEdit(record),
      swipeColor: "bg-blue-600",
      drawerClass: "text-blue-600",
    },
    {
      label: "Excluir",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => onDelete(record),
      isDestructive: true,
      swipeColor: "bg-red-600",
      drawerClass: "text-red-600",
    },
  ];
}
