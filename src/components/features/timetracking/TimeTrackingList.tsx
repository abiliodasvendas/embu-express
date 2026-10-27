import { useMemo } from "react";
import { useDeletePonto } from "@/hooks/api/usePontoMutations";
import { useTimeRecordActions } from "@/hooks/business/useTimeRecordActions";
import { useLayout } from "@/contexts/LayoutContext";
import { RegistroPonto } from "@/types/database";
import { ManagementStatus, OccurrenceFormMode } from "@/types/enums";
import { getManagementStatus } from "@/utils/ponto";
import { TimeRecordCard } from "./TimeRecordCard";
import { safeCloseDialog } from "@/hooks";
import { useTiposOcorrencia } from "@/hooks/api/useOcorrencias";
import { useDeleteOcorrencia } from "@/hooks/api/useOcorrenciaMutations";
import { ocorrenciaService } from "@/services/api/ocorrencia.service";
import { PONTO_STATUS_UI_CONFIG } from "@/config/ponto-ui";
import { cn } from "@/lib/utils";

interface TimeTrackingListProps {
  records: RegistroPonto[];
  date: Date;
  showClient?: boolean;
  showActions?: boolean;
  manualAbsenceIds?: string[];
  addManualAbsence?: { mutateAsync: (id: string) => Promise<unknown> };
  removeManualAbsence?: { mutateAsync: (id: string) => Promise<unknown> };
}

interface TimeTrackingItemProps {
  record: RegistroPonto & { mgtStatus?: ManagementStatus };
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
    <TimeRecordCard
      record={record}
      date={date}
      onDetails={onDetails}
      actions={showActions ? actions : []}
      showActions={showActions}
      showClient={showClient}
      isManual={isManuallyAbsent}
    />
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
  const {
    openTimeRecordDetailsDialog,
    openTimeRecordDialog,
    openConfirmationDialog,
    closeConfirmationDialog,
    openOccurrenceFormDialog
  } = useLayout();
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
    if (!addManualAbsence || !removeManualAbsence || !record.usuario_id) return;

    const tipoSemAtividade = tiposOcorrencia.find(
      (t) =>
        t.descricao.toLowerCase().includes("sem atividade") ||
        t.descricao.toLowerCase().includes("falta")
    );

    const isAbsent = manualAbsenceIds.includes(record.usuario_id);
    if (isAbsent) {
      if (tipoSemAtividade) {
        try {
          const ocorrenciasExistentes = await ocorrenciaService.listOcorrencias({
            usuario_id: record.usuario_id,
            data_inicio: record.data_referencia,
            data_fim: record.data_referencia,
            tipo_id: tipoSemAtividade.id
          });

          if (ocorrenciasExistentes && ocorrenciasExistentes.length > 0) {
            const oId = ocorrenciasExistentes[0].id;
            if (oId) {
              await deleteOcorrencia(oId);
            }
          }
        } catch (error) {
          console.error("Erro ao remover ocorrência automática:", error);
        }
      }

      try {
        await removeManualAbsence.mutateAsync(record.usuario_id);
      } catch (error) {
        console.error("Erro ao remover ausência manual:", error);
      }
    } else {
      const defaultTipoId = tipoSemAtividade ? String(tipoSemAtividade.id) : "";

      openOccurrenceFormDialog({
        collaboratorId: record.usuario_id,
        mode: OccurrenceFormMode.GENERAL,
        defaultValues: {
          colaborador_id: record.usuario_id,
          tipo_id: defaultTipoId,
          data_ocorrencia: record.data_referencia || new Date().toISOString().split("T")[0],
          colaborador_cliente_id: record.colaborador_cliente?.id
            ? String(record.colaborador_cliente.id)
            : "none",
          observacao: "",
          impacto_financeiro: false
        },
        onSuccess: async () => {
          if (record.usuario_id) {
            await addManualAbsence.mutateAsync(record.usuario_id);
          }
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

  const grouped = useMemo(() => {
    return records.reduce((acc, record) => {
      const status =
        (record as RegistroPonto & { mgtStatus?: string }).mgtStatus ||
        getManagementStatus(record, date);
      if (!acc[status]) acc[status] = [];
      acc[status].push(record);
      return acc;
    }, {} as Record<string, RegistroPonto[]>);
  }, [records, date]);

  return (
    <div className="space-y-10">
      {statusOrder.map(({ key, label }) => {
        const groupRecords = grouped[key] || [];
        if (groupRecords.length === 0) return null;
        const config = PONTO_STATUS_UI_CONFIG[key as ManagementStatus];

        return (
          <div key={key} className="space-y-4">
            <div className="flex items-center gap-2.5 px-1">
              <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", config?.borderSide || "bg-muted-foreground")} />
              <h3 className={cn("text-xs sm:text-sm font-bold uppercase tracking-wider", config?.color || "text-muted-foreground")}>
                {label} ({groupRecords.length})
              </h3>
              <div className="h-px bg-border flex-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupRecords.map((record) => (
                <TimeTrackingItem
                  key={record.id}
                  record={record as RegistroPonto & { mgtStatus?: ManagementStatus }}
                  date={date}
                  showClient={showClient}
                  showActions={showActions}
                  onDetails={openDetails}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onMarkAbsent={handleMarkAbsent}
                  isManuallyAbsent={
                    record.usuario_id ? manualAbsenceIds.includes(record.usuario_id) : false
                  }
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
