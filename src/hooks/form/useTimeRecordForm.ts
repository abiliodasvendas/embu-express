import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { useActiveCollaborators } from "@/hooks/api/useCollaborators";
import { useCreatePonto, useUpdatePonto } from "@/hooks/api/usePontoMutations";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { ManualTimeRecordFormValues, manualTimeRecordSchema } from "@/schemas/pontoSchema";
import { RegistroPonto } from "@/types/database";
import { kmToNumber } from "@/utils/masks";
import { TimeRules } from "@/utils/timeRules";
import { isMotoboy } from "@/utils/business/roles";

interface UseTimeRecordFormParams {
  isOpen: boolean;
  onClose: () => void;
  record?: RegistroPonto | null;
}

export function useTimeRecordForm({ isOpen, onClose, record }: UseTimeRecordFormParams) {
  const { mutateAsync: createPonto, isPending: isCreating } = useCreatePonto();
  const { mutateAsync: updatePonto, isPending: isUpdating } = useUpdatePonto();
  const [openCombobox, setOpenCombobox] = useState(false);

  const idValue = record?.id;
  const isVirtualId = !!record && (
    !record.entrada_hora ||
    record.ausente === true ||
    (!!idValue && String(idValue).startsWith("ausente-"))
  );

  const { data: collaborators = [] } = useActiveCollaborators({
    enabled: isOpen && (!record || isVirtualId),
  });

  const isEditMode = !!record && !isVirtualId;
  const isInclusionMode = !!record && isVirtualId;
  const isManualMode = !record;

  const form = useForm<ManualTimeRecordFormValues>({
    resolver: zodResolver(manualTimeRecordSchema),
    defaultValues: {
      usuario_id: "",
      perfil_nome: "",
      data_referencia: format(new Date(), "yyyy-MM-dd"),
      entrada_hora: "",
      saida_hora: "",
      entrada_km: "",
      saida_km: "",
      colaborador_cliente_id: "",
      observacao: "",
    },
  });

  const watchedPerfilNome = form.watch("perfil_nome");
  const isMotoboyUser = isMotoboy(watchedPerfilNome);

  const selectedCollaboratorId = form.watch("usuario_id");
  const selectedCollaborator =
    record?.usuario || collaborators.find((c) => String(c.id) === selectedCollaboratorId);

  const hasTurnos = !!(
    record?.colaborador_cliente_id ||
    (selectedCollaborator?.links && selectedCollaborator.links.length > 0)
  );

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const now = new Date();
  const getShiftMoment = (timeStr?: string) => {
    if (!timeStr || !record?.data_referencia) return null;
    const [h, m] = timeStr.split(":").map(Number);
    const [y, mm, d] = record.data_referencia.split("-").map(Number);
    const date = new Date(y, mm - 1, d);
    date.setHours(h, m, 0, 0);
    return date;
  };

  const shiftStart = getShiftMoment(record?.detalhes_calculo?.entrada?.turno_base || undefined);
  let shiftEnd = getShiftMoment(record?.detalhes_calculo?.saida?.turno_base || undefined);
  if (shiftStart && shiftEnd && shiftEnd <= shiftStart) {
    shiftEnd = new Date(shiftEnd.getTime() + 24 * 60 * 60 * 1000);
  }

  const isShiftEnded = shiftEnd ? now > shiftEnd : false;

  const isFixingInconsistency =
    isShiftEnded ||
    record?.status_saida === "FALTA_SAIDA" ||
    record?.status_saida === "PENDENTE";

  useEffect(() => {
    if (isOpen) {
      if (record) {
        const values: ManualTimeRecordFormValues = {
          usuario_id: String(record.usuario_id),
          perfil_nome: record.usuario?.perfil?.nome || "",
          data_referencia: record.data_referencia,
          entrada_hora: record.entrada_hora
            ? format(new Date(record.entrada_hora), "HH:mm")
            : isShiftEnded
            ? record.detalhes_calculo?.entrada?.turno_base?.slice(0, 5) || ""
            : "",
          saida_hora: record.saida_hora
            ? format(new Date(record.saida_hora), "HH:mm")
            : isShiftEnded
            ? record.detalhes_calculo?.saida?.turno_base?.slice(0, 5) || ""
            : "",
          entrada_km: record.entrada_km != null ? String(record.entrada_km) : "",
          saida_km: record.saida_km != null ? String(record.saida_km) : "",
          colaborador_cliente_id: String(record.colaborador_cliente_id || ""),
          observacao: record.observacao || "",
        };
        form.reset(values);
      } else {
        form.reset({
          usuario_id: "",
          perfil_nome: "",
          data_referencia: format(new Date(), "yyyy-MM-dd"),
          entrada_hora: "",
          saida_hora: "",
          entrada_km: "",
          saida_km: "",
          colaborador_cliente_id: "",
          observacao: "",
        });
      }
      setOpenCombobox(false);
    }
  }, [isOpen, record, form, isShiftEnded]);

  const onSubmit = async (values: ManualTimeRecordFormValues) => {
    try {
      const [y, m, d] = values.data_referencia.split("-").map(Number);
      const refDate = new Date(y, m - 1, d);
      const refDateStr = format(refDate, "yyyy-MM-dd");

      const { entrada, saida } = TimeRules.resolveDates(
        refDateStr,
        values.entrada_hora,
        values.saida_hora || undefined
      );

      const payload = {
        usuario_id: values.usuario_id,
        data_referencia: values.data_referencia,
        entrada_hora: entrada.toISOString(),
        entrada_km: kmToNumber(values.entrada_km),
        saida_hora: saida ? saida.toISOString() : null,
        saida_km: values.saida_km ? kmToNumber(values.saida_km) : null,
        colaborador_cliente_id: values.colaborador_cliente_id
          ? parseInt(values.colaborador_cliente_id, 10)
          : undefined,
        observacao: values.observacao,
      };

      if (isEditMode && record && typeof record.id === "number") {
        await updatePonto({
          id: record.id,
          data: payload,
        });
      } else {
        await createPonto(payload);
      }

      handleClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = err.response?.data?.error || err.message || "";
      toast.error(errorMessage || "Erro ao processar registro");
    }
  };

  const clearSelectedCollaborator = () => {
    form.setValue("usuario_id", "");
    form.setValue("colaborador_cliente_id", "");
  };

  const isPending = isCreating || isUpdating;

  return {
    form,
    collaborators,
    openCombobox,
    setOpenCombobox,
    selectedCollaborator,
    selectedCollaboratorId,
    hasTurnos,
    isEditMode,
    isInclusionMode,
    isManualMode,
    isFixingInconsistency,
    isMotoboyUser,
    isPending,
    onSubmit,
    handleClose,
    clearSelectedCollaborator,
  };
}
