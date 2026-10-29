import { DollarSign, TrendingUp, Wrench, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters/currency";
import { DreConsolidado } from "@/services/api/dre.api";

interface DreKpiCardsProps {
  dre: DreConsolidado;
  modoVisao: "realizado" | "projetado";
}

export function DreKpiCards({ dre, modoVisao }: DreKpiCardsProps) {
  const isPositivo = (dre.lucro_liquido || 0) >= 0;

  const formatarPercentual = (valor: number) => {
    return `${(valor || 0).toFixed(2)}%`;
  };

  return (
    <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex gap-3 overflow-x-auto [scrollbar-width:none] pb-1 sm:grid sm:grid-cols-2 lg:grid-cols-4">
      <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Total Faturado</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5 truncate">
              {formatCurrency(dre.faturamento_bruto)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">
              {modoVisao === "realizado" ? "Medições & Faturas Efetivas" : "Projeção Contratual Plena"}
            </p>
          </div>
        </div>
      </div>

      <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Custo de Pessoal</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5 truncate">
              {formatCurrency(dre.custos_diretos.custo_pessoal_folha)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1 truncate font-medium">
              {modoVisao === "realizado" ? "Folha Liquidada & Vales Pagos" : "Estimativa da Folha (Teto Aberto)"}
            </p>
          </div>
        </div>
      </div>

      <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
            <Wrench className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Frota Própria</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5 truncate">
              {formatCurrency(dre.custos_diretos.manutencao_frota_propria)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">
              {modoVisao === "realizado" ? "Manutenção e Combustível Liquidado" : "Manutenção e Combustível Próprio"}
            </p>
          </div>
        </div>
      </div>

      <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div
            className={cn(
              "w-10 h-10 rounded-[14px] border flex items-center justify-center shrink-0",
              isPositivo
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400"
            )}
          >
            <Percent className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">
              {modoVisao === "realizado"
                ? (isPositivo ? "Lucro Líquido Real" : "Prejuízo Real no Período")
                : (isPositivo ? "Lucro Líquido Projetado" : "Prejuízo Projetado")}
            </p>
            <h2
              className={cn(
                "text-xl sm:text-2xl font-bold tracking-tight mt-0.5 truncate",
                isPositivo
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              {formatCurrency(dre.lucro_liquido)}
            </h2>
            <p
              className={cn(
                "text-[11px] font-semibold mt-1 truncate",
                isPositivo
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              Margem Líquida: {formatarPercentual(dre.margem_liquida_percentual)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
