import { useDeletePonto } from "@/hooks/api/usePontoMutations";
import { useTimeRecordActions } from "@/hooks/business/useTimeRecordActions";
import { useLayout } from "@/contexts/LayoutContext";
import { RegistroPonto } from "@/types/database";
import { ManagementStatus } from "@/types/enums";
import { getManagementStatus } from "@/utils/ponto";
import { Card } from "@/components/ui/card";

import { TimeRecordCard } from "./TimeRecordCard";
import { safeCloseDialog } from "@/hooks";

interface TimeTrackingListProps {
  records: RegistroPonto[];
  date: Date;
  showClient?: boolean;
  showActions?: boolean;
}

interface TimeTrackingItemProps {
  record: RegistroPonto;
  date: Date;
  showClient?: boolean;
  showActions?: boolean;
  onDetails: (record: RegistroPonto) => void;
  onEdit: (record: RegistroPonto) => void;
  onDelete: (record: RegistroPonto) => void;
}

function TimeTrackingItem({ record, date, showClient, showActions = true, onDetails, onEdit, onDelete }: TimeTrackingItemProps) {
  const actions = useTimeRecordActions({
    record,
    onDetails,
    onEdit,
    onDelete
  });

  return (
    <Card className="h-full border shadow-none bg-white rounded-2xl relative">
      <TimeRecordCard
        record={record}
        date={date}
        onDetails={onDetails}
        actions={showActions ? actions : []}
        showActions={showActions}
        showClient={showClient}
      />
    </Card>
  );
}

export function TimeTrackingList({ records, date, showClient = false, showActions = true }: TimeTrackingListProps) {
  const { openTimeRecordDetailsDialog, openTimeRecordDialog, openConfirmationDialog, closeConfirmationDialog } = useLayout();
  const { mutateAsync: deletePonto } = useDeletePonto();

  const handleEdit = (record: RegistroPonto) => {
    openTimeRecordDialog({ record });
  };

  const handleDelete = (record: RegistroPonto) => {
    openConfirmationDialog({
      title: "Excluir Registro",
      description: "Tem certeza que deseja excluir permanentemente este registro de atividade? Esta ação não pode ser desfeita.",
      confirmText: "Sim, excluir",
      variant: "destructive",
      onConfirm: async () => {
        await deletePonto(Number(record.id));
        safeCloseDialog(closeConfirmationDialog);
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

  const statusOrder = [
    { key: ManagementStatus.LATE, label: "Atrasados" },
    { key: ManagementStatus.ABSENT, label: "Falta" },
    { key: ManagementStatus.WORKING, label: "Trabalhando" },
    { key: ManagementStatus.WAITING, label: "Aguardando Início" },
    { key: ManagementStatus.DONE, label: "Finalizado" }
  ];

  // Group records using the pre-calculated mgtStatus
  const grouped = records.reduce((acc, record: any) => {
    const status = record.mgtStatus || getManagementStatus(record, date);
    if (!acc[status]) acc[status] = [];
    acc[status].push(record);
    return acc;
  }, {} as Record<string, RegistroPonto[]>);

  return (
    <div className="space-y-12">
      {statusOrder.map(({ key, label }) => {
        const groupRecords = grouped[key] || [];

        return (
          <div key={key} className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">
                {label} ({groupRecords.length})
              </h3>
              <div className="h-px bg-gray-100 flex-1" />
            </div>

            {groupRecords.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupRecords.map((record) => (
                  <TimeTrackingItem
                    key={record.id}
                    record={record}
                    date={date}
                    showClient={showClient}
                    showActions={showActions}
                    onDetails={openDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
