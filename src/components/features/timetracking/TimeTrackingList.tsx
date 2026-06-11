import { useMemo } from "react";
import { useDeletePonto } from "@/hooks/api/usePontoMutations";
import { useTimeRecordActions } from "@/hooks/business/useTimeRecordActions";
import { useLayout } from "@/contexts/LayoutContext";
import { RegistroPonto } from "@/types/database";
import { ManagementStatus, OccurrenceFormMode } from "@/types/enums";
import { getManagementStatus } from "@/utils/ponto";
import { Card } from "@/components/ui/card";
import { TimeRecordCard } from "./TimeRecordCard";
import { safeCloseDialog } from "@/hooks";
import { useTiposOcorrencia } from "@/hooks/api/useOcorrencias";
import { useDeleteOcorrencia } from "@/hooks/api/useOcorrenciaMutations";
import { ocorrenciaService } from "@/services/api/ocorrencia.service";

interface TimeTrackingListProps {
  records: RegistroPonto[];
  date: Date;
  showClient?: boolean;
  showActions?: boolean;
  manualAbsenceIds?: string[];
  addManualAbsence?: any;
  removeManualAbsence?: any;
}

interface TimeTrackingItemProps {
  record: RegistroPonto;
  date: Date;
  showClient?: boolean;
  showActions?: boolean;
  onDetails: (record: RegistroPonto) => void;
  onEdit: (record: RegistroPonto) => void;
  onDelete: (record: RegistroPonto) => void;
  onMarkAbsent: (record: RegistroPonto) => void;
  isManuallyAbsent: boolean;
}

function TimeTrackingItem({ 
  record, 
  date, 
  showClient, 
  showActions = true, 
  onDetails, 
  onEdit, 
  onDelete,
  onMarkAbsent,
  isManuallyAbsent
}: TimeTrackingItemProps) {
  const actions = useTimeRecordActions({
    record,
    date,
    onDetails,
    onEdit,
    onDelete,
    onMarkAbsent,
    isManuallyAbsent
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
        isManual={isManuallyAbsent}
      />
    </Card>
  );
}


export function TimeTrackingList({ 
  records, 
  date, 
  showClient = false, 
  showActions = true,
  manualAbsenceIds = [],
  addManualAbsence,
  removeManualAbsence
}: TimeTrackingListProps) {
  const { openTimeRecordDetailsDialog, openTimeRecordDialog, openConfirmationDialog, closeConfirmationDialog, openOccurrenceFormDialog } = useLayout();
  const { mutateAsync: deletePonto } = useDeletePonto();
  const { mutateAsync: deleteOcorrencia } = useDeleteOcorrencia();
  const { data: tiposOcorrencia = [] } = useTiposOcorrencia();

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
    if (!record.entrada_hora) {
      handleEdit(record);
      return;
    }

    openTimeRecordDetailsDialog({
      record,
      onEdit: handleEdit,
      onDelete: handleDelete
    });
  };

  const handleMarkAbsent = async (record: RegistroPonto) => {
    if (!addManualAbsence || !removeManualAbsence) return;

    const tipoSemAtividade = tiposOcorrencia.find(t => 
      t.descricao.toLowerCase().includes("sem atividade") || 
      t.descricao.toLowerCase().includes("falta")
    );

    const isAbsent = manualAbsenceIds.includes(record.usuario_id!);
    if (isAbsent) {
      try {
        const ocorrenciasExistentes = await ocorrenciaService.listOcorrencias({
          usuario_id: record.usuario_id,
          data_inicio: record.data_referencia,
          data_fim: record.data_referencia,
          tipo_id: tipoSemAtividade ? tipoSemAtividade.id : undefined,
        });

        if (ocorrenciasExistentes && ocorrenciasExistentes.length > 0) {
          const oId = ocorrenciasExistentes[0].id;
          if (oId) {
            await deleteOcorrencia(oId);
          }
        }
      } catch (error) {
        console.error("Erro ao remover ocorrência automática de Sem Atividade:", error);
      }

      await removeManualAbsence.mutateAsync(record.usuario_id!);
    } else {
      const defaultTipoId = tipoSemAtividade ? String(tipoSemAtividade.id) : "";

      openOccurrenceFormDialog({
        collaboratorId: record.usuario_id,
        mode: OccurrenceFormMode.GENERAL,
        defaultValues: {
          colaborador_id: record.usuario_id,
          tipo_id: defaultTipoId,
          data_ocorrencia: new Date().toISOString().split("T")[0],
          colaborador_cliente_id: record.colaborador_cliente?.id
            ? String(record.colaborador_cliente.id)
            : "none",
          observacao: "",
          impacto_financeiro: false,
        },
        onSuccess: async () => {
          await addManualAbsence.mutateAsync(record.usuario_id!);
        }
      });
    }
  };

  const statusOrder = [
    { key: ManagementStatus.LATE, label: "Atrasados" },
    { key: ManagementStatus.OVERTIME, label: "Hora Extra" },
    { key: ManagementStatus.WORKING, label: "Trabalhando" },
    { key: ManagementStatus.ABSENT, label: "Sem Atividade" },
    { key: ManagementStatus.WAITING, label: "Aguardando Início" },
    { key: ManagementStatus.DONE, label: "Finalizado" }
  ];

  // Group records using the pre-calculated mgtStatus (already includes manual override from ViewModel)
  const grouped = useMemo(() => records.reduce((acc, record: any) => {
    const status = record.mgtStatus || getManagementStatus(record, date);
    
    if (!acc[status]) acc[status] = [];
    acc[status].push(record);
    return acc;
  }, {} as Record<string, RegistroPonto[]>), [records, date]);

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
                    onMarkAbsent={handleMarkAbsent}
                    isManuallyAbsent={manualAbsenceIds.includes(record.usuario_id!)}
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
