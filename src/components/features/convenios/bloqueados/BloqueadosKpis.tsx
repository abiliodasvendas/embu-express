import { ShieldAlert, Store } from "lucide-react";

interface BloqueadosKpisProps {
  totalRestricoes: number;
  totalGeral: number;
  totalEspecifico: number;
}

export function BloqueadosKpis({
  totalRestricoes,
  totalGeral,
  totalEspecifico,
}: BloqueadosKpisProps) {
  return (
    <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex sm:grid sm:grid-cols-3 gap-3 sm:gap-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1 sm:pb-0">
      <div className="min-w-[260px] sm:min-w-0 shrink-0 sm:shrink flex-1 sm:flex-initial rounded-[24px] border border-border bg-card shadow-xs p-5 hover:shadow-md transition-all">
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total de Restrições
          </span>
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          {totalRestricoes}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Colaboradores com bloqueios ativos</p>
      </div>

      <div className="min-w-[260px] sm:min-w-0 shrink-0 sm:shrink flex-1 sm:flex-initial rounded-[24px] border border-border bg-card shadow-xs p-5 hover:shadow-md transition-all">
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Bloqueio Geral
          </span>
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          {totalGeral}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Impedidos em todos os convênios</p>
      </div>

      <div className="min-w-[260px] sm:min-w-0 shrink-0 sm:shrink flex-1 sm:flex-initial rounded-[24px] border border-border bg-card shadow-xs p-5 hover:shadow-md transition-all">
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Bloqueio Parcial
          </span>
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold">
            <Store className="h-5 w-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          {totalEspecifico}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Restrições específicas ativas</p>
      </div>
    </div>
  );
}
