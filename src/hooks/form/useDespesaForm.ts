import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { despesaFormSchema, DespesaFormData } from "@/schemas/despesaSchema";
import { DespesaOperacional } from "@/types/database";
import { CATEGORIA_DESPESA, STATUS_DESPESA, DESPESA_ESCOPO_ACAO } from "@/constants/financeiro.constants";
import { toLocalDateString } from "@/utils/formatters/date";
import { useDespesas } from "@/hooks/api/useDespesas";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { useContasBancarias } from "@/hooks/api/useContasBancarias";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { mockGenerator } from "@/utils/mocks/generator";

interface UseDespesaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  despesaToEdit?: DespesaOperacional | null;
  onSuccess?: () => void | Promise<void>;
}

export function useDespesaForm({
  open,
  onOpenChange,
  despesaToEdit,
  onSuccess,
}: UseDespesaFormProps) {
  const hoje = new Date();

  const { createMutation, updateMutation } = useDespesas();
  const { data: empresas = [] } = useEmpresas({ ativo: "true" });
  const { contas = [] } = useContasBancarias();

  const form = useForm<DespesaFormData>({
    resolver: zodResolver(despesaFormSchema),
    defaultValues: {
      descricao: "",
      categoria: CATEGORIA_DESPESA.DESPESA_FIXA,
      empresa_id: "holding",
      is_holding: true,
      mes_competencia: hoje.getMonth() + 1,
      ano_competencia: hoje.getFullYear(),
      data_vencimento: toLocalDateString(hoje),
      valor_previsto: 0,
      status: STATUS_DESPESA.PENDENTE,
      conta_bancaria_id: "",
      valor_pago: 0,
      data_pagamento: "",
      is_parcelado: false,
      quantidade_parcelas: undefined,
      is_recorrente: false,
      meses_recorrencia: undefined,
      escopo: DESPESA_ESCOPO_ACAO.UNICA,
    },
  });

  const status = form.watch("status");
  const selectedEmpresaId = form.watch("empresa_id");
  const isPending = createMutation.isPending || updateMutation.isPending;

  const contasFiltradas = selectedEmpresaId && selectedEmpresaId !== "holding"
    ? contas.filter((c) => c.empresa_id === Number(selectedEmpresaId))
    : contas;

  useEffect(() => {
    if (open) {
      if (despesaToEdit) {
        form.reset({
          descricao: despesaToEdit.descricao,
          categoria: despesaToEdit.categoria,
          empresa_id: despesaToEdit.empresa_id ? String(despesaToEdit.empresa_id) : "holding",
          is_holding: despesaToEdit.is_holding,
          mes_competencia: despesaToEdit.mes_competencia,
          ano_competencia: despesaToEdit.ano_competencia,
          data_vencimento: despesaToEdit.data_vencimento,
          valor_previsto: despesaToEdit.valor_previsto,
          status: despesaToEdit.status,
          conta_bancaria_id: despesaToEdit.conta_bancaria_id || "",
          valor_pago: despesaToEdit.valor_pago || 0,
          data_pagamento: despesaToEdit.data_pagamento || "",
          is_parcelado: false,
          quantidade_parcelas: undefined,
          is_recorrente: !!despesaToEdit.is_recorrente,
          meses_recorrencia: undefined,
          escopo: DESPESA_ESCOPO_ACAO.UNICA,
        });
      } else {
        form.reset({
          descricao: "",
          categoria: CATEGORIA_DESPESA.DESPESA_FIXA,
          empresa_id: "holding",
          is_holding: true,
          mes_competencia: hoje.getMonth() + 1,
          ano_competencia: hoje.getFullYear(),
          data_vencimento: toLocalDateString(hoje),
          valor_previsto: 0,
          status: STATUS_DESPESA.PENDENTE,
          conta_bancaria_id: "",
          valor_pago: 0,
          data_pagamento: "",
          is_parcelado: false,
          quantidade_parcelas: undefined,
          is_recorrente: false,
          meses_recorrencia: undefined,
          escopo: DESPESA_ESCOPO_ACAO.UNICA,
        });
      }
    }
  }, [open, despesaToEdit, form]);

  const onSubmit = async (values: DespesaFormData) => {
    const isHolding = values.empresa_id === "holding";
    const payload = {
      descricao: values.descricao.trim(),
      categoria: values.categoria,
      is_holding: isHolding,
      empresa_id: isHolding ? null : Number(values.empresa_id),
      conta_bancaria_id: values.conta_bancaria_id || null,
      mes_competencia: values.mes_competencia,
      ano_competencia: values.ano_competencia,
      data_vencimento: values.data_vencimento,
      valor_previsto: values.valor_previsto,
      status: values.status,
      valor_pago:
        values.status === STATUS_DESPESA.PAGO
          ? values.valor_pago || values.valor_previsto
          : null,
      data_pagamento:
        values.status === STATUS_DESPESA.PAGO
          ? values.data_pagamento || values.data_vencimento
          : null,
      is_parcelado: !despesaToEdit ? values.is_parcelado : undefined,
      quantidade_parcelas: !despesaToEdit && values.is_parcelado ? values.quantidade_parcelas : undefined,
      is_recorrente: !despesaToEdit ? values.is_recorrente : undefined,
      escopo: despesaToEdit ? values.escopo : undefined,
    };

    try {
      if (despesaToEdit) {
        await updateMutation.mutateAsync({ id: despesaToEdit.id, data: payload });
        toast.success("Despesa atualizada com sucesso!");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Despesa cadastrada com sucesso!");
      }
      safeCloseDialog(() => onOpenChange(false));
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : err instanceof Error
          ? err.message
          : "Erro ao salvar despesa.";
      toast.error(msg);
    }
  };

  const handleFillMock = () => {
    const mockData = mockGenerator.despesa(empresas[0]?.id);
    form.reset({
      ...mockData,
      conta_bancaria_id: "",
      is_parcelado: false,
      quantidade_parcelas: undefined,
      is_recorrente: false,
      meses_recorrencia: undefined,
      valor_pago: 0,
      data_pagamento: "",
      escopo: DESPESA_ESCOPO_ACAO.UNICA,
    });
  };

  const handleClose = () => {
    if (isPending) return;
    safeCloseDialog(() => onOpenChange(false));
  };

  return {
    form,
    empresas,
    contas: contasFiltradas,
    status,
    isPending,
    onSubmit,
    handleClose,
    handleFillMock,
  };
}
