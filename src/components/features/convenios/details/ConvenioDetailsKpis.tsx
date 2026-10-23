import { KpiGridSkeleton } from "@/components/skeletons";
import { formatCurrency } from "@/utils/formatters/currency";
import { DollarSign, FileText, Users } from "lucide-react";

interface ConvenioDetailsKpisProps {
  stats: {
    totalValue: number;
    totalCount: number;
    uniqueMotoboys: number;
  };
  isLoading: boolean;
}

export function ConvenioDetailsKpis({ stats, isLoading }: ConvenioDetailsKpisProps) {
  if (isLoading) {
    return <KpiGridSkeleton count={3} cols={3} />;
  }

  return (
    <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex sm:grid sm:grid-cols-3 gap-3 sm:gap-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1 sm:pb-0">
      <div className="min-w-[260px] sm:min-w-0 shrink-0 sm:shrink flex-1 sm:flex-initial rounded-[24px] border border-border bg-card shadow-xs p-5 hover:shadow-md transition-all">
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total do Mês
          </span>
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          {formatCurrency(stats.totalValue)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Soma de ordens no período</p>
      </div>

      <div className="min-w-[260px] sm:min-w-0 shrink-0 sm:shrink flex-1 sm:flex-initial rounded-[24px] border border-border bg-card shadow-xs p-5 hover:shadow-md transition-all">
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Lançamentos
          </span>
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold">
            <FileText className="h-5 w-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          {String(stats.totalCount).padStart(2, "0")}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Manutenções registradas</p>
      </div>

      <div className="min-w-[260px] sm:min-w-0 shrink-0 sm:shrink flex-1 sm:flex-initial rounded-[24px] border border-border bg-card shadow-xs p-5 hover:shadow-md transition-all">
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Motoboys Atendidos
          </span>
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold">
            <Users className="h-5 w-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          {String(stats.uniqueMotoboys).padStart(2, "0")}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Colaboradores com serviços</p>
      </div>
    </div>
  );
}
