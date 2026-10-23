import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { MapPinned, Users, CheckCircle2 } from "lucide-react";

interface ClientStatsGridProps {
  totalUnits: number;
  totalVinculos: number;
  ativo: boolean;
}

export function ClientStatsGrid({
  totalUnits,
  totalVinculos,
  ativo,
}: ClientStatsGridProps) {
  return (
    <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex gap-3 overflow-x-auto [scrollbar-width:none] pb-1 sm:grid sm:grid-cols-3">
      <Card className="min-w-[220px] sm:min-w-0 flex-1 rounded-[18px] border border-border bg-card shadow-xs">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center">
              <MapPinned className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total de Unidades
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {String(totalUnits).padStart(2, "0")}
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-[220px] sm:min-w-0 flex-1 rounded-[18px] border border-border bg-card shadow-xs">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Colaboradores
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {String(totalVinculos).padStart(2, "0")}
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-[220px] sm:min-w-0 flex-1 rounded-[18px] border border-border bg-card shadow-xs">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Status
            </span>
          </div>
          <div className="flex items-center gap-2 pt-0.5">
            <StatusBadge status={ativo} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
