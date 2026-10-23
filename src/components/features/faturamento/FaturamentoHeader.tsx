import { Button } from "@/components/ui/button";
import { DollarSign, Layers, Landmark } from "lucide-react";

interface FaturamentoHeaderProps {
  isLiquidacaoActive: boolean;
  onToggleLiquidacao: () => void;
  onOpenContasBancarias: () => void;
  canLiquidacao?: boolean;
  canContasBancarias?: boolean;
}

export function FaturamentoHeader({
  isLiquidacaoActive,
  onToggleLiquidacao,
  onOpenContasBancarias,
  canLiquidacao = true,
  canContasBancarias = true,
}: FaturamentoHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="h-11 w-11 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
          <DollarSign className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Faturamento & Gestão Financeira
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Controle de cobranças dos clientes, contas a pagar, acertos entre empresas e movimentações avulsas
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
        {canLiquidacao && (
          <Button
            variant={isLiquidacaoActive ? "default" : "outline"}
            onClick={onToggleLiquidacao}
            className="h-11 rounded-[18px] font-semibold px-4 gap-2 shadow-xs text-xs sm:text-sm cursor-pointer select-none"
          >
            <Layers className="h-4 w-4" />
            <span>Liquidação em Lote</span>
          </Button>
        )}

        {canContasBancarias && (
          <Button
            variant="outline"
            onClick={onOpenContasBancarias}
            className="h-11 rounded-[18px] border-border text-foreground hover:bg-muted font-semibold px-4 gap-2 shadow-xs text-xs sm:text-sm cursor-pointer select-none"
          >
            <Landmark className="h-4 w-4 text-muted-foreground" />
            <span>Contas Bancárias</span>
          </Button>
        )}
      </div>
    </div>
  );
}
