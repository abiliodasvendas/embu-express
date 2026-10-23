import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { OccurrenceFormData, occurrenceSchema } from "@/schemas/occurrenceSchema";
import { useCollaborator, useCollaborators } from "@/hooks/api/useCollaborators";
import { useTiposOcorrencia } from "@/hooks/api/useOcorrencias";
import { useCreateOcorrencia, useUpdateOcorrencia } from "@/hooks/api/useOcorrenciaMutations";
import { OccurrenceFormMode } from "@/types/enums";
import { LANCAMENTO_TIPO } from "@/constants/financeiro.constants";
import { messages } from "@/constants/messages";
import type { ColaboradorCliente } from "@/types/database";

export interface UseOccurrenceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collaboratorId?: string;
  onSuccess?: () => void;
  defaultValues?: Partial<OccurrenceFormData> & { id?: number };
  mode?: OccurrenceFormMode;
}

export function useOccurrenceForm({
  open,
  onOpenChange,
  collaboratorId,
  onSuccess,
  defaultValues,
  mode,
}: UseOccurrenceFormProps) {
  const { data: collaboratorsResponse } = useCollaborators({});
  const collaborators = useMemo(() => {
    if (!collaboratorsResponse) return [];
    if (Array.isArray(collaboratorsResponse)) return collaboratorsResponse;
    return collaboratorsResponse.data || [];
  }, [collaboratorsResponse]);

  const { data: tipos = [] } = useTiposOcorrencia();
  const createMutation = useCreateOcorrencia();
  const updateMutation = useUpdateOcorrencia();
  const isEditing = !!defaultValues?.id;

  const form = useForm<OccurrenceFormData>({
    resolver: zodResolver(occurrenceSchema),
    defaultValues: {
      colaborador_id: collaboratorId || defaultValues?.colaborador_id || "",
      tipo_id: defaultValues?.tipo_id || "",
      data_ocorrencia: defaultValues?.data_ocorrencia || "",
      valor: defaultValues?.valor || 0,
      impacto_financeiro:
        mode === OccurrenceFormMode.FINANCIAL
          ? true
          : mode === OccurrenceFormMode.GENERAL
          ? false
          : defaultValues?.impacto_financeiro || false,
      tipo_lancamento: defaultValues?.tipo_lancamento || undefined,
      colaborador_cliente_id:
        defaultValues?.colaborador_cliente_id !== undefined
          ? defaultValues.colaborador_cliente_id
          : undefined,
      observacao: defaultValues?.observacao || "",
      is_parcelado: defaultValues?.is_parcelado || false,
      quantidade_parcelas: defaultValues?.quantidade_parcelas || undefined,
    },
  });

  const selectedCollaboratorId = form.watch("colaborador_id");
  const { data: selectedDetailedCollaborator } = useCollaborator(selectedCollaboratorId);

  useEffect(() => {
    if (collaboratorId) {
      form.setValue("colaborador_id", collaboratorId);
    }
    if (defaultValues) {
      Object.entries(defaultValues).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as keyof OccurrenceFormData, value as never);
        }
      });
    }
  }, [collaboratorId, defaultValues, form]);

  useEffect(() => {
    if (selectedDetailedCollaborator?.links && defaultValues?.colaborador_cliente_id) {
      const hasLink = selectedDetailedCollaborator.links.some(
        (link: ColaboradorCliente) => String(link.id) === String(defaultValues.colaborador_cliente_id),
      );
      if (hasLink) {
        form.setValue("colaborador_cliente_id", String(defaultValues.colaborador_cliente_id));
      }
    }
  }, [selectedDetailedCollaborator, defaultValues?.colaborador_cliente_id, form]);

  const selectedTipoId = form.watch("tipo_id");

  useEffect(() => {
    if (selectedTipoId) {
      const tipo = tipos.find((t) => String(t.id) === selectedTipoId);
      if (tipo) {
        const hasImpact =
          mode === OccurrenceFormMode.FINANCIAL
            ? true
            : mode === OccurrenceFormMode.GENERAL
            ? false
            : !!tipo.impacto_financeiro;
        form.setValue("impacto_financeiro", hasImpact);

        if (hasImpact) {
          if (tipo.valor_padrao) {
            form.setValue("valor", tipo.valor_padrao);
          }
          if (tipo.tipo_lancamento) {
            form.setValue(
              "tipo_lancamento",
              tipo.tipo_lancamento as typeof LANCAMENTO_TIPO.ENTRADA | typeof LANCAMENTO_TIPO.SAIDA,
            );
          }
        }
      }
    }
  }, [selectedTipoId, tipos, mode, form]);

  const onSubmit = async (data: OccurrenceFormData) => {
    try {
      const payload = {
        colaborador_id: data.colaborador_id,
        tipo_id: Number(data.tipo_id),
        data_ocorrencia: data.data_ocorrencia,
        valor: data.valor,
        impacto_financeiro: Boolean(data.impacto_financeiro),
        tipo_lancamento: data.tipo_lancamento as
          | typeof LANCAMENTO_TIPO.ENTRADA
          | typeof LANCAMENTO_TIPO.SAIDA
          | undefined,
        observacao: data.observacao,
        colaborador_cliente_id: data.colaborador_cliente_id
          ? Number(data.colaborador_cliente_id)
          : undefined,
        is_parcelado: data.is_parcelado,
        quantidade_parcelas: data.quantidade_parcelas ? Number(data.quantidade_parcelas) : undefined,
      };

      if (isEditing && defaultValues?.id) {
        await updateMutation.mutateAsync({
          id: defaultValues.id,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onSuccess?.();
      form.reset();
      safeCloseDialog(() => onOpenChange(false));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(isEditing ? messages.ocorrencia.erro.atualizar : messages.ocorrencia.erro.salvar, {
        description: err.response?.data?.message || err.message,
      });
    }
  };

  const handleClose = () => {
    safeCloseDialog(() => onOpenChange(false));
  };

  const links = (selectedDetailedCollaborator?.links as ColaboradorCliente[]) || [];
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return {
    form,
    collaborators,
    tipos,
    links,
    isEditing,
    isSaving,
    onSubmit,
    handleClose,
  };
}
