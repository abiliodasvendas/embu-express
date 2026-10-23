import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters/currency";
import { Receipt, CheckCircle2, AlertCircle, Layers } from "lucide-react";

interface DespesasKpisProps {
  kpis: {
    totalPrevisto: number;
    totalPago: number;
    totalPendente: number;
    totalVencido: number;
    totalRecorrentes: number;
  };
  mes: number;
  ano: number;
}

export function DespesasKpis({ kpis, mes, ano }: DespesasKpisProps) {
  const percentualPago =
    kpis.totalPrevisto > 0
      ? `${Math.round((kpis.totalPago / kpis.totalPrevisto) * 100)}% quitado`
      : "0%";

  return (
    <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex gap-3 overflow-x-auto [scrollbar-width:none] pb-1 sm:grid sm:grid-cols-4">
      <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
            <Receipt className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Total Previsto</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5 truncate">
              {formatCurrency(kpis.totalPrevisto)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">
              Mês {mes}/{ano}
            </p>
          </div>
        </div>
      </div>

      <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[14px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Pago / Liquidado</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
              {formatCurrency(kpis.totalPago)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">{percentualPago}</p>
          </div>
        </div>
      </div>

      <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div
            className={cn(
              "w-10 h-10 rounded-[14px] border flex items-center justify-center shrink-0",
              kpis.totalVencido > 0
                ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400"
                : "bg-muted/70 border-border text-foreground"
            )}
          >
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Em Atraso</p>
            <h2
              className={cn(
                "text-xl sm:text-2xl font-bold tracking-tight mt-0.5 truncate",
                kpis.totalVencido > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"
              )}
            >
              {formatCurrency(kpis.totalVencido)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">Vencidas e pendentes</p>
          </div>
        </div>
      </div>

      <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Compromissos Fixos</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5 truncate">
              {formatCurrency(kpis.totalRecorrentes)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">Despesas fixas recorrentes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
