import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { useLayout } from "@/contexts/LayoutContext";
import { safeCloseDialog } from "@/hooks";
import { useFinanceiro } from "@/hooks/api/useFinanceiro";
import { useFinanceiroMutations } from "@/hooks/api/useFinanceiroMutations";
import { useDeleteOcorrencia } from "@/hooks/api/useOcorrenciaMutations";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useDateFilters } from "@/hooks/ui/useFilters";
import { Ocorrencia } from "@/types/database";
import { ExtratoMensal, ResumoClienteFinanceiro } from "@/types/financeiro";
import { OccurrenceFormMode } from "@/types/enums";
import {
  CALENDARIO_STATUS,
  LANCAMENTO_TIPO,
} from "@/constants/financeiro.constants";
import { getMessage } from "@/constants/messages";
import { formatCurrency } from "@/utils/formatters/currency";

export type OcorrenciaComTipo = Ocorrencia & {
  tipo?: { descricao?: string };
  is_virtual?: boolean;
  criado_por_usuario?: { nome_completo?: string };
};

export interface LancamentoConvenioItem {
  id?: string;
  convenio?: { nome?: string };
  observacao?: string;
  data_lancamento: string;
  valor: number | string;
}

export interface LancamentoConsolidado {
  id: string;
  grupo: string;
  descricao: string;
  tipo: "ENTRADA" | "SAIDA";
  valor: number;
}

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

    const resumoPorCliente = (rawExtrato.resumo_por_cliente || []).map((r) => {
      const baseFixa =
        (r.valores_fixos?.contrato || 0) +
        (r.valores_fixos?.ajuda_custo || 0) +
        (r.valores_fixos?.aluguel || 0);
      const valorFixo = parseFloat(baseFixa.toFixed(2));
      const diasIntegrais = r.dias_base_mes || r.dias_esperados_turno || 26;

      return {
        ...r,
        ausencias: 0,
        datas_ausencia: [],
        dias_base_mes: diasIntegrais,
        dias_esperados_turno: diasIntegrais,
        dias_trabalhados: diasIntegrais,
        debitos_ocorrencia: 0,
        creditos_ocorrencia: 0,
        valor_calculado: valorFixo,
        saldo_fixo_original: valorFixo,
        valores_fixos: {
          ...r.valores_fixos,
          bonus: 0,
          bonus_config: 0,
          adiantamento: 0,
          adiantamento_config: 0,
        },
        calendario_visual: (r.calendario_visual || []).map((c) =>
          c.status === CALENDARIO_STATUS.SEM_ATIVIDADE ||
          c.status === CALENDARIO_STATUS.NAO_VIGENTE
            ? { ...c, status: CALENDARIO_STATUS.TRABALHADO }
            : c,
        ),
      };
    });

    const totalTurnos = resumoPorCliente.reduce((acc, r) => acc + r.valor_calculado, 0);
    const saldoFinal = parseFloat(totalTurnos.toFixed(2));

    return {
      ...rawExtrato,
      resumo_por_cliente: resumoPorCliente,
      ocorrencias: [],
      ocorrencias_avulsas: { creditos: 0, debitos: 0, saldo: 0 },
      lancamentos_convenios: [],
      mei_consolidado: {
        valor_original: 0,
        valor_calculado: 0,
        dias_base: rawExtrato.mei_consolidado?.dias_base || 26,
        dias_trabalhados: rawExtrato.mei_consolidado?.dias_base || 26,
        datas_trabalhadas: [],
      },
      totais: {
        total_turnos: saldoFinal,
        total_mei: 0,
        total_avulso: 0,
        total_adiantamento: 0,
        saldo_final: saldoFinal,
      },
    };
  }, [rawExtrato, modoComprovanteRenda]);

  const {
    handlePaymentMutation,
    confirmarAdiantamentoMutation,
    desconfirmarAdiantamentoMutation,
    desfazerPagamentoMutation,
  } = useFinanceiroMutations();

  const lancamentosConsolidados = useMemo<LancamentoConsolidado[]>(() => {
    if (!extrato) return [];
    const items: LancamentoConsolidado[] = [];

    (extrato.resumo_por_cliente || []).forEach((resumo, idx) => {
      const baseBrutaFixa =
        (resumo.valores_fixos?.contrato || 0) +
        (resumo.valores_fixos?.ajuda_custo || 0) +
        (resumo.valores_fixos?.aluguel || 0);
      const valorDia = resumo.dias_base_mes > 0 ? baseBrutaFixa / resumo.dias_base_mes : 0;
      const valorBrutoVigente = valorDia * resumo.dias_esperados_turno;

      if (valorBrutoVigente > 0) {
        items.push({
          id: `turno-base-${idx}`,
          grupo: `Turno (${resumo.nome_fantasia || "Cliente"})`,
          descricao: `Base Contratual Proporcional (${resumo.dias_esperados_turno}/${resumo.dias_base_mes} dias de Atividade)`,
          tipo: "ENTRADA",
          valor: parseFloat(valorBrutoVigente.toFixed(2)),
        });
      }

      if (resumo.ausencias > 0) {
        const valorAusencia = valorDia * resumo.ausencias;
        items.push({
          id: `turno-ausencia-${idx}`,
          grupo: `Turno (${resumo.nome_fantasia || "Cliente"})`,
          descricao: `Dedução por Sem Atividade (${resumo.ausencias} dia(s))`,
          tipo: "SAIDA",
          valor: parseFloat(valorAusencia.toFixed(2)),
        });
      }

      if (resumo.valores_fixos?.bonus > 0) {
        items.push({
          id: `turno-bonus-${idx}`,
          grupo: `Turno (${resumo.nome_fantasia || "Cliente"})`,
          descricao: `Bônus de Atividade / Assiduidade`,
          tipo: "ENTRADA",
          valor: parseFloat(resumo.valores_fixos.bonus.toFixed(2)),
        });
      }

      if (resumo.valores_fixos?.adiantamento > 0) {
        items.push({
          id: `turno-adiantamento-${idx}`,
          grupo: `Turno (${resumo.nome_fantasia || "Cliente"})`,
          descricao: `Adiantamento Quinzenal`,
          tipo: "SAIDA",
          valor: parseFloat(resumo.valores_fixos.adiantamento.toFixed(2)),
        });
      }
    });

    if (extrato.totais?.total_mei > 0) {
      items.push({
        id: "mei-consolidado",
        grupo: "MEI",
        descricao: `Ajuda de Custo MEI (${extrato.mei_consolidado?.dias_trabalhados || 0}/${extrato.mei_consolidado?.dias_base || 26} dias)`,
        tipo: "ENTRADA",
        valor: parseFloat(extrato.totais.total_mei.toFixed(2)),
      });
    }

    ((extrato.ocorrencias as OcorrenciaComTipo[]) || [])
      .filter((occ) => !occ.colaborador_cliente_id && occ.impacto_financeiro && !occ.is_virtual)
      .forEach((occ, idx) => {
        const dataBr = occ.data_ocorrencia
          ? format(parseISO(occ.data_ocorrencia), "dd/MM/yyyy")
          : "";
        items.push({
          id: `ocorrencia-avulsa-${occ.id || idx}`,
          grupo: "Ocorrência Avulsa",
          descricao: `${occ.tipo?.descricao || occ.observacao || "Ocorrência"}${
            occ.observacao && occ.tipo?.descricao ? " - " + occ.observacao : ""
          }${dataBr ? " (" + dataBr + ")" : ""}`,
          tipo: occ.tipo_lancamento === LANCAMENTO_TIPO.ENTRADA ? "ENTRADA" : "SAIDA",
          valor: Number(occ.valor || 0),
        });
      });

    (((extrato.lancamentos_convenios as LancamentoConvenioItem[]) || [])).forEach((l, idx) => {
      const dataBr = l.data_lancamento
        ? format(parseISO(l.data_lancamento), "dd/MM/yyyy")
        : "";
      items.push({
        id: `convenio-${l.id || idx}`,
        grupo: "Convênio",
        descricao: `${l.convenio?.nome || "Oficina/Parceiro"}${
          l.observacao ? " - " + l.observacao : ""
        }${dataBr ? " (" + dataBr + ")" : ""}`,
        tipo: "SAIDA",
        valor: Number(l.valor || 0),
      });
    });

    return items;
  }, [extrato]);

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
      extrato.totais?.total_adiantamento ??
      extrato.resumo_por_cliente?.reduce(
        (acc: number, r: ResumoClienteFinanceiro) =>
          acc + Number(r.valores_fixos?.adiantamento_config || 0),
        0,
      ) ??
      0;

    openConfirmarAdiantamentoDialog({
      valorSugerido: valorTotalAdiantamento,
      isLoading: confirmarAdiantamentoMutation.isPending,
      onConfirm: async (valorInformado: number) => {
        await confirmarAdiantamentoMutation.mutateAsync({
          usuarioId,
          mes: selectedMonth,
          ano: selectedYear,
          valor: valorInformado,
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
    openConfirmationDialog({
      title: getMessage("financeiro.confirmacao.titulo"),
      description: `${getMessage("financeiro.confirmacao.descricao")} (${formatCurrency(
        extrato.totais?.saldo_final || 0,
      )})`,
      confirmText: getMessage("financeiro.confirmacao.botao"),
      onConfirm: async () => {
        await handlePaymentMutation.mutateAsync({
          usuarioId,
          mes: selectedMonth,
          ano: selectedYear,
        });
        safeCloseDialog(closeConfirmationDialog);
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
