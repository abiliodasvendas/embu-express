import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { faturaFormSchema, FaturaFormData } from "@/schemas/faturaSchema";
import { Client, Empresa, FaturaCliente } from "@/types/database";
import {
  STATUS_FATURA,
  TIPO_PERIODO_FATURA,
  TipoPeriodoFaturaType,
  PERIODICIDADE_FATURAMENTO,
} from "@/constants/financeiro.constants";
import { toLocalDateString } from "@/utils/formatters/date";
import { useClients } from "@/hooks/api/useClients";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { useFaturas } from "@/hooks/api/useFaturamento";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { mockGenerator } from "@/utils/mocks/generator";
import {
  getSemanasCompetenciaUI,
  getQuinzenasCompetenciaUI,
  getMensalCompetenciaUI,
} from "@/utils/domain/periodoFaturamentoUtils";

interface UseFaturaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faturaToEdit?: FaturaCliente | null;
  onSuccess?: () => void | Promise<void>;
}

export function useFaturaForm({
  open,
  onOpenChange,
  faturaToEdit,
  onSuccess,
}: UseFaturaFormProps) {
  const hoje = new Date();

  const { createMutation, updateMutation } = useFaturas();
  const { data: clientsResponse = [] } = useClients();
  const { data: empresasResponse = [] } = useEmpresas();

  const clientes: Client[] = Array.isArray(clientsResponse)
    ? clientsResponse
    : (clientsResponse as { data?: Client[] })?.data || [];

  const empresas: Empresa[] = Array.isArray(empresasResponse)
    ? empresasResponse
    : (empresasResponse as { data?: Empresa[] })?.data || [];

  const form = useForm<FaturaFormData>({
    resolver: zodResolver(faturaFormSchema),
    defaultValues: {
      cliente_id: 0,
      empresa_id: 0,
      mes_competencia: hoje.getMonth() + 1,
      ano_competencia: hoje.getFullYear(),
      tipo_periodo: TIPO_PERIODO_FATURA.QUINZENAL,
      numero_periodo: 1,
      data_emissao: toLocalDateString(hoje),
      data_vencimento: "",
      valor_faturado: 0,
      status: STATUS_FATURA.PENDENTE,
      numero_os: "",
      observacoes: "",
    },
  });

  const selectedTipoPeriodo = form.watch("tipo_periodo");
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      if (faturaToEdit) {
        const statusNormalizado: FaturaFormData["status"] =
          faturaToEdit.status === STATUS_FATURA.LIQUIDADA
            ? STATUS_FATURA.LIQUIDADA
            : faturaToEdit.status === STATUS_FATURA.PAGO_PARCIAL
            ? STATUS_FATURA.PAGO_PARCIAL
            : faturaToEdit.status === STATUS_FATURA.CANCELADA
            ? STATUS_FATURA.CANCELADA
            : STATUS_FATURA.PENDENTE;

        form.reset({
          cliente_id: faturaToEdit.cliente_id,
          empresa_id: faturaToEdit.empresa_id,
          mes_competencia: faturaToEdit.mes_competencia,
          ano_competencia: faturaToEdit.ano_competencia,
          tipo_periodo: faturaToEdit.tipo_periodo || TIPO_PERIODO_FATURA.QUINZENAL,
          numero_periodo: faturaToEdit.numero_periodo || faturaToEdit.quinzena || 1,
          data_emissao: faturaToEdit.data_emissao,
          data_vencimento: faturaToEdit.data_vencimento,
          valor_faturado: faturaToEdit.valor_faturado,
          status: statusNormalizado,
          numero_os: faturaToEdit.numero_os || "",
          observacoes: faturaToEdit.observacoes || "",
        });
      } else {
        form.reset({
          cliente_id: 0,
          empresa_id: 0,
          mes_competencia: hoje.getMonth() + 1,
          ano_competencia: hoje.getFullYear(),
          tipo_periodo: TIPO_PERIODO_FATURA.QUINZENAL,
          numero_periodo: 1,
          data_emissao: toLocalDateString(hoje),
          data_vencimento: "",
          valor_faturado: 0,
          status: STATUS_FATURA.PENDENTE,
          numero_os: "",
          observacoes: "",
        });
      }
    }
  }, [open, faturaToEdit, form]);

  const handleClienteChange = (numId: number) => {
    form.setValue("cliente_id", numId, { shouldValidate: true });
    const clienteSelecionado = clientes.find((c) => c.id === numId);
    if (clienteSelecionado?.empresa_emissora_padrao_id) {
      form.setValue("empresa_id", clienteSelecionado.empresa_emissora_padrao_id, { shouldValidate: true });
    }
    const mes = form.getValues("mes_competencia") || hoje.getMonth() + 1;
    const ano = form.getValues("ano_competencia") || hoje.getFullYear();

    let periodicidadeFinal: TipoPeriodoFaturaType = TIPO_PERIODO_FATURA.QUINZENAL;
    if (clienteSelecionado?.periodicidade) {
      if (clienteSelecionado.periodicidade === PERIODICIDADE_FATURAMENTO.SEMANAL) {
        periodicidadeFinal = TIPO_PERIODO_FATURA.SEMANAL;
      } else if (clienteSelecionado.periodicidade === PERIODICIDADE_FATURAMENTO.MENSAL) {
        periodicidadeFinal = TIPO_PERIODO_FATURA.MENSAL;
      } else {
        periodicidadeFinal = TIPO_PERIODO_FATURA.QUINZENAL;
      }
      form.setValue("tipo_periodo", periodicidadeFinal, { shouldValidate: true });
      form.setValue("numero_periodo", 1);
    }

    const valorCadastrado = Number(
      clienteSelecionado?.valor_contrato_mensal || clienteSelecionado?.valor_base || 0
    );

    let valorSugerido = valorCadastrado;
    if (periodicidadeFinal === TIPO_PERIODO_FATURA.QUINZENAL) {
      valorSugerido = Math.round((valorCadastrado / 2) * 100) / 100;
    }

    if (valorSugerido > 0) {
      form.setValue("valor_faturado", valorSugerido, { shouldValidate: true });
    }

    if (!form.getValues("data_vencimento")) {
      if (periodicidadeFinal === TIPO_PERIODO_FATURA.SEMANAL) {
        const s1 = getSemanasCompetenciaUI(mes, ano)[0];
        if (s1) form.setValue("data_vencimento", s1.data_vencimento, { shouldValidate: true });
      } else if (periodicidadeFinal === TIPO_PERIODO_FATURA.QUINZENAL) {
        const q1 = getQuinzenasCompetenciaUI(mes, ano)[0];
        if (q1) form.setValue("data_vencimento", q1.data_vencimento, { shouldValidate: true });
      } else {
        const m1 = getMensalCompetenciaUI(
          mes,
          ano,
          clienteSelecionado?.dia_vencimento_padrao || 10
        )[0];
        if (m1) form.setValue("data_vencimento", m1.data_vencimento, { shouldValidate: true });
      }
    }
  };

  const onSubmit = async (values: FaturaFormData) => {
    const mes = values.mes_competencia;
    const ano = values.ano_competencia;
    const tipo = values.tipo_periodo;
    const num = tipo === TIPO_PERIODO_FATURA.MENSAL ? 1 : values.numero_periodo;

    let dataInicioApuracao = `${ano}-${String(mes).padStart(2, "0")}-01`;
    let dataFimApuracao = `${ano}-${String(mes).padStart(2, "0")}-15`;

    if (tipo === TIPO_PERIODO_FATURA.SEMANAL) {
      const semanas = getSemanasCompetenciaUI(mes, ano);
      const sem = semanas.find((s) => s.numero_periodo === num) || semanas[0];
      if (sem) {
        dataInicioApuracao = sem.data_inicio;
        dataFimApuracao = sem.data_fim;
      }
    } else if (tipo === TIPO_PERIODO_FATURA.MENSAL) {
      const mensal = getMensalCompetenciaUI(mes, ano)[0];
      if (mensal) {
        dataInicioApuracao = mensal.data_inicio;
        dataFimApuracao = mensal.data_fim;
      }
    } else {
      const quinzenas = getQuinzenasCompetenciaUI(mes, ano);
      const q = quinzenas.find((item) => item.numero_periodo === num) || quinzenas[0];
      if (q) {
        dataInicioApuracao = q.data_inicio;
        dataFimApuracao = q.data_fim;
      }
    }

    const payload: Partial<FaturaCliente> = {
      cliente_id: values.cliente_id,
      empresa_id: values.empresa_id,
      mes_competencia: values.mes_competencia,
      ano_competencia: values.ano_competencia,
      tipo_periodo: values.tipo_periodo,
      numero_periodo: num,
      quinzena: tipo === TIPO_PERIODO_FATURA.QUINZENAL ? num : null,
      data_inicio_apuracao: dataInicioApuracao,
      data_fim_apuracao: dataFimApuracao,
      data_emissao: values.data_emissao,
      data_vencimento: values.data_vencimento,
      valor_faturado: values.valor_faturado,
      status: values.status,
      numero_os: values.numero_os?.trim() || null,
      observacoes: values.observacoes?.trim() || null,
    };

    try {
      if (faturaToEdit) {
        await updateMutation.mutateAsync({ id: faturaToEdit.id, data: payload });
        toast.success("Fatura atualizada com sucesso!");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Fatura de cobrança emitida com sucesso!");
      }
      safeCloseDialog(() => onOpenChange(false));
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : err instanceof Error
          ? err.message
          : "Erro ao salvar fatura.";
      toast.error(msg);
    }
  };

  const handleFillMock = () => {
    const primeiroCliente = clientes[0]?.id || 1;
    const primeiraEmpresa = empresas[0]?.id || 1;
    const mockData = mockGenerator.fatura(primeiroCliente, primeiraEmpresa);
    form.reset({
      ...mockData,
      cliente_id: primeiroCliente,
      empresa_id: primeiraEmpresa,
    });
  };

  const handleClose = () => {
    if (isPending) return;
    safeCloseDialog(() => onOpenChange(false));
  };

  return {
    form,
    clientes,
    empresas,
    selectedTipoPeriodo,
    isPending,
    handleClienteChange,
    onSubmit,
    handleClose,
    handleFillMock,
  };
}
