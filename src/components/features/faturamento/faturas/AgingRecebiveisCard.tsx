import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatters/currency";
import { TrendingDown } from "lucide-react";
import { AgingRecebiveisResultado } from "@/types/database";

interface AgingRecebiveisCardProps {
  aging?: AgingRecebiveisResultado;
  selectedFaixa: string | null;
  onSelectFaixa: (faixa: string | null) => void;
}

export function AgingRecebiveisCard({
  aging,
  selectedFaixa,
  onSelectFaixa,
}: AgingRecebiveisCardProps) {
  return (
    <div className="rounded-[20px] sm:rounded-[24px] border border-border bg-card p-5 md:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-tight">
              Controle de Vencimentos & Risco de Liquidez
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Classificação de cobranças e faturas por tempo de vencimento e atraso
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3.5 py-1.5 bg-muted/40 border border-border rounded-[14px] flex items-center gap-2 text-xs">
            <span className="font-medium text-muted-foreground uppercase text-[11px]">
              Capital Retido:
            </span>
            <span className="font-bold text-foreground">
              {formatCurrency(aging?.capital_giro_retido_rua || 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {aging?.faixas.map((f) => {
          const isSelected = selectedFaixa === f.faixa;

          return (
            <button
              key={f.faixa}
              type="button"
              onClick={() => onSelectFaixa(isSelected ? null : f.faixa)}
              className={`text-left p-3.5 rounded-[16px] border transition-all cursor-pointer ${isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-card hover:bg-muted/40"
                }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-muted-foreground">
                  {f.descricao}
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] h-4 px-1.5 font-medium border-border bg-muted/60"
                >
                  {f.quantidade_faturas} faturas
                </Badge>
              </div>
              <div className="text-base font-bold text-foreground">
                {formatCurrency(f.valor_total)}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {isSelected ? "Filtro ativo (clique para limpar)" : "Clique para filtrar"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
