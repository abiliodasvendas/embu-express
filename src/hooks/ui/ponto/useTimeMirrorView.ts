import { useState, useEffect } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { useTimeMirror } from "@/hooks/api/useTimeMirror";
import { useTimeRecord } from "@/hooks/api/useTimeRecord";
import { useDeletePonto } from "@/hooks/api/usePontoMutations";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { FilterOptions } from "@/types/enums";
import { CALENDARIO_STATUS } from "@/constants/financeiro.constants";
import type { RegistroPonto } from "@/types/database";
import type { PontoDiarioRelatorio } from "@/types/ponto-relatorio";

export interface UseTimeMirrorViewProps {
  usuarioId?: string;
  selectedMonth?: number;
  selectedYear?: number;
  selectedShift?: string;
  isActionable?: boolean;
}

export function useTimeMirrorView({
  usuarioId,
  selectedMonth,
  selectedYear,
  selectedShift = FilterOptions.TODOS,
  isActionable = false,
}: UseTimeMirrorViewProps) {
  const { can } = usePermissions();
  const canViewAll = can(PERMISSIONS.PONTO.ADMIN_VER);
  const month = selectedMonth || new Date().getMonth() + 1;
  const year = selectedYear || new Date().getFullYear();

  const { data: reportData = [], isLoading } = useTimeMirror(
    usuarioId || undefined,
    month,
    year
  );

  const activeReport =
    selectedShift === FilterOptions.TODOS
      ? reportData[0]
      : reportData.find((r) => r.shift_id === Number(selectedShift)) || reportData[0];

  const {
    openTimeRecordDetailsDialog,
    openTimeRecordDialog,
    openConfirmationDialog,
    closeConfirmationDialog,
  } = useLayout();

  const { mutateAsync: deletePonto } = useDeletePonto();
  const [selectedPontoId, setSelectedPontoId] = useState<number | null>(null);
  const { data: fullRecord, isFetching: isFetchingRecord } = useTimeRecord(selectedPontoId);
  const [showFutureScale, setShowFutureScale] = useState(false);

  const todayStr = new Date().toLocaleDateString("en-CA");
  const isCurrentPeriod = month === new Date().getMonth() + 1 && year === new Date().getFullYear();

  const calendario = activeReport?.calendario || [];
  const realizedDays = calendario.filter((day) => {
    return day.data <= todayStr || day.ponto_id || day.status !== CALENDARIO_STATUS.FUTURO;
  });

  const futureDays = calendario.filter((day) => {
    return day.data > todayStr && day.status === CALENDARIO_STATUS.FUTURO && !day.ponto_id;
  });

  useEffect(() => {
    if (!isLoading && realizedDays.length === 0 && futureDays.length > 0) {
      setShowFutureScale(true);
    }
  }, [realizedDays.length, futureDays.length, isLoading]);

  const handleDeleteById = (id: number) => {
    openConfirmationDialog({
      title: "Excluir Registro",
      description:
        "Tem certeza que deseja excluir permanentemente este registro de atividade? Esta ação não pode ser desfeita.",
      confirmText: "Sim, excluir",
      variant: "destructive",
      onConfirm: async () => {
        await deletePonto(id);
        safeCloseDialog(closeConfirmationDialog);
      },
    });
  };

  const handleDelete = (record: RegistroPonto) => {
    handleDeleteById(Number(record.id));
  };

  const handleEditFromDetails = (record: RegistroPonto) => {
    openTimeRecordDialog({ record });
  };

  useEffect(() => {
    if (fullRecord && selectedPontoId) {
      openTimeRecordDetailsDialog({
        record: fullRecord,
        onEdit:
          isActionable && can(PERMISSIONS.PONTO.ADMIN_EDITAR)
            ? handleEditFromDetails
            : undefined,
        onDelete:
          isActionable && can(PERMISSIONS.PONTO.ADMIN_EDITAR)
            ? handleDelete
            : undefined,
      });
      setSelectedPontoId(null);
    }
  }, [fullRecord, selectedPontoId, isActionable, can]);

  const handleOpenRecord = (day: PontoDiarioRelatorio) => {
    if (day.ponto_id) {
      setSelectedPontoId(day.ponto_id);
    } else if (isActionable && usuarioId && can(PERMISSIONS.PONTO.ADMIN_CRIAR)) {
      openTimeRecordDialog({
        record: {
          id: -1,
          usuario_id: usuarioId,
          data_referencia: day.data,
          entrada_hora: "",
          status_entrada: "PENDENTE",
          colaborador_cliente_id: activeReport?.shift_id,
          colaborador_cliente: {
            id: activeReport?.shift_id || 0,
            colaborador_id: usuarioId,
            cliente_id: 0,
            unidade_id: 0,
            empresa_id: 0,
            valor_contrato: 0,
            unidade: {
              id: 0,
              cliente_id: 0,
              nome_unidade: day.unidade_nome || "",
              razao_social: "",
              cnpj: "",
              cep: "",
              logradouro: "",
              numero: "",
              bairro: "",
              cidade: "",
              estado: "",
              ativo: true,
            },
            cliente: {
              id: 0,
              public_id: "",
              nome_fantasia: day.cliente_nome || "",
              ativo: true,
            },
          },
          detalhes_calculo: {
            entrada: { turno_base: day.shift_entrada, diff_minutos: 0, tolerancia: 0 },
            saida: { turno_base: day.shift_saida, diff_minutos: 0, tolerancia: 0 },
            resumo: {
              horas_trabalhadas: "00:00",
              horas_pausa: "00:00",
              pausa_total: 0,
              pausa_configurada: 0,
              pausa_extra: 0,
              km_trabalhado: 0,
              km_pausa: 0,
            },
          },
        },
      });
    }
  };

  const hourBalance = activeReport
    ? activeReport.kpis.horas_trabalhadas - activeReport.kpis.horas_esperadas
    : 0;

  return {
    canViewAll,
    month,
    year,
    isLoading,
    activeReport,
    hourBalance,
    isCurrentPeriod,
    realizedDays,
    futureDays,
    showFutureScale,
    setShowFutureScale,
    selectedPontoId,
    isFetchingRecord,
    handleDeleteById,
    handleOpenRecord,
  };
}
