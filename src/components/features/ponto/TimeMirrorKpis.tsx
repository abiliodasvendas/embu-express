import { Badge } from "@/components/ui/badge";
import { messages } from "@/constants/messages";
import { cn } from "@/lib/utils";
import type { EspelhoPontoMensal } from "@/types/ponto-relatorio";
import { formatMinutes } from "@/utils/ponto";

interface TimeMirrorKpisProps {
  activeReport: EspelhoPontoMensal;
  hourBalance: number;
  isCurrentPeriod: boolean;
}

export function TimeMirrorKpis({
  activeReport,
  hourBalance,
  isCurrentPeriod,
}: TimeMirrorKpisProps) {
  const { kpis } = activeReport;

  return (
    <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex sm:grid sm:grid-cols-2 md:grid-cols-4 gap-3 overflow-x-auto [scrollbar-width:none] pb-1 sm:pb-0">
      <div className="min-w-[160px] sm:min-w-0 flex-1 bg-card border border-border rounded-[18px] sm:rounded-[20px] p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {messages.ponto.labels.saldoAtual}
          </span>
          {isCurrentPeriod && (
            <Badge
              variant="outline"
              className="text-[9px] font-semibold text-muted-foreground border-border h-5 px-1.5 leading-none"
            >
              PROPORCIONAL
            </Badge>
          )}
        </div>
        <div className="flex flex-col">
          <span
            className={cn(
              "text-xl sm:text-2xl font-bold font-mono tracking-tight",
              hourBalance > 0 ? "text-emerald-600 dark:text-emerald-400" : hourBalance < 0 ? "text-destructive" : "text-foreground"
            )}
          >
            {formatMinutes(hourBalance, true)}
          </span>
          <span className="text-[11px] text-muted-foreground font-medium mt-1">
            {formatMinutes(kpis.horas_trabalhadas)} realizados / {formatMinutes(kpis.horas_esperadas)} esperados
          </span>
        </div>
      </div>

      <div className="min-w-[160px] sm:min-w-0 flex-1 bg-card border border-border rounded-[18px] sm:rounded-[20px] p-4 shadow-xs flex flex-col justify-between">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Com Atividade
        </span>
        <div className="flex flex-col">
          <span className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            {kpis.dias_trabalhados} <span className="text-xs text-muted-foreground uppercase">dias</span>
          </span>
          <span className="text-[11px] text-muted-foreground font-medium mt-1">
            Esperado: {kpis.dias_meta_turno} dias
          </span>
        </div>
      </div>

      <div className="min-w-[160px] sm:min-w-0 flex-1 bg-card border border-border rounded-[18px] sm:rounded-[20px] p-4 shadow-xs flex flex-col justify-between">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {messages.ponto.labels.ausencias}
        </span>
        <div className="flex flex-col">
          <span
            className={cn(
              "text-xl sm:text-2xl font-bold font-mono tracking-tight",
              kpis.dias_ausencias === 0 ? "text-foreground" : "text-destructive"
            )}
          >
            {kpis.dias_ausencias}
          </span>
          <span className="text-[11px] text-muted-foreground font-medium mt-1">
            {formatMinutes(kpis.horas_ausencias)} perdidas
          </span>
        </div>
      </div>

      <div className="min-w-[160px] sm:min-w-0 flex-1 bg-card border border-border rounded-[18px] sm:rounded-[20px] p-4 shadow-xs flex flex-col justify-between">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {messages.ponto.labels.rodagemKm}
        </span>
        <div className="flex flex-col">
          <span className="text-xl sm:text-2xl font-bold text-foreground font-mono tracking-tight">
            {kpis.km_realizado} <span className="text-xs font-normal opacity-70">km</span>
          </span>
          <span className="text-[11px] text-muted-foreground font-medium mt-1">
            Saldo: {kpis.km_saldo <= 0 ? `+${Math.abs(kpis.km_saldo)}` : `-${kpis.km_saldo}`} km
          </span>
        </div>
      </div>
    </div>
  );
}
