import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { RegistroPonto } from "@/types/database";
import { Edit2, Eye, Trash2, PlusCircle, Ban, Undo2 } from "lucide-react";
import { ManagementStatus } from "@/types/enums";
import { getManagementStatus } from "@/utils/ponto";

interface UseTimeRecordActionsProps {
  record: RegistroPonto;
  date: Date;
  onDetails?: (record: RegistroPonto) => void;
  onEdit: (record: RegistroPonto) => void;
  onDelete: (record: RegistroPonto) => void;
  onMarkAbsent?: (record: RegistroPonto) => void;
  isManuallyAbsent?: boolean;
}


export function useTimeRecordActions({
  record,
  date,
  onDetails,
  onEdit,
  onDelete,
  onMarkAbsent,
  isManuallyAbsent = false,
}: UseTimeRecordActionsProps) {
  const { can } = usePermissions();
  const actions = [];

  // 1. Ver Detalhes
  if (onDetails && record.entrada_hora) {
    actions.push({
      label: "Ver detalhes",
      icon: <Eye className="h-4 w-4" />,
      onClick: () => onDetails(record),
      show: true,
      swipeColor: "bg-blue-600",
      drawerClass: "text-blue-600",
    });
  }

  // 2. Marcar Sem Atividade / Voltar para Atrasados
  const mStatus = getManagementStatus(record, date);
  const showManualAction = isManuallyAbsent || mStatus === ManagementStatus.LATE;

  if (can(PERMISSIONS.PONTO.ADMIN_EDITAR) && !record.entrada_hora && onMarkAbsent && showManualAction) {
    actions.push({
      label: isManuallyAbsent ? "Voltar para Atrasados" : "Marcar Sem Atividade",
      icon: isManuallyAbsent ? <Undo2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />,
      onClick: () => onMarkAbsent(record),
      swipeColor: isManuallyAbsent ? "bg-gray-600" : "bg-amber-600",
      drawerClass: isManuallyAbsent ? "text-gray-600" : "text-amber-600",
    });
  }

  // 3. Registrar/Editar atividade
  if (can(PERMISSIONS.PONTO.ADMIN_EDITAR)) {

    if (!record.entrada_hora) {
      actions.push({
        label: "Registrar Atividade",
        icon: <PlusCircle className="h-4 w-4" />,
        onClick: () => onEdit(record),
        swipeColor: "bg-emerald-600",
        drawerClass: "text-emerald-600",
      });
    } else {
      actions.push({
        label: "Editar Atividade",
        icon: <Edit2 className="h-4 w-4" />,
        onClick: () => onEdit(record),
        swipeColor: "bg-blue-600",
        drawerClass: "text-blue-600",
      });
    }
  }

  if (can(PERMISSIONS.PONTO.ADMIN_DELETAR) && record.entrada_hora) {
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

