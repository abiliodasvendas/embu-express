import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFinanceiroDashboard } from "@/hooks/api/useFinanceiroDashboard";
import { cn } from "@/lib/utils";
import { Wallet, TrendingUp, AlertCircle, Users } from "lucide-react";

interface FinanceiroTabProps {
  mes: number;
  ano: number;
}

export function FinanceiroTab({ mes, ano }: FinanceiroTabProps) {
  const { data, isLoading, isError } = useFinanceiroDashboard(mes, ano);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  if (isLoading) {
    return (
      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex gap-3 overflow-x-auto [scrollbar-width:none] pb-1 sm:grid sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <Skeleton className="w-10 h-10 rounded-[14px] shrink-0" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <Skeleton className="h-3.5 w-24 rounded-[6px]" />
                <Skeleton className="h-6 w-32 rounded-[8px]" />
                <Skeleton className="h-3 w-28 rounded-[6px]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border rounded-[18px] bg-card border-border">
        <AlertCircle className="w-10 h-10 mb-2 text-destructive" />
        <p className="text-sm font-semibold text-foreground">Ocorreu um erro ao carregar os dados financeiros do mês.</p>
      </div>
    );
  }

  const totalFolhaBruta = data.totalFolhaBruta || data.totalFolha;
  const totalAdiantamento = data.totalAdiantamentoPago || 0;
  const totalDescontos = (data.totalDescontoFaltas || 0) + (data.totalDescontoConvenios || 0);
  const saldoFinal = data.saldoFinalFolha || data.totalFolha;
  const totalColabs = data.totalColaboradores || (data.pendentesCount + (data.pagosCount || 0));
  const pagosCount = data.pagosCount || 0;
  const percentPago = saldoFinal > 0 ? Math.min(100, Math.round((data.valorPago / saldoFinal) * 100)) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-card p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] border border-border shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-muted-foreground uppercase tracking-wider">Composição do Mês:</span>
            <span className="font-bold text-foreground text-sm">{formatarMoeda(totalFolhaBruta)}</span>
            <span className="text-muted-foreground font-normal">(Bruto)</span>
          </div>
          <div className="flex items-center gap-2 font-medium text-foreground">
            <span>- {formatarMoeda(totalDescontos)}</span>
            <span className="text-muted-foreground text-[11px] font-normal">(Faltas/Convênios)</span>
          </div>
          <div className="flex items-center gap-2 font-medium text-foreground">
            <span>- {formatarMoeda(totalAdiantamento)}</span>
            <span className="text-muted-foreground text-[11px] font-normal">(Vales Dia 20)</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-sm bg-muted/70 border border-border px-3 py-1 rounded-[12px]">
            <span>= {formatarMoeda(saldoFinal)}</span>
            <span className="text-muted-foreground text-xs font-normal">(Saldo Dia 07)</span>
          </div>
        </div>
      </div>

      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex gap-3 overflow-x-auto [scrollbar-width:none] pb-1 sm:grid sm:grid-cols-2 lg:grid-cols-3">
        <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">Folha Bruta Prevista</p>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5 truncate">
                {formatarMoeda(totalFolhaBruta)}
              </h2>
              <p className="text-[11px] text-muted-foreground mt-1 truncate flex items-center gap-1">
                <Users className="h-3 w-3 shrink-0" />
                <span>Total ({totalColabs} prestadores)</span>
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
              <p className="text-xs font-medium text-muted-foreground truncate">Adiantamentos (Dia 20)</p>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5 truncate">
                {formatarMoeda(totalAdiantamento)}
              </h2>
              <p className="text-[11px] text-muted-foreground mt-1 truncate">
                {data.colaboradoresAdiantamentoCount || 0} de {totalColabs} confirmados
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[14px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">Descontos da Folha</p>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 mt-0.5 truncate">
                -{formatarMoeda(totalDescontos)}
              </h2>
              <p className="text-[11px] text-muted-foreground mt-1 truncate">
                Faltas: {formatarMoeda(data.totalDescontoFaltas || 0)} • Convênios: {formatarMoeda(data.totalDescontoConvenios || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground truncate">Saldo Líquido (Dia 07)</p>
                <span className="text-[11px] font-bold text-foreground">{percentPago}%</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5 truncate">
                {formatarMoeda(saldoFinal)}
              </h2>
              <div className="w-full bg-muted h-1 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-foreground h-full rounded-full transition-all duration-500" style={{ width: `${percentPago}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[14px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">Já Liquidado (Dia 07)</p>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                {formatarMoeda(data.valorPago)}
              </h2>
              <p className="text-[11px] text-muted-foreground mt-1 truncate">
                {pagosCount} de {totalColabs} prestadores liquidados
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">Resta Liquidar (Dia 07)</p>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5 truncate">
                {formatarMoeda(data.restaPagar)}
              </h2>
              <p className="text-[11px] text-muted-foreground mt-1 truncate">
                {data.pendentesCount} colaboradores pendentes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
