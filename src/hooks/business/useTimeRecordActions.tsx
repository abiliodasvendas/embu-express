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
      swipeColor: "bg-blue-500",
    },
    {
      label: "Editar registro",
      icon: <Edit2 className="h-4 w-4" />,
      onClick: () => onEdit(record),
      swipeColor: "bg-amber-500",
    },
    {
      label: "Excluir",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => onDelete(record),
      variant: "destructive" as const,
      danger: true,
      swipeColor: "bg-red-500",
    },
  ];
}
