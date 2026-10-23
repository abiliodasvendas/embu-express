import { Users, Banknote, TrendingDown, Percent } from "lucide-react";
import { formatCurrency } from "@/utils/formatters/currency";
import { KpiGridSkeleton } from "@/components/skeletons";

interface TotaisRetaguarda {
  total_reservas: number;
  total_fiscais: number;
  custo_total_retaguarda: number;
  prejuizo_total_ociosidade: number;
  taxaEficiencia: number;
}

interface RetaguardaKpiCardsProps {
  totais: TotaisRetaguarda;
  totalItens: number;
  isLoading: boolean;
}

export function RetaguardaKpiCards({
  totais,
  totalItens,
  isLoading,
}: RetaguardaKpiCardsProps) {
  if (isLoading && totalItens === 0) {
    return <KpiGridSkeleton count={4} cols={4} />;
  }

  return (
    <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex gap-3 overflow-x-auto [scrollbar-width:none] pb-1 sm:grid sm:grid-cols-4">
      <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Efetivo da Reserva
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-0.5 truncate">
              {totalItens}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">Colaboradores internos</p>
          </div>
        </div>
      </div>

      <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
            <Banknote className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Custo da Equipe
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-0.5 truncate">
              {formatCurrency(totais.custo_total_retaguarda)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">Folha base mensal</p>
          </div>
        </div>
      </div>

      <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Prejuízo Ociosidade
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-0.5 truncate">
              {formatCurrency(totais.prejuizo_total_ociosidade)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">Dias sem alocação em cliente</p>
          </div>
        </div>
      </div>

      <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
            <Percent className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Taxa de Eficiência
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-0.5 truncate">
              {totais.custo_total_retaguarda > 0 ? `${totais.taxaEficiencia}%` : "0%"}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">Aproveitamento operacional</p>
          </div>
        </div>
      </div>
    </div>
  );
}
