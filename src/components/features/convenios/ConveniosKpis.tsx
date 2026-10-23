import { KpiGridSkeleton } from "@/components/skeletons";
import { formatCurrency } from "@/utils/formatters/currency";
import { FileText, Receipt, ShieldCheck, Users } from "lucide-react";

interface ConveniosKpisProps {
  totais?: {
    total_geral_consumido?: number;
    total_motoboys?: number;
    total_moto_embu_david?: number;
    total_faturas_fornecedores?: number;
  };
  isLoading: boolean;
}

export function ConveniosKpis({ totais, isLoading }: ConveniosKpisProps) {
  if (isLoading) {
    return <KpiGridSkeleton count={4} cols={4} />;
  }

  return (
    <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1 sm:pb-0">
      <div className="min-w-[260px] sm:min-w-0 shrink-0 sm:shrink flex-1 sm:flex-initial rounded-[24px] border border-border bg-card shadow-xs p-5 hover:shadow-md transition-all">
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Consumido no Mês
          </span>
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold">
            <Receipt className="h-5 w-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          {formatCurrency(totais?.total_geral_consumido || 0)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Soma de postos e oficinas parceiras</p>
      </div>

      <div className="min-w-[260px] sm:min-w-0 shrink-0 sm:shrink flex-1 sm:flex-initial rounded-[24px] border border-border bg-card shadow-xs p-5 hover:shadow-md transition-all">
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Descontado dos Motoboys
          </span>
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold">
            <Users className="h-5 w-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          {formatCurrency(totais?.total_motoboys || 0)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Deduções aplicadas nos holerites</p>
      </div>

      <div className="min-w-[260px] sm:min-w-0 shrink-0 sm:shrink flex-1 sm:flex-initial rounded-[24px] border border-border bg-card shadow-xs p-5 hover:shadow-md transition-all">
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Moto Embu
          </span>
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          {formatCurrency(totais?.total_moto_embu_david || 0)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Custos assumidos pela empresa</p>
      </div>

      <div className="min-w-[260px] sm:min-w-0 shrink-0 sm:shrink flex-1 sm:flex-initial rounded-[24px] border border-border bg-card shadow-xs p-5 hover:shadow-md transition-all">
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Faturas / Cobranças
          </span>
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold">
            <FileText className="h-5 w-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          {formatCurrency(totais?.total_faturas_fornecedores || 0)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Faturas conciliadas com parceiros</p>
      </div>
    </div>
  );
}
