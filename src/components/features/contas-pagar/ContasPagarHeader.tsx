import { Button } from "@/components/ui/button";
import { CreditCard, Layers } from "lucide-react";

interface ContasPagarHeaderProps {
  isLiquidacaoActive: boolean;
  onToggleLiquidacao: () => void;
  canLiquidacao?: boolean;
}

export function ContasPagarHeader({
  isLiquidacaoActive,
  onToggleLiquidacao,
  canLiquidacao = true,
}: ContasPagarHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="h-11 w-11 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
          <CreditCard className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Contas a Pagar
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Gestão unificada de despesas operacionais e faturas de convênios a liquidar
          </p>
        </div>
      </div>

      {canLiquidacao && (
        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <Button
            variant={isLiquidacaoActive ? "default" : "outline"}
            onClick={onToggleLiquidacao}
            className="h-11 rounded-[18px] font-semibold px-4 gap-2 shadow-xs text-xs sm:text-sm cursor-pointer select-none"
          >
            <Layers className="h-4 w-4" />
            <span>Liquidação em Lote</span>
          </Button>
        </div>
      )}
    </div>
  );
}
