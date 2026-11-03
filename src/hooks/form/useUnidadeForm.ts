import { useEffect, useState } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UnidadeFormData, unidadeSchema } from "@/schemas/unidadeSchema";
import type { Unidade } from "@/types/database";
import { useCreateUnidade, useUpdateUnidade } from "@/hooks/api/useUnidadeMutations";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { formatarCEP } from "@/utils/formatters";
import { cnpjMask } from "@/utils/masks";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { messages } from "@/constants/messages";
import { PERIODICIDADE_FATURAMENTO, TIPO_COBRANCA_CLIENTE } from "@/constants/financeiro.constants";

export interface UseUnidadeFormProps {
  isDialogOpen: boolean;
  clienteId: number;
  editingUnidade?: Unidade | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function useUnidadeForm({
  isDialogOpen,
  clienteId,
  editingUnidade = null,
  onClose,
  onSuccess,
}: UseUnidadeFormProps) {
  const [isCepLoading, setIsCepLoading] = useState(false);

  const createUnidade = useCreateUnidade();
  const updateUnidade = useUpdateUnidade();

  const form = useForm<UnidadeFormData>({
    resolver: zodResolver(unidadeSchema),
    defaultValues: {
      cliente_id: clienteId,
      nome_unidade: "",
      razao_social: "",
      cnpj: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      km_contratados: 0,
      escala_semanal: [],
      ativo: true,
      valor_contrato_mensal: 0,
      periodicidade: PERIODICIDADE_FATURAMENTO.QUINZENAL,
      dia_vencimento_padrao: undefined as unknown as number,
      dia_vencimento_segunda_quinzena: undefined as unknown as number,
      empresa_emissora_padrao_id: undefined as unknown as number,
      conta_bancaria_padrao_id: "",
      tipo_cobranca: TIPO_COBRANCA_CLIENTE.FIXO_MENSAL,
    },
  });

  useEffect(() => {
    if (isDialogOpen) {
      if (editingUnidade) {
        form.reset({
          cliente_id: editingUnidade.cliente_id,
          nome_unidade: editingUnidade.nome_unidade,
          razao_social: editingUnidade.razao_social,
          cnpj: cnpjMask(editingUnidade.cnpj),
          cep: formatarCEP(editingUnidade.cep),
          logradouro: editingUnidade.logradouro,
          numero: editingUnidade.numero,
          complemento: editingUnidade.complemento || "",
          bairro: editingUnidade.bairro,
          cidade: editingUnidade.cidade,
          estado: editingUnidade.estado,
          km_contratados: editingUnidade.km_contratados,
          escala_semanal: editingUnidade.escala_semanal || [],
          ativo: editingUnidade.ativo,
          valor_contrato_mensal: Number(editingUnidade.valor_contrato_mensal || 0),
          periodicidade: (editingUnidade.periodicidade as UnidadeFormData["periodicidade"]) || PERIODICIDADE_FATURAMENTO.QUINZENAL,
          dia_vencimento_padrao: editingUnidade.dia_vencimento_padrao ?? (undefined as unknown as number),
          dia_vencimento_segunda_quinzena: editingUnidade.dia_vencimento_segunda_quinzena ?? (undefined as unknown as number),
          empresa_emissora_padrao_id: editingUnidade.empresa_emissora_padrao_id ? Number(editingUnidade.empresa_emissora_padrao_id) : (undefined as unknown as number),
          conta_bancaria_padrao_id: editingUnidade.conta_bancaria_padrao_id || "",
          tipo_cobranca: TIPO_COBRANCA_CLIENTE.FIXO_MENSAL,
        });
      } else {
        form.reset({
          cliente_id: clienteId,
          nome_unidade: "",
          razao_social: "",
          cnpj: "",
          cep: "",
          logradouro: "",
          numero: "",
          complemento: "",
          bairro: "",
          cidade: "",
          estado: "",
          km_contratados: 0,
          escala_semanal: [],
          ativo: true,
          valor_contrato_mensal: 0,
          periodicidade: PERIODICIDADE_FATURAMENTO.QUINZENAL,
          dia_vencimento_padrao: undefined as unknown as number,
          dia_vencimento_segunda_quinzena: undefined as unknown as number,
          empresa_emissora_padrao_id: undefined as unknown as number,
          conta_bancaria_padrao_id: "",
          tipo_cobranca: TIPO_COBRANCA_CLIENTE.FIXO_MENSAL,
        });
      }
    }
  }, [isDialogOpen, editingUnidade, clienteId, form]);

  const onFormError = (_errors: FieldErrors<UnidadeFormData>) => {
    toast.error(messages.validacao.formularioComErros);
  };

  const handleFillMagic = () => {
    const data = mockGenerator.unidade(clienteId);
    form.reset({
      ...data,
      cnpj: cnpjMask(data.cnpj),
      valor_contrato_mensal: 5000,
      periodicidade: PERIODICIDADE_FATURAMENTO.QUINZENAL,
      dia_vencimento_padrao: 16,
      empresa_emissora_padrao_id: null,
      conta_bancaria_padrao_id: null,
      tipo_cobranca: TIPO_COBRANCA_CLIENTE.FIXO_MENSAL,
    });
  };

  const onSubmit = async (values: UnidadeFormData) => {
    try {
      if (editingUnidade) {
        await updateUnidade.mutateAsync({
          id: editingUnidade.id,
          ...values,
        });
      } else {
        await createUnidade.mutateAsync({
          ...values,
          cliente_id: clienteId,
        });
      }
      safeCloseDialog(onClose);
      onSuccess?.();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = err.response?.data?.error || err.message || "";
      toast.error(errorMessage || "Erro ao salvar unidade");
    }
  };

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const isPending = createUnidade.isPending || updateUnidade.isPending;

  return {
    form,
    isPending,
    isCepLoading,
    setIsCepLoading,
    handleFillMagic,
    onSubmit,
    onFormError,
    handleClose,
  };
}
