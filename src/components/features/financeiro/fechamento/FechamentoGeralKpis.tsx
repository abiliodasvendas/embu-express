import { Wallet, CheckCircle2 } from "lucide-react";
import { KpiGridSkeleton } from "@/components/skeletons";

interface FechamentoGeralKpisProps {
  estatisticas: {
    total: number;
    adiantamentosConfirmados: number;
    pagamentosConcluidos: number;
  };
  isLoading: boolean;
}

export function FechamentoGeralKpis({
  estatisticas,
  isLoading,
}: FechamentoGeralKpisProps) {
  if (isLoading && !estatisticas.total) {
    return <KpiGridSkeleton count={2} cols={2} />;
  }

  const percentualAdiantamento =
    estatisticas.total > 0
      ? `${Math.round((estatisticas.adiantamentosConfirmados / estatisticas.total) * 100)}% confirmados`
      : "0% confirmados";

  const percentualFechamento =
    estatisticas.total > 0
      ? `${Math.round((estatisticas.pagamentosConcluidos / estatisticas.total) * 100)}% concluídos`
      : "0% concluídos";

  return (
    <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex gap-3 overflow-x-auto [scrollbar-width:none] pb-1 sm:grid sm:grid-cols-2">
      <div className="min-w-[240px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Adiantamentos Pagos
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-0.5 truncate">
              {estatisticas.adiantamentosConfirmados}{" "}
              <span className="text-muted-foreground text-sm font-normal">
                / {estatisticas.total}
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">
              {percentualAdiantamento}
            </p>
          </div>
        </div>
      </div>

      <div className="min-w-[240px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Fechamento Mensal Pago
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-0.5 truncate">
              {estatisticas.pagamentosConcluidos}{" "}
              <span className="text-muted-foreground text-sm font-normal">
                / {estatisticas.total}
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">
              {percentualFechamento}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
