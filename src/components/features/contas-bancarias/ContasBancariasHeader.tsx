import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Landmark } from "lucide-react";

interface ContasBancariasHeaderProps {
  onNovaTransferencia?: () => void;
  canEdit?: boolean;
}

export function ContasBancariasHeader({
  onNovaTransferencia,
  canEdit = true,
}: ContasBancariasHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="h-11 w-11 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
          <Landmark className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Contas Bancárias
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Gestão de contas, tesouraria realizada e saldos projetados por competência
          </p>
        </div>
      </div>

      {canEdit && onNovaTransferencia && (
        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={onNovaTransferencia}
            className="h-11 rounded-[18px] bg-card hover:bg-surface-alt border-border text-foreground font-semibold px-4 gap-2 shadow-xs text-xs sm:text-sm cursor-pointer select-none"
          >
            <ArrowLeftRight className="h-4 w-4 text-primary" />
            <span>Transferir entre Contas</span>
          </Button>
        </div>
      )}
    </div>
  );
}
