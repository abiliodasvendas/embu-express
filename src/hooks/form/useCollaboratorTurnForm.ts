import { useCallback, useEffect, useMemo, useRef } from "react";
import { FieldErrors, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  useCollaborator,
  useCreateVinculo,
  useEmpresas,
  useUnidades,
  useUpdateVinculo,
} from "@/hooks";
import { useClientSelection } from "@/hooks/ui/useClientSelection";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { ColaboradorCliente } from "@/types/database";
import { getLocalDate } from "@/utils/date";
import { messages } from "@/constants/messages";
import { TurnFormData, TurnFormInput, turnSchema } from "@/schemas/turnSchema";
import { mockGenerator } from "@/utils/mocks/generator";

interface UseCollaboratorTurnFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collaboratorId: string;
  turnToEdit?: ColaboradorCliente | null;
  onSuccess?: () => void;
}

export function useCollaboratorTurnForm({
  open,
  onOpenChange,
  collaboratorId,
  turnToEdit,
  onSuccess,
}: UseCollaboratorTurnFormProps) {
  const empresasParams = useMemo(() => ({ ativo: "true" }), []);
  const { data: clients } = useClientSelection(undefined, { enabled: open });
  const { data: empresas } = useEmpresas(empresasParams, { enabled: open });
  const { data: collaborator } = useCollaborator(collaboratorId);

  const createVinculo = useCreateVinculo();
  const updateVinculo = useUpdateVinculo();

  const formatCurrency = (val: number | null = 0) => {
    if (val === null || val === 0) return "";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(val);
  };

  const form = useForm<TurnFormInput>({
    resolver: zodResolver(turnSchema),
    defaultValues: {
      cliente_id: "",
      unidade_id: "",
      empresa_id: "",
      valor_contrato: 0,
      valor_aluguel: 0,
      valor_bonus: 0,
      ajuda_custo: 0,
      valor_adiantamento: 0,
      taxa_entrega: 0,
      data_inicio: getLocalDate(),
      validar_localizacao: true,
      horarios: [],
    },
  });

  const watchedHorarios = useWatch({ control: form.control, name: "horarios" }) || [];

  useEffect(() => {
    if (open) {
      if (turnToEdit) {
        form.reset({
          cliente_id: turnToEdit.cliente_id?.toString() || "",
          unidade_id: turnToEdit.unidade_id?.toString() || "",
          empresa_id: turnToEdit.empresa_id.toString(),
          valor_contrato: formatCurrency(turnToEdit.valor_contrato || 0),
          valor_aluguel: formatCurrency(turnToEdit.valor_aluguel || 0),
          valor_bonus: formatCurrency(turnToEdit.valor_bonus || 0),
          ajuda_custo: formatCurrency(turnToEdit.ajuda_custo || 0),
          valor_adiantamento: formatCurrency(turnToEdit.valor_adiantamento || 0),
          taxa_entrega: formatCurrency(turnToEdit.taxa_entrega || 0),
          data_inicio: turnToEdit.data_inicio || getLocalDate(),
          validar_localizacao: turnToEdit.validar_localizacao !== false,
          horarios:
            turnToEdit.horarios?.map((h) => ({
              dia_semana: h.dia_semana,
              hora_inicio: (h.hora_inicio || "").substring(0, 5),
              hora_fim: (h.hora_fim || "").substring(0, 5),
              tolerancia_pausa_min: h.tolerancia_pausa_min || 0,
            })) || [],
        });
      } else {
        form.reset({
          cliente_id: "",
          unidade_id: "",
          empresa_id: "",
          valor_contrato: "",
          valor_aluguel: "",
          valor_bonus: "",
          ajuda_custo: "",
          valor_adiantamento: "",
          taxa_entrega: "",
          data_inicio: getLocalDate(),
          validar_localizacao: true,
          horarios: [],
        });
      }
    } else {
      form.reset();
    }
  }, [open, turnToEdit, collaborator]);

  const selectedClientId = form.watch("cliente_id");
  const { data: unidades } = useUnidades(
    selectedClientId ? parseInt(selectedClientId) : undefined,
    { enabled: open }
  );

  useEffect(() => {
    if (unidades && unidades.length === 1 && !form.getValues("unidade_id")) {
      form.setValue("unidade_id", unidades[0].id.toString());
    }
  }, [unidades, form]);

  const selectedUnidadeId = form.watch("unidade_id");
  const selectedUnidade = unidades?.find(
    (u) => u.id.toString() === selectedUnidadeId
  );
  const clientScale = selectedUnidade?.escala_semanal || [1, 2, 3, 4, 5, 6, 7];

  const lastUnidadeRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      lastUnidadeRef.current = null;
      return;
    }

    if (!turnToEdit && selectedUnidadeId && selectedUnidadeId !== lastUnidadeRef.current && selectedUnidade) {
      lastUnidadeRef.current = selectedUnidadeId;

      const initialHorarios = (selectedUnidade.escala_semanal || [1, 2, 3, 4, 5, 6, 7]).map((diaId) => ({
        dia_semana: diaId,
        hora_inicio: "",
        hora_fim: "",
        tolerancia_pausa_min: "",
      }));
      form.setValue("horarios", initialHorarios, { shouldValidate: true });
      return;
    }

    if (selectedUnidadeId && selectedUnidade && (turnToEdit || selectedUnidadeId === lastUnidadeRef.current)) {
      const current = form.getValues("horarios") || [];
      const updated = current.filter((h) => clientScale.includes(h.dia_semana));
      if (updated.length !== current.length) {
        form.setValue("horarios", updated);
      }
    } else if (!selectedUnidadeId && !turnToEdit && open) {
      lastUnidadeRef.current = null;
      const current = form.getValues("horarios");
      if (current && current.length > 0) {
        form.setValue("horarios", [], { shouldValidate: true });
      }
    }
  }, [selectedUnidadeId, selectedUnidade, clientScale, form, turnToEdit, open]);

  const handleClose = () => {
    safeCloseDialog(() => onOpenChange(false));
  };

  const handleFillMagic = () => {
    const data = mockGenerator.turn();
    const empresa = empresas?.[0];

    form.reset({
      ...form.getValues(),
      ...data,
      empresa_id: empresa?.id.toString() || "",
      valor_contrato: formatCurrency(data.valor_contrato),
      valor_aluguel: formatCurrency(data.valor_aluguel),
      ajuda_custo: formatCurrency(data.ajuda_custo),
      valor_bonus: formatCurrency(data.valor_bonus),
      taxa_entrega: formatCurrency(data.taxa_entrega),
      data_inicio: getLocalDate(),
    });
  };

  const onFormError = (_errors: FieldErrors<TurnFormInput>) => {
    toast.error(messages.validacao.formularioComErros);
  };

  const onSubmit = async (values: TurnFormInput) => {
    try {
      const parsedValues = turnSchema.parse(values) as TurnFormData;

      const data = {
        ...parsedValues,
        colaborador_id: collaboratorId,
        cliente_id: parseInt(parsedValues.cliente_id),
        unidade_id: parseInt(parsedValues.unidade_id),
        empresa_id: parseInt(parsedValues.empresa_id),
        validar_localizacao: parsedValues.validar_localizacao,
        horarios: parsedValues.horarios,
      };

      if (turnToEdit) {
        await updateVinculo.mutateAsync({ id: turnToEdit.id, ...data });
      } else {
        await createVinculo.mutateAsync(data);
      }
      onSuccess?.();
      handleClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = err.response?.data?.error || err.message || "";
      toast.error(
        errorMessage ||
          (turnToEdit
            ? messages.cliente.erro.atualizar
            : messages.cliente.erro.criar)
      );
    }
  };

  const toggleDia = useCallback(
    (dia: number, checked: boolean) => {
      if (!selectedUnidadeId && !turnToEdit) return;

      const current = form.getValues("horarios") || [];
      if (checked) {
        const updated = [
          ...current,
          {
            dia_semana: dia,
            hora_inicio: "",
            hora_fim: "",
            tolerancia_pausa_min: "",
          },
        ].sort((a, b) => a.dia_semana - b.dia_semana);

        form.setValue("horarios", updated, {
          shouldValidate: true,
          shouldDirty: true,
        });
      } else {
        form.setValue(
          "horarios",
          current.filter((h) => h.dia_semana !== dia),
          { shouldValidate: true, shouldDirty: true }
        );
      }
    },
    [form, selectedUnidadeId, turnToEdit]
  );

  const handleRepeatAll = useCallback(() => {
    const current = form.getValues("horarios") || [];
    if (current.length < 2) return;

    const first = current[0];
    const updated = current.map((h, i) => {
      if (i === 0) return h;
      return {
        ...h,
        hora_inicio: first.hora_inicio,
        hora_fim: first.hora_fim,
        tolerancia_pausa_min: first.tolerancia_pausa_min,
      };
    });

    form.setValue("horarios", updated, {
      shouldValidate: true,
      shouldDirty: true,
    });
    toast.success("Horários replicados para todos os dias!");
  }, [form]);

  const getHorarioError = (idx: number) => {
    const errors = form.formState.errors.horarios;
    if (Array.isArray(errors)) {
      return errors[idx] as
        | {
            hora_inicio?: { message?: string };
            hora_fim?: { message?: string };
            tolerancia_pausa_min?: { message?: string };
          }
        | undefined;
    }
    return undefined;
  };

  const isSubmitting = createVinculo.isPending || updateVinculo.isPending;

  return {
    form,
    collaborator,
    clients,
    unidades,
    empresas,
    selectedClientId,
    selectedUnidadeId,
    clientScale,
    watchedHorarios,
    isSubmitting,
    handleClose,
    handleFillMagic,
    onSubmit,
    onFormError,
    toggleDia,
    handleRepeatAll,
    getHorarioError,
  };
}

export type CollaboratorTurnFormReturn = ReturnType<typeof useCollaboratorTurnForm>;
