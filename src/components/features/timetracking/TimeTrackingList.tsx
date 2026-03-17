import { useDeletePonto } from "@/hooks/api/usePontoMutations";
import { useTimeRecordActions } from "@/hooks/business/useTimeRecordActions";
import { useLayout } from "@/contexts/LayoutContext";
import { RegistroPonto } from "@/types/database";
import { FilterX } from "lucide-react";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";

import { TimeRecordCard } from "./TimeRecordCard";

interface TimeTrackingListProps {
  records: RegistroPonto[];
  date: Date;
}

interface TimeTrackingItemProps {
  record: RegistroPonto;
  date: Date;
  onDetails: (record: RegistroPonto) => void;
  onEdit: (record: RegistroPonto) => void;
  onDelete: (record: RegistroPonto) => void;
}

function TimeTrackingItem({ record, date, onDetails, onEdit, onDelete }: TimeTrackingItemProps) {
  const actions = useTimeRecordActions({
    record,
    onDetails,
    onEdit,
    onDelete
  });

  return (
    <TimeRecordCard
      record={record}
      date={date}
      onDetails={onDetails}
      actions={actions}
    />
  );
}

export function TimeTrackingList({ records, date }: TimeTrackingListProps) {
  const { openTimeRecordDetailsDialog, openTimeRecordDialog, openConfirmationDialog, closeConfirmationDialog } = useLayout();
  const { mutateAsync: deletePonto } = useDeletePonto();

  const handleEdit = (record: RegistroPonto) => {
    openTimeRecordDialog({ record });
  };

  const handleDelete = (record: RegistroPonto) => {
    openConfirmationDialog({
      title: "Excluir Registro",
      description: "Tem certeza que deseja excluir permanentemente este registro de ponto? Esta ação não pode ser desfeita.",
      confirmText: "Sim, excluir",
      variant: "destructive",
      onConfirm: async () => {
        await deletePonto(Number(record.id));
        closeConfirmationDialog();
      }
    });
  };

  const openDetails = (record: RegistroPonto) => {
    openTimeRecordDetailsDialog({
      record,
      onEdit: handleEdit,
      onDelete: handleDelete
    });
  };

  if (records.length === 0) {
    return (
      <UnifiedEmptyState
        icon={FilterX}
        title="Nenhum registro encontrado"
        description="Não há registros de ponto para os filtros selecionados nesta data."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {records.map((record) => (
        <TimeTrackingItem
          key={record.id}
          record={record}
          date={date}
          onDetails={openDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
