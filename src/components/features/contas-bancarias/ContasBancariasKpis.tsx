import { formatCurrency } from "@/utils/formatters/currency";
import { Landmark, TrendingUp, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContasBancariasKpisProps {
  kpis: {
    saldoAtual: number;
    saldoProjetado: number;
    entradasRealizadas: number;
    entradasPrevistas: number;
    saidasRealizadas: number;
    saidasPrevistas: number;
    totalContas: number;
  };
  mes: number;
  ano: number;
}

export function ContasBancariasKpis({ kpis, mes, ano }: ContasBancariasKpisProps) {
  const isSaldoNegativo = kpis.saldoAtual < 0;

  return (
    <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex gap-3 overflow-x-auto [scrollbar-width:none] pb-1 sm:grid sm:grid-cols-4">
      <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
            <Landmark className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Saldo Realizado</p>
            <h2
              className={cn(
                "text-xl sm:text-2xl font-bold tracking-tight mt-0.5 truncate",
                isSaldoNegativo ? "text-rose-600 dark:text-rose-400" : "text-foreground"
              )}
            >
              {formatCurrency(kpis.saldoAtual)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">
              {kpis.totalContas} {kpis.totalContas === 1 ? "conta ativa" : "contas ativas"}
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
            <p className="text-xs font-medium text-muted-foreground">Saldo Projetado</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5 truncate">
              {formatCurrency(kpis.saldoProjetado)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">
              Competência {mes}/{ano}
            </p>
          </div>
        </div>
      </div>

      <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[14px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <ArrowDownLeft className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Entradas no Mês</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
              {formatCurrency(kpis.entradasRealizadas)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">
              Previsto: {formatCurrency(kpis.entradasPrevistas)}
            </p>
          </div>
        </div>
      </div>

      <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Saídas no Mês</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5 truncate">
              {formatCurrency(kpis.saidasRealizadas)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">
              Previsto: {formatCurrency(kpis.saidasPrevistas)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
