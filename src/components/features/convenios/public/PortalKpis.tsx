import { Card, CardContent } from "@/components/ui/card";
import { KpiGridSkeleton } from "@/components/skeletons";
import { DollarSign, FileText } from "lucide-react";

interface PortalKpisProps {
  isLoading: boolean;
  totalValueFormatted: string;
  lancamentosCount: number;
}

export function PortalKpis({
  isLoading,
  totalValueFormatted,
  lancamentosCount,
}: PortalKpisProps) {
  if (isLoading) {
    return (
      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex sm:grid sm:grid-cols-2 gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1 sm:pb-0">
        <KpiGridSkeleton count={2} cols={2} />
      </div>
    );
  }

  return (
    <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex sm:grid sm:grid-cols-2 gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1 sm:pb-0">
      <Card className="rounded-[24px] border border-border bg-card shadow-xs min-w-[240px] sm:min-w-0 flex-1">
        <CardContent className="p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5 text-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total do Mês
            </span>
            <span className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              {totalValueFormatted}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border border-border bg-card shadow-xs min-w-[180px] sm:min-w-0 flex-1">
        <CardContent className="p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Lançamentos
            </span>
            <span className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              {lancamentosCount}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
