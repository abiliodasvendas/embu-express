import { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIntercompany } from "@/hooks/api/useIntercompany";
import { TransferenciaIntercompany } from "@/types/database";
import { toast } from "sonner";
import { ArrowRightLeft } from "lucide-react";
import { toLocalDateString } from "@/utils/formatters/date";
import { formatCurrency } from "@/utils/formatters/currency";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";

export interface AcertoIntercompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transferencia?: TransferenciaIntercompany | null;
  onSuccess?: () => void | Promise<void>;
}

export function AcertoIntercompanyDialog({
  open,
  onOpenChange,
  transferencia,
  onSuccess,
}: AcertoIntercompanyDialogProps) {
  const { registrarAcertoMutation } = useIntercompany();

  const [dataAcerto, setDataAcerto] = useState<string>(toLocalDateString());
  const [observacao, setObservacao] = useState<string>("");

  useEffect(() => {
    if (open) {
      setDataAcerto(toLocalDateString());
      setObservacao("");
    }
  }, [open, transferencia]);

  if (!transferencia) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataAcerto) {
      toast.error("Informe a data do acerto.");
      return;
    }

    try {
      await registrarAcertoMutation.mutateAsync({
        transferencia_id: transferencia.id,
        data_acerto: dataAcerto,
        observacao: observacao || null,
      });
      toast.success("Acerto entre empresas registrado com sucesso!");
      safeCloseDialog(() => onOpenChange(false));
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : err instanceof Error
          ? err.message
          : "Erro ao registrar acerto entre empresas.";
      toast.error(msg);
    }
  };

  const handleClose = () => {
    if (registrarAcertoMutation.isPending) return;
    safeCloseDialog(() => onOpenChange(false));
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="md"
      lockClose={registrarAcertoMutation.isPending}
    >
      <BaseDialog.Header
        icon={<ArrowRightLeft className="h-5 w-5 text-foreground" />}
        title="Registrar Acerto Entre Empresas"
        subtitle="Confirmação de repasse bancário do dinheiro recebido no lugar de outra empresa."
        onClose={handleClose}
      />
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <BaseDialog.Body>
          <div className="space-y-4 pt-1">
            <div className="bg-muted/30 border border-border rounded-[18px] p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Quem recebeu o dinheiro:</span>
                <span className="font-semibold text-foreground">
                  {transferencia.empresa_devedora?.nome_fantasia || "Empresa A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Dona da fatura (Quem vai receber):</span>
                <span className="font-semibold text-foreground">
                  {transferencia.empresa_credora?.nome_fantasia || "Empresa B"}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-muted-foreground font-medium">Valor a Repassar:</span>
                <span className="font-bold text-sm text-foreground">
                  {formatCurrency(transferencia.valor)}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Data da Transferência / Acerto <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={dataAcerto}
                onChange={(e) => setDataAcerto(e.target.value)}
                className="h-11 rounded-[18px] text-xs sm:text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Observação do Repasse</Label>
              <Textarea
                placeholder="Ex: TED realizada da CC 1234 para CC 5678..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                rows={2}
                className="rounded-[18px] text-xs sm:text-sm"
              />
            </div>
          </div>
        </BaseDialog.Body>
        <BaseDialog.Footer>
          <BaseDialog.Action
            label="Cancelar"
            variant="secondary"
            disabled={registrarAcertoMutation.isPending}
            onClick={handleClose}
            type="button"
          />
          <BaseDialog.Action
            label="Confirmar Acerto"
            variant="primary"
            isLoading={registrarAcertoMutation.isPending}
            type="submit"
          />
        </BaseDialog.Footer>
      </form>
    </BaseDialog>
  );
}

export default AcertoIntercompanyDialog;
