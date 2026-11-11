import { useMemo } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { safeCloseDialog } from "@/hooks";
import { useFinanceiro } from "@/hooks/api/useFinanceiro";
import { useFinanceiroMutations } from "@/hooks/api/useFinanceiroMutations";
import { useDeleteOcorrencia } from "@/hooks/api/useOcorrenciaMutations";
import { usePermissions } from "@/hooks/business/usePermissions";
import {
  buildComprovanteRendaExtrato,
  buildLancamentosConsolidados,
  LancamentoConsolidado,
  LancamentoConvenioItem,
  OcorrenciaComTipo,
} from "@/hooks/business/financeiroConsolidadoHelper";
import { useDateFilters } from "@/hooks/ui/useFilters";
import { ExtratoMensal, ResumoClienteFinanceiro } from "@/types/financeiro";
import { OccurrenceFormMode } from "@/types/enums";
import { getMessage } from "@/constants/messages";

export type { OcorrenciaComTipo, LancamentoConvenioItem, LancamentoConsolidado };

interface UseFinancialReportViewProps {
  usuarioId?: string;
  propMonth?: number;
  propYear?: number;
  modoComprovanteRenda?: boolean;
}

export function useFinancialReportView({
  usuarioId,
  propMonth,
  propYear,
  modoComprovanteRenda = false,
}: UseFinancialReportViewProps) {
  const {
    openConfirmationDialog,
    closeConfirmationDialog,
    openConfirmarAdiantamentoDialog,
    openConfirmarPagamentoSalarioDialog,
    openOccurrenceDetailsDialog,
    closeOccurrenceDetailsDialog,
    openOccurrenceFormDialog,
  } = useLayout();

  const { can, isSuperAdmin } = usePermissions();
  const deleteOcorrenciaMutation = useDeleteOcorrencia();

  const {
    selectedMes: internalMonth,
    setSelectedMes: setSelectedMonth,
    selectedAno: internalYear,
    setSelectedAno: setSelectedYear,
  } = useDateFilters({
    mesParam: "mes",
    anoParam: "ano",
  });

  const selectedMonth = propMonth ?? internalMonth;
  const selectedYear = propYear ?? internalYear;

  const {
    data: rawExtrato,
    isLoading,
    refetch,
  } = useFinanceiro(usuarioId || undefined, selectedMonth, selectedYear);

  const extrato = useMemo<ExtratoMensal | undefined>(() => {
    if (!rawExtrato) return undefined;
    if (!modoComprovanteRenda) return rawExtrato;
    return buildComprovanteRendaExtrato(rawExtrato);
  }, [rawExtrato, modoComprovanteRenda]);

  const {
    handlePaymentMutation,
    confirmarAdiantamentoMutation,
    desconfirmarAdiantamentoMutation,
    desfazerPagamentoMutation,
  } = useFinanceiroMutations();

  const lancamentosConsolidados = useMemo<LancamentoConsolidado[]>(
    () => buildLancamentosConsolidados(extrato),
    [extrato],
  );

  const handleDeleteOcorrencia = (occurrence: OcorrenciaComTipo) => {
    openConfirmationDialog({
      title: "Remover Ocorrência",
      description: `Deseja realmente remover esta ocorrência de ${
        occurrence.tipo?.descricao || "registro"
      }?`,
      confirmText: "Remover",
      variant: "destructive",
      onConfirm: async () => {
        await deleteOcorrenciaMutation.mutateAsync(occurrence.id);
        closeOccurrenceDetailsDialog();
        safeCloseDialog(closeConfirmationDialog);
        refetch();
      },
    });
  };

  const handleEditOcorrencia = (occurrence: OcorrenciaComTipo) => {
    openOccurrenceFormDialog({
      collaboratorId: occurrence.colaborador_id,
      mode: occurrence.impacto_financeiro
        ? OccurrenceFormMode.FINANCIAL
        : OccurrenceFormMode.GENERAL,
      defaultValues: {
        id: occurrence.id,
        colaborador_id: occurrence.colaborador_id,
        tipo_id: String(occurrence.tipo_id),
        data_ocorrencia: occurrence.data_ocorrencia,
        valor: occurrence.valor,
        impacto_financeiro: occurrence.impacto_financeiro,
        tipo_lancamento: occurrence.tipo_lancamento,
        colaborador_cliente_id: occurrence.colaborador_cliente_id
          ? String(occurrence.colaborador_cliente_id)
          : "none",
        observacao: occurrence.observacao,
      },
      onSuccess: () => {
        closeOccurrenceDetailsDialog();
        refetch();
      },
    });
  };

  const handleConfirmarAdiantamento = () => {
    if (!extrato) return;
    const valorTotalAdiantamento =
      extrato.totais?.total_adiantamento ||
      extrato.resumo_por_cliente?.reduce(
        (acc: number, r: ResumoClienteFinanceiro) =>
          acc + Number(r.valores_fixos?.adiantamento_config || 0),
        0,
      ) ||
      0;

    openConfirmarAdiantamentoDialog({
      valorSugerido: valorTotalAdiantamento,
      referenciaLabel: `${String(selectedMonth).padStart(2, "0")}/${selectedYear}`,
      contaBancariaInicialId: extrato.adiantamento_conta_bancaria_id,
      isLoading: confirmarAdiantamentoMutation.isPending,
      onConfirm: async ({ valor, contaBancariaId, dataPagamento }) => {
        await confirmarAdiantamentoMutation.mutateAsync({
          usuarioId,
          mes: selectedMonth,
          ano: selectedYear,
          valor,
          contaBancariaId,
          dataPagamento,
        });
      },
    });
  };

  const handleDesconfirmarAdiantamento = () => {
    openConfirmationDialog({
      title: getMessage("financeiro.confirmacao.desfazer_adiantamento.titulo"),
      description: getMessage("financeiro.confirmacao.desfazer_adiantamento.descricao"),
      confirmText: getMessage("financeiro.confirmacao.desfazer_adiantamento.botao"),
      variant: "destructive",
      onConfirm: async () => {
        await desconfirmarAdiantamentoMutation.mutateAsync({
          usuarioId,
          mes: selectedMonth,
          ano: selectedYear,
        });
        safeCloseDialog(closeConfirmationDialog);
      },
    });
  };

  const handlePayment = () => {
    if (!extrato) return;
    openConfirmarPagamentoSalarioDialog({
      valorLiquido: extrato.totais?.saldo_final || 0,
      referenciaLabel: `${String(selectedMonth).padStart(2, "0")}/${selectedYear}`,
      contaBancariaInicialId: extrato.conta_bancaria_id,
      isLoading: handlePaymentMutation.isPending,
      onConfirm: async ({ contaBancariaId, dataPagamento }) => {
        await handlePaymentMutation.mutateAsync({
          usuarioId,
          mes: selectedMonth,
          ano: selectedYear,
          contaBancariaId,
          dataPagamento,
        });
      },
    });
  };

  const handleDesfazerPagamento = () => {
    openConfirmationDialog({
      title: getMessage("financeiro.confirmacao.reabrir.titulo"),
      description: getMessage("financeiro.confirmacao.reabrir.descricao"),
      confirmText: getMessage("financeiro.confirmacao.reabrir.botao"),
      variant: "destructive",
      onConfirm: async () => {
        await desfazerPagamentoMutation.mutateAsync({
          usuarioId,
          mes: selectedMonth,
          ano: selectedYear,
        });
        safeCloseDialog(closeConfirmationDialog);
      },
    });
  };

  return {
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    extrato,
    rawExtrato,
    isLoading,
    refetch,
    lancamentosConsolidados,
    can,
    isSuperAdmin,
    isConfirmingAdiantamento: confirmarAdiantamentoMutation.isPending,
    isPaying: handlePaymentMutation.isPending,
    isUndoingPayment: desfazerPagamentoMutation.isPending,
    handleDeleteOcorrencia,
    handleEditOcorrencia,
    handleConfirmarAdiantamento,
    handleDesconfirmarAdiantamento,
    handlePayment,
    handleDesfazerPagamento,
    openOccurrenceDetailsDialog,
  };
}
