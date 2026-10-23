import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/utils/notifications/toast";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { useDebounce } from "@/hooks/ui/useDebounce";
import {
  useCreatePublicLancamento,
  useUpdatePublicLancamento,
  usePublicCollaborators,
  useCreateAdminLancamento,
  useUpdateAdminLancamento,
} from "@/hooks/api/useConvenios";
import { useActiveCollaborators } from "@/hooks/api/useCollaborators";
import {
  useElegibilidadeConvenio,
  usePublicElegibilidadeConvenio,
} from "@/hooks/api/useBloqueiosConvenios";
import {
  LancamentoConvenioFormValues,
  lancamentoConvenioSchema,
} from "@/schemas/convenioSchema";
import type { LancamentoConvenio } from "@/types/database";

export interface UseLancamentoConvenioFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token?: string;
  convenioId?: string;
  lancamentoToEdit?: LancamentoConvenio | null;
}

export function useLancamentoConvenioForm({
  open,
  onOpenChange,
  token,
  convenioId,
  lancamentoToEdit,
}: UseLancamentoConvenioFormProps) {
  const createPublicLancamento = useCreatePublicLancamento();
  const updatePublicLancamento = useUpdatePublicLancamento();
  const createAdminLancamento = useCreateAdminLancamento();
  const updateAdminLancamento = useUpdateAdminLancamento();

  const { data: publicCollaborators = [] } = usePublicCollaborators(token || "");
  const { data: adminCollaborators = [] } = useActiveCollaborators({
    enabled: !!convenioId && open,
  });

  const collaborators = convenioId ? adminCollaborators : publicCollaborators;

  const isEditing = !!lancamentoToEdit;
  const isLoading =
    createPublicLancamento.isPending ||
    updatePublicLancamento.isPending ||
    createAdminLancamento.isPending ||
    updateAdminLancamento.isPending;

  const form = useForm<LancamentoConvenioFormValues>({
    resolver: zodResolver(lancamentoConvenioSchema),
    defaultValues: {
      colaborador_id: "",
      data_lancamento: new Date().toISOString().substring(0, 10),
      valor: 0,
      descricao: "",
      moto_embu: false,
      is_parcelado: false,
      quantidade_parcelas: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      if (lancamentoToEdit) {
        form.reset({
          colaborador_id: lancamentoToEdit.colaborador_id || "",
          data_lancamento: lancamentoToEdit.data_lancamento.substring(0, 10),
          valor: Number(lancamentoToEdit.valor),
          descricao: lancamentoToEdit.descricao || "",
          moto_embu: lancamentoToEdit.moto_embu,
          is_parcelado: false,
          quantidade_parcelas: undefined,
        });
      } else {
        form.reset({
          colaborador_id: "",
          data_lancamento: new Date().toISOString().substring(0, 10),
          valor: 0,
          descricao: "",
          moto_embu: false,
          is_parcelado: false,
          quantidade_parcelas: undefined,
        });
      }
    }
  }, [open, lancamentoToEdit, form]);

  const selectedColaboradorId = form.watch("colaborador_id");
  const isMotoEmbu = form.watch("moto_embu");
  const dataLancamento = form.watch("data_lancamento");
  const valorLancamento = form.watch("valor");

  const debouncedValor = useDebounce(valorLancamento, 400);

  const [anoRef, mesRef] = (dataLancamento || "").split("-").map((v) => parseInt(v, 10));

  const selectedPublicCollab = token
    ? publicCollaborators.find((c) => c.id === selectedColaboradorId)
    : undefined;
  const isManualPublicBlocked = !!token && !isMotoEmbu && !!selectedPublicCollab?.bloqueado;

  const { data: elegibilidadeAdmin } = useElegibilidadeConvenio(
    convenioId && selectedColaboradorId && !isMotoEmbu ? selectedColaboradorId : undefined,
    convenioId,
    mesRef || undefined,
    anoRef || undefined,
    debouncedValor || 0,
  );
  const isAdminWarning = !!convenioId && !isMotoEmbu && !!elegibilidadeAdmin?.bloqueado;

  const { data: elegibilidadePublic } = usePublicElegibilidadeConvenio(
    token && selectedColaboradorId && !isMotoEmbu && !isManualPublicBlocked ? token : undefined,
    selectedColaboradorId,
    mesRef || undefined,
    anoRef || undefined,
    debouncedValor || 0,
  );

  const isPublicMargemBlocked = !!token && !isMotoEmbu && !!elegibilidadePublic?.bloqueado;
  const isPublicBlocked = isManualPublicBlocked || isPublicMargemBlocked;
  const publicBlockedReason =
    selectedPublicCollab?.motivo_bloqueio ||
    elegibilidadePublic?.motivo ||
    "Este colaborador está com o convênio suspenso no momento. Não realize o serviço pelo convênio.";

  const collaboratorOptions = collaborators.map((c) => {
    const isBlocked = "bloqueado" in c && Boolean((c as { bloqueado?: boolean }).bloqueado);
    return {
      value: c.id,
      label: isBlocked ? `🔴 [BLOQUEADO] ${c.nome_completo}` : c.nome_completo,
    };
  });

  const onSubmit = async (values: LancamentoConvenioFormValues) => {
    try {
      const payload = {
        colaborador_id: values.colaborador_id,
        data_lancamento: values.data_lancamento,
        valor: values.valor,
        descricao: values.descricao || null,
        moto_embu: values.moto_embu,
        is_parcelado: values.is_parcelado,
        quantidade_parcelas: values.quantidade_parcelas,
      };

      if (convenioId) {
        if (isEditing && lancamentoToEdit) {
          await updateAdminLancamento.mutateAsync({
            convenioId,
            id: lancamentoToEdit.id,
            payload,
          });
          toast.success("Lançamento atualizado com sucesso!");
        } else {
          await createAdminLancamento.mutateAsync({ convenioId, payload });
          toast.success("Lançamento efetuado com sucesso!");
        }
      } else if (token) {
        if (isEditing && lancamentoToEdit) {
          await updatePublicLancamento.mutateAsync({
            token,
            id: lancamentoToEdit.id,
            payload,
          });
          toast.success("Lançamento atualizado com sucesso!");
        } else {
          await createPublicLancamento.mutateAsync({ token, payload });
          toast.success("Lançamento efetuado com sucesso!");
        }
      }
      safeCloseDialog(() => onOpenChange(false));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const message = err.response?.data?.message || err.message || "";
      toast.error(isEditing ? "Erro ao atualizar lançamento" : "Erro ao criar lançamento", {
        description: message,
      });
    }
  };

  const handleClose = () => {
    safeCloseDialog(() => onOpenChange(false));
  };

  return {
    form,
    collaboratorOptions,
    isEditing,
    isLoading,
    isPublicBlocked,
    publicBlockedReason,
    isAdminWarning,
    adminWarningReason: elegibilidadeAdmin?.motivo,
    onSubmit,
    handleClose,
  };
}
