import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUpdateVinculo } from "@/hooks";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { CalendarOff, Loader2, X } from "lucide-react";
import { useState } from "react";

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

  const handleConfirm = async () => {
    if (!dataFim) return;

    try {
      await updateVinculo.mutateAsync({
        id: turnId,
        colaborador_id: collaboratorId,
        data_fim: dataFim,
        silent: true,
      });
      onSuccess?.();
      onOpenChange(false);
      setDataFim("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      safeCloseDialog(() => {
        onOpenChange(false);
        setDataFim("");
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-full max-w-md p-0 gap-0 bg-gray-50 sm:rounded-3xl border-0 shadow-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
        hideCloseButton
      >
        <div className="bg-amber-500 p-4 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Fechar</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
            <CalendarOff className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Encerrar Vínculo
          </DialogTitle>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-500 font-medium mb-1">Vínculo com</p>
            <p className="text-lg font-bold text-gray-800">
              {clientName || "Cliente"}
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-sm text-amber-800 font-semibold leading-relaxed">
              Ao encerrar, o colaborador não poderá mais registrar ponto para
              este cliente. Todo o histórico de pontos, ocorrências e
              financeiro será preservado.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Data de Término <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="h-12 rounded-xl border-gray-200 bg-white text-base font-medium"
              required
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl font-bold"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!dataFim || updateVinculo.isPending}
              className="flex-1 h-12 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white"
            >
              {updateVinculo.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Confirmar Encerramento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
