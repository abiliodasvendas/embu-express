import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";
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
  const { can } = usePermissions();
  const actions = [];

  if (onDetails) {
    actions.push({
      label: "Ver detalhes",
      icon: <Eye className="h-4 w-4" />,
      onClick: () => onDetails(record),
      show: true,
      swipeColor: "bg-blue-600",
      drawerClass: "text-blue-600",
    });
  }

  if (can(PERMISSIONS.PONTO.ADMIN_EDITAR)) {
    actions.push({
      label: "Editar registro",
      icon: <Edit2 className="h-4 w-4" />,
      onClick: () => onEdit(record),
      swipeColor: "bg-blue-600",
      drawerClass: "text-blue-600",
    });
  }

  if (can(PERMISSIONS.PONTO.ADMIN_DELETAR)) {
    actions.push({
      label: "Excluir",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => onDelete(record),
      isDestructive: true,
      swipeColor: "bg-red-600",
      drawerClass: "text-red-600",
    });
  }

  return actions;
}
