import { Skeleton } from "@/components/ui/skeleton";
import { ExtratoBancarioResumo } from "@/types/database";
import { formatCurrency } from "@/utils/formatters/currency";
import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Landmark, Wallet } from "lucide-react";

interface ExtratoResumoKpisProps {
  resumo: ExtratoBancarioResumo;
  isLoading: boolean;
  isFetching: boolean;
}

export function ExtratoResumoKpis({
  resumo,
  isLoading,
  isFetching,
}: ExtratoResumoKpisProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 lg:grid-cols-4 gap-3 transition-opacity duration-200",
        isFetching && !isLoading && "opacity-60"
      )}
    >
      <div className="p-3.5 rounded-[24px] border border-border bg-card shadow-2xs">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Saldo Anterior</span>
          <Landmark className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        {isLoading ? (
          <Skeleton className="h-5 w-24 rounded-[6px] mt-0.5" />
        ) : (
          <span
            className={cn(
              "text-sm sm:text-base font-bold tabular-nums block",
              resumo.saldo_anterior < 0 ? "text-rose-600" : "text-foreground"
            )}
          >
            {formatCurrency(resumo.saldo_anterior)}
          </span>
        )}
      </div>

      <div className="p-3.5 rounded-[24px] border border-emerald-500/20 bg-emerald-500/5">
        <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 mb-1">
          <span className="font-medium">Entradas no Mês (+)</span>
          <ArrowDownLeft className="w-3.5 h-3.5" />
        </div>
        {isLoading ? (
          <Skeleton className="h-5 w-24 rounded-[6px] mt-0.5" />
        ) : (
          <span className="text-sm sm:text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400 block">
            + {formatCurrency(resumo.total_entradas)}
          </span>
        )}
      </div>

      <div className="p-3.5 rounded-[24px] border border-rose-500/20 bg-rose-500/5">
        <div className="flex items-center justify-between text-xs text-rose-700 dark:text-rose-400 mb-1">
          <span className="font-medium">Saídas no Mês (-)</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
        {isLoading ? (
          <Skeleton className="h-5 w-24 rounded-[6px] mt-0.5" />
        ) : (
          <span className="text-sm sm:text-base font-bold tabular-nums text-rose-600 dark:text-rose-400 block">
            - {formatCurrency(resumo.total_saidas)}
          </span>
        )}
      </div>

      <div className="p-3.5 rounded-[24px] border border-border bg-card shadow-2xs">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span className="font-medium">Saldo Final do Período</span>
          <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        {isLoading ? (
          <Skeleton className="h-5 w-24 rounded-[6px] mt-0.5" />
        ) : (
          <span
            className={cn(
              "text-sm sm:text-base font-bold tabular-nums block",
              resumo.saldo_final < 0
                ? "text-rose-600 dark:text-rose-400"
                : "text-foreground"
            )}
          >
            {formatCurrency(resumo.saldo_final)}
          </span>
        )}
      </div>
    </div>
  );
}
