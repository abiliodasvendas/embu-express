import { Button } from "@/components/ui/button";
import { ESCOPO_CATEGORIA_FINANCEIRA } from "@/constants/financeiro.constants";
import { useLayout } from "@/contexts/LayoutContext";
import { EscopoCategoriaFinanceira } from "@/types/database";
import { CreditCard, Layers, Tags } from "lucide-react";

interface ContasPagarHeaderProps {
  isLiquidacaoActive: boolean;
  onToggleLiquidacao: () => void;
  canLiquidacao?: boolean;
  escopoCategorias?: EscopoCategoriaFinanceira;
}

export function ContasPagarHeader({
  isLiquidacaoActive,
  onToggleLiquidacao,
  canLiquidacao = true,
  escopoCategorias = ESCOPO_CATEGORIA_FINANCEIRA.DESPESA,
}: ContasPagarHeaderProps) {
  const { openCategoriasFinanceirasDialog } = useLayout();

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
            type="button"
            variant="outline"
            onClick={() =>
              openCategoriasFinanceirasDialog({ escopoInicial: escopoCategorias })
            }
            className="h-11 rounded-[18px] bg-card hover:bg-surface-alt border-border text-foreground font-semibold px-4 gap-2 shadow-xs text-xs sm:text-sm cursor-pointer select-none"
          >
            <Tags className="h-4 w-4 text-primary" />
            <span>Categorias</span>
          </Button>
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
