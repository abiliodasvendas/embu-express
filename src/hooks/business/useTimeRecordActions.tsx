import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { RegistroPonto } from "@/types/database";
import { ActionItem } from "@/types/actions";
import { Edit2, Eye, Trash2, PlusCircle, Ban, Undo2 } from "lucide-react";
import { ManagementStatus } from "@/types/enums";
import { getManagementStatus } from "@/utils/ponto";

interface UseTimeRecordActionsProps {
  record: RegistroPonto & { mgtStatus?: ManagementStatus };
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
}: UseTimeRecordActionsProps): ActionItem[] {
  const { can } = usePermissions();
  const actions: ActionItem[] = [];

  if (onDetails && record.entrada_hora) {
    actions.push({
      label: "Ver detalhes",
      icon: <Eye className="h-4 w-4" />,
      onClick: () => onDetails(record),
    });
  }

  const mStatus = record.mgtStatus || getManagementStatus(record, date);
  const showManualAction =
    isManuallyAbsent ||
    mStatus === ManagementStatus.LATE ||
    mStatus === ManagementStatus.WAITING;

  if (can(PERMISSIONS.PONTO.ADMIN_EDITAR) && !record.entrada_hora && onMarkAbsent && showManualAction) {
    actions.push({
      label: isManuallyAbsent ? "Voltar para Atrasados" : "Marcar Sem Atividade",
      icon: isManuallyAbsent ? <Undo2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />,
      onClick: () => onMarkAbsent(record),
    });
  }

  if (can(PERMISSIONS.PONTO.ADMIN_EDITAR)) {
    if (!record.entrada_hora) {
      actions.push({
        label: "Registrar Atividade",
        icon: <PlusCircle className="h-4 w-4" />,
        onClick: () => onEdit(record),
      });
    } else {
      actions.push({
        label: "Editar Atividade",
        icon: <Edit2 className="h-4 w-4" />,
        onClick: () => onEdit(record),
      });
    }
  }

  if (can(PERMISSIONS.PONTO.ADMIN_DELETAR) && record.entrada_hora) {
    actions.push({
      label: "Excluir",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => onDelete(record),
      isDestructive: true,
      variant: "destructive",
    });
  }

  return actions;
}
