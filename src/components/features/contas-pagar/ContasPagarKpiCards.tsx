import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters/currency";
import { ContasPagarKpis } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Receipt, CheckCircle2, Clock, AlertCircle, Calendar } from "lucide-react";

interface ContasPagarKpiCardsProps {
  kpis?: ContasPagarKpis;
  mes: number;
  ano: number;
  selectedFiltroPrazo: string | null;
  onSelectFiltroPrazo: (filtro: string | null) => void;
}

export function ContasPagarKpiCards({
  kpis,
  mes,
  ano,
  selectedFiltroPrazo,
  onSelectFiltroPrazo,
}: ContasPagarKpiCardsProps) {
  const totalMes = kpis?.total_a_pagar_mes || 0;
  const totalPago = kpis?.total_pago_mes || 0;
  const totalGeral = totalMes + totalPago;
  const totalHoje = kpis?.total_vencendo_hoje || 0;
  const totalSemana = kpis?.total_semana || 0;
  const totalAtrasadas = kpis?.total_atrasadas || 0;
  const totalProximas = Math.max(0, totalMes - totalHoje - totalSemana);

  const percentualPago =
    totalGeral > 0 ? `${Math.round((totalPago / totalGeral) * 100)}% quitado` : "0%";

  return (
    <div className="space-y-4">
      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex gap-3 overflow-x-auto [scrollbar-width:none] pb-1 sm:grid sm:grid-cols-4">
        <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
              <Receipt className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Total Previsto</p>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5 truncate">
                {formatCurrency(totalGeral > 0 ? totalGeral : totalMes)}
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
              <p className="text-xs font-medium text-muted-foreground">Pago / Quitado</p>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                {formatCurrency(totalPago)}
              </h2>
              <p className="text-[11px] text-muted-foreground mt-1">{percentualPago}</p>
            </div>
          </div>
        </div>

        <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Saldo a Pagar</p>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5 truncate">
                {formatCurrency(totalMes)}
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
                totalAtrasadas > 0
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
                  totalAtrasadas > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"
                )}
              >
                {formatCurrency(totalAtrasadas)}
              </h2>
              <p className="text-[11px] text-muted-foreground mt-1">Vencidas e não quitadas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[20px] sm:rounded-[24px] border border-border bg-card p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-tight">
                Cronograma de Vencimentos & Fluxo Semanal
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Classificação dos compromissos e despesas por prazo de pagamento
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3.5 py-1.5 bg-muted/40 border border-border rounded-[14px] flex items-center gap-2 text-xs">
              <span className="font-medium text-muted-foreground uppercase text-[11px]">
                Total Pendente:
              </span>
              <span className="font-bold text-foreground">
                {formatCurrency(totalMes)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => onSelectFiltroPrazo(selectedFiltroPrazo === "HOJE" ? null : "HOJE")}
            className={cn(
              "text-left p-3.5 rounded-[16px] border transition-all cursor-pointer",
              selectedFiltroPrazo === "HOJE"
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-card hover:bg-muted/40"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-muted-foreground">Vencendo Hoje</span>
              <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-medium border-border bg-muted/60">
                Hoje
              </Badge>
            </div>
            <div className="text-base font-bold text-foreground">
              {formatCurrency(totalHoje)}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {selectedFiltroPrazo === "HOJE" ? "Filtro ativo (clique para limpar)" : "Clique para filtrar"}
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectFiltroPrazo(selectedFiltroPrazo === "SEMANA" ? null : "SEMANA")}
            className={cn(
              "text-left p-3.5 rounded-[16px] border transition-all cursor-pointer",
              selectedFiltroPrazo === "SEMANA"
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-card hover:bg-muted/40"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-muted-foreground">Esta Semana (Seg a Dom)</span>
              <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-medium border-border bg-muted/60">
                Semana
              </Badge>
            </div>
            <div className="text-base font-bold text-foreground">
              {formatCurrency(totalSemana)}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {selectedFiltroPrazo === "SEMANA" ? "Filtro ativo (clique para limpar)" : "Clique para filtrar"}
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectFiltroPrazo(selectedFiltroPrazo === "PROXIMAS" ? null : "PROXIMAS")}
            className={cn(
              "text-left p-3.5 rounded-[16px] border transition-all cursor-pointer",
              selectedFiltroPrazo === "PROXIMAS"
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-card hover:bg-muted/40"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-muted-foreground">Próximas Semanas</span>
              <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-medium border-border bg-muted/60">
                Futuro
              </Badge>
            </div>
            <div className="text-base font-bold text-foreground">
              {formatCurrency(totalProximas)}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {selectedFiltroPrazo === "PROXIMAS" ? "Filtro ativo (clique para limpar)" : "Clique para filtrar"}
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectFiltroPrazo(selectedFiltroPrazo === "ATRASADAS" ? null : "ATRASADAS")}
            className={cn(
              "text-left p-3.5 rounded-[16px] border transition-all cursor-pointer",
              selectedFiltroPrazo === "ATRASADAS"
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-card hover:bg-muted/40"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-muted-foreground">Em Atraso</span>
              <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-medium border-rose-200 text-rose-600 bg-rose-50/50">
                Atrasadas
              </Badge>
            </div>
            <div className={cn("text-base font-bold", totalAtrasadas > 0 ? "text-rose-600" : "text-foreground")}>
              {formatCurrency(totalAtrasadas)}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {selectedFiltroPrazo === "ATRASADAS" ? "Filtro ativo (clique para limpar)" : "Clique para filtrar"}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
