import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { getMessage } from "@/constants/messages";
import { cn } from "@/lib/utils";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { AlertCircle, Loader2, Wallet } from "lucide-react";
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

  const handleOpenChange = (val: boolean) => {
    if (!val && !showLoading) {
      safeCloseDialog(() => onOpenChange(false));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[90vw] max-w-sm rounded-[2rem] border-0 shadow-2xl p-0 overflow-hidden bg-white gap-0 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-8 pb-6 flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-sm border bg-emerald-50 border-emerald-100">
            <Wallet className="w-6 h-6 text-emerald-600" />
          </div>

          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tight text-center">
              {getMessage("financeiro.confirmacao.adiantamento.titulo")}
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-sm leading-relaxed px-2 font-medium text-center">
              {getMessage("financeiro.confirmacao.adiantamento.descricao")}
            </DialogDescription>
          </DialogHeader>

          <div className="w-full text-left space-y-2 pt-2">
            <Label htmlFor="valor_adiantamento" className="text-xs font-bold text-gray-600">
              Valor do Adiantamento (R$)
            </Label>
            <MoneyInput
              id="valor_adiantamento"
              value={valor}
              onChange={handleValorChange}
              className={cn(
                "h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white font-bold text-base transition-all",
                errorMessage && "border-red-400 focus:border-red-500 focus:ring-red-200 bg-red-50/20"
              )}
              disabled={showLoading}
            />
            {errorMessage && (
              <p className="text-xs font-semibold text-red-500 mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3 bg-gray-50/50 border-t border-gray-50 mt-2">
          <Button
            type="button"
            variant="outline"
            disabled={showLoading}
            onClick={() => handleOpenChange(false)}
            className="h-11 rounded-xl border-gray-200 bg-white hover:bg-gray-100 text-gray-600 font-bold transition-all shadow-sm"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            disabled={showLoading || !valor || valor <= 0}
            onClick={handleConfirm}
            className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirmar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
