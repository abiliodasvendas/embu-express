import { BaseDialog } from "@/components/ui/BaseDialog";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { getMessage } from "@/constants/messages";
import { cn } from "@/lib/utils";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { AlertCircle, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

export interface ConfirmarAdiantamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  valorSugerido: number;
  onConfirm: (valor: number) => Promise<void>;
  isLoading?: boolean;
}

export default function ConfirmarAdiantamentoDialog({
  open,
  onOpenChange,
  valorSugerido,
  onConfirm,
  isLoading = false,
}: ConfirmarAdiantamentoDialogProps) {
  const [valor, setValor] = useState<number>(valorSugerido);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [internalLoading, setInternalLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setValor(valorSugerido);
      if (!valorSugerido || valorSugerido <= 0) {
        setErrorMessage("O valor do adiantamento deve ser maior que R$ 0,00.");
      } else {
        setErrorMessage("");
      }
    }
  }, [open, valorSugerido]);

  const showLoading = isLoading || internalLoading;

  const handleValorChange = (newVal: number) => {
    setValor(newVal);
    if (!newVal || newVal <= 0) {
      setErrorMessage("O valor do adiantamento deve ser maior que R$ 0,00.");
    } else {
      setErrorMessage("");
    }
  };

  const handleConfirm = async () => {
    if (!valor || valor <= 0) {
      setErrorMessage("O valor do adiantamento deve ser maior que R$ 0,00.");
      return;
    }

    setInternalLoading(true);
    try {
      await onConfirm(valor);
      safeCloseDialog(() => onOpenChange(false));
    } finally {
      setInternalLoading(false);
    }
  };

  const handleClose = () => {
    if (showLoading) return;
    safeCloseDialog(() => onOpenChange(false));
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="sm"
      lockClose={showLoading}
    >
      <BaseDialog.Header
        icon={<Wallet className="w-5 h-5 text-foreground" />}
        title={getMessage("financeiro.confirmacao.adiantamento.titulo")}
        subtitle={getMessage("financeiro.confirmacao.adiantamento.descricao")}
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <div className="w-full space-y-2 pt-1">
          <Label htmlFor="valor_adiantamento" className="text-xs font-semibold text-foreground">
            Valor do Adiantamento (R$)
          </Label>
          <MoneyInput
            id="valor_adiantamento"
            value={valor}
            onChange={handleValorChange}
            className={cn(
              "h-11 rounded-[18px] text-sm font-semibold transition-all",
              errorMessage && "border-destructive focus:border-destructive bg-destructive/10"
            )}
            disabled={showLoading}
          />
          {errorMessage && (
            <p className="text-xs font-medium text-destructive mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errorMessage}
            </p>
          )}
        </div>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          disabled={showLoading}
          onClick={handleClose}
          type="button"
        />
        <BaseDialog.Action
          label={showLoading ? "Processando..." : "Confirmar"}
          variant="primary"
          isLoading={showLoading}
          onClick={handleConfirm}
          disabled={showLoading || !valor || valor <= 0}
          type="button"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
