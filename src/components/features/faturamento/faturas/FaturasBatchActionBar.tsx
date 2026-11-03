import { Ban, X, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FaturasBatchActionBarProps {
  selectedCount: number;
  isCanceling: boolean;
  onCancelarSelecionadas: () => void;
  onClearSelection: () => void;
}

export function FaturasBatchActionBar({
  selectedCount,
  isCanceling,
  onCancelarSelecionadas,
  onClearSelection,
}: FaturasBatchActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg sm:w-auto animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-card/95 backdrop-blur-md border border-border/80 shadow-2xl rounded-2xl sm:rounded-full px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-foreground">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
            <CheckSquare className="h-3.5 w-3.5" />
          </span>
          <span>
            <strong className="text-primary font-bold">{selectedCount}</strong>{" "}
            {selectedCount === 1 ? "fatura selecionada" : "faturas selecionadas"}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={isCanceling}
            className="text-xs text-muted-foreground hover:text-foreground h-8 px-3 rounded-full"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Desmarcar todas
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onCancelarSelecionadas}
            disabled={isCanceling}
            className="text-xs font-semibold h-8 px-4 rounded-full shadow-xs"
          >
            <Ban className="h-3.5 w-3.5 mr-1.5" />
            {isCanceling ? "Cancelando..." : "Cancelar Selecionadas"}
          </Button>
        </div>
      </div>
    </div>
  );
}
