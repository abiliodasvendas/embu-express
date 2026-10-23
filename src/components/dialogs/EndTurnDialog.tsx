import { useState } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Input } from "@/components/ui/input";
import { messages } from "@/constants/messages";
import { useUpdateVinculo } from "@/hooks";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { CalendarOff } from "lucide-react";
import { toast } from "sonner";

interface EndTurnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turnId: number;
  collaboratorId: string;
  clientName?: string;
  onSuccess?: () => void;
}

export function EndTurnDialog({
  open,
  onOpenChange,
  turnId,
  collaboratorId,
  clientName,
  onSuccess,
}: EndTurnDialogProps) {
  const [dataFim, setDataFim] = useState("");
  const updateVinculo = useUpdateVinculo();

  const handleClose = () => {
    safeCloseDialog(() => {
      onOpenChange(false);
      setDataFim("");
    });
  };

  const handleConfirm = async () => {
    if (!dataFim) return;

    try {
      await updateVinculo.mutateAsync({
        id: turnId,
        colaborador_id: collaboratorId,
        data_fim: dataFim,
        silent: true,
      });
      toast.success(messages.vinculo.sucesso.encerrar);
      onSuccess?.();
      handleClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(messages.vinculo.erro.encerrar, {
        description: err.response?.data?.message || err.message,
      });
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="md"
      lockClose={updateVinculo.isPending}
    >
      <BaseDialog.Header
        icon={<CalendarOff className="w-5 h-5 text-destructive" />}
        title="Encerrar Vínculo"
        subtitle={clientName ? `Cliente: ${clientName}` : "Encerramento do vínculo operacional"}
        onClose={handleClose}
      />

      <BaseDialog.Body>
        <div className="space-y-4 pt-1">
          <Banner
            variant="warning"
            title="Atenção ao encerramento"
            description="Ao encerrar, o colaborador não poderá mais registrar atividade para este cliente. O histórico de atividades, ocorrências e financeiro será preservado."
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Data de Término <span className="text-destructive">*</span>
            </label>
            <Input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all shadow-xs"
              required
            />
          </div>
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={handleClose}
          disabled={updateVinculo.isPending}
          type="button"
        />
        <BaseDialog.Action
          label="Confirmar"
          variant="destructive"
          isLoading={updateVinculo.isPending}
          disabled={!dataFim || updateVinculo.isPending}
          onClick={handleConfirm}
          type="button"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
