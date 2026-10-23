import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters/currency";
import { ArrowDownRight, ArrowUpRight, DollarSign, Banknote } from "lucide-react";

interface AvulsasKpisProps {
  kpis: {
    totalEntradas: number;
    totalSaidas: number;
    saldoLiquido: number;
    totalQtd: number;
  };
  mes: number;
  ano: number;
}

export function AvulsasKpis({ kpis, mes, ano }: AvulsasKpisProps) {
  return (
    <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex gap-3 overflow-x-auto [scrollbar-width:none] pb-1 sm:grid sm:grid-cols-4">
      <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[14px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <ArrowDownRight className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Entradas Avulsas</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
              {formatCurrency(kpis.totalEntradas)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">Fretes à vista, rendimentos</p>
          </div>
        </div>
      </div>

      <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[14px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Saídas Avulsas</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 mt-0.5 truncate">
              {formatCurrency(kpis.totalSaidas)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">Despesas diretas, tarifas</p>
          </div>
        </div>
      </div>

      <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div
            className={cn(
              "w-10 h-10 rounded-[14px] border flex items-center justify-center shrink-0",
              kpis.saldoLiquido >= 0
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400"
            )}
          >
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Saldo Líquido Avulso</p>
            <h2
              className={cn(
                "text-xl sm:text-2xl font-bold tracking-tight mt-0.5 truncate",
                kpis.saldoLiquido >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              {formatCurrency(kpis.saldoLiquido)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">Impacto direto no caixa</p>
          </div>
        </div>
      </div>

      <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
            <Banknote className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Operações</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5 truncate">
              {kpis.totalQtd}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">
              Mês {mes}/{ano}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
