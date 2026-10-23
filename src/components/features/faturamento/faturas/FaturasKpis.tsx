import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters/currency";
import {
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

interface FaturasKpisProps {
  kpis: {
    totalFaturado: number;
    totalRecebido: number;
    totalPendente: number;
    totalVencido: number;
  };
  mes: number;
  ano: number;
}

export function FaturasKpis({ kpis, mes, ano }: FaturasKpisProps) {
  const percentualQuitado =
    kpis.totalFaturado > 0
      ? `${Math.round((kpis.totalRecebido / kpis.totalFaturado) * 100)}% quitado`
      : "0%";

  return (
    <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex gap-3 overflow-x-auto [scrollbar-width:none] pb-1 sm:grid sm:grid-cols-4">
      <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Total Faturado</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5 truncate">
              {formatCurrency(kpis.totalFaturado)}
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
            <p className="text-xs font-medium text-muted-foreground">Recebido / Baixado</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
              {formatCurrency(kpis.totalRecebido)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">
              {percentualQuitado}
            </p>
          </div>
        </div>
      </div>

      <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Saldo a Receber</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5 truncate">
              {formatCurrency(kpis.totalPendente)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">Pendente no período</p>
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
            <p className="text-[11px] text-muted-foreground mt-1">Vencidas e não quitadas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
