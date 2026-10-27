import { Badge } from "@/components/ui/badge";
import { CALENDARIO_STATUS } from "@/constants/financeiro.constants";
import { messages } from "@/constants/messages";
import { cn } from "@/lib/utils";
import { PontoDiarioRelatorio } from "@/types/ponto-relatorio";
import { formatMinutes } from "@/utils/ponto";
import { MessageSquare, Trash2 } from "lucide-react";

interface TimeMirrorDailyCardProps {
  day: PontoDiarioRelatorio;
  canViewAll: boolean;
  isFetchingRecord?: boolean;
  selectedPontoId?: number | null;
  onClick: (day: PontoDiarioRelatorio) => void;
  onDelete?: (id: number) => void;
  isActionable?: boolean;
}

export function TimeMirrorDailyCard({
  day,
  canViewAll,
  isFetchingRecord,
  selectedPontoId,
  onClick,
  onDelete,
  isActionable = false
}: TimeMirrorDailyCardProps) {
  const isLack = day.status === CALENDARIO_STATUS.SEM_ATIVIDADE;
  const isWorked = day.status === CALENDARIO_STATUS.TRABALHADO;
  const isFuture = day.status === CALENDARIO_STATUS.FUTURO;
  const isNotVigente = day.status === CALENDARIO_STATUS.NAO_VIGENTE;
  const isFeriado = day.status === CALENDARIO_STATUS.FERIADO;

  const getStatusLabels = () => {
    switch (day.status) {
      case CALENDARIO_STATUS.TRABALHADO:
        return { label: messages.ponto.labels.trabalhado, badge: messages.ponto.labels.ok };
      case CALENDARIO_STATUS.SEM_ATIVIDADE:
        return { label: messages.ponto.labels.ausencia, badge: messages.ponto.labels.ausencia };
      case CALENDARIO_STATUS.NAO_VIGENTE:
        return { label: messages.ponto.labels.naoVigente, badge: messages.ponto.labels.off };
      case CALENDARIO_STATUS.FUTURO:
        return { label: messages.ponto.labels.dataFutura, badge: messages.ponto.labels.futuro };
      case CALENDARIO_STATUS.FERIADO:
        return { label: "Feriado", badge: "Feriado" };
      default:
        return { label: messages.ponto.labels.escalado, badge: messages.ponto.labels.vazio };
    }
  };

  const { label: labelStatus, badge: badgeLabel } = getStatusLabels();
  const isClickable = (isWorked || (isActionable && !isNotVigente)) && !isFetchingRecord;

  return (
    <div
      className={cn(
        "border border-border bg-card shadow-xs rounded-[18px] sm:rounded-[20px] transition-all p-3.5 sm:p-4 relative group",
        isClickable ? "hover:border-foreground/20 hover:shadow-sm cursor-pointer active:scale-[0.99]" : "cursor-default",
        isFetchingRecord && selectedPontoId === day.dia && "opacity-60 cursor-wait",
        isNotVigente && "opacity-40 grayscale pointer-events-none"
      )}
      onClick={() => isClickable && onClick(day)}
    >
      <div
        className={cn(
          "grid gap-y-3 gap-x-2 md:gap-4 items-center",
          canViewAll ? "grid-cols-2 md:grid-cols-11" : "grid-cols-2 md:grid-cols-6",
          isFuture && "opacity-60"
        )}
      >
        <div className="flex items-center gap-3 col-span-2 md:col-span-2 min-w-0">
          <div className="w-10 h-10 rounded-[12px] bg-muted/70 border border-border flex flex-col items-center justify-center shrink-0 relative">
            <span className="text-[9px] uppercase font-semibold text-muted-foreground leading-none mb-0.5">
              {day.dia_semana_curto}
            </span>
            <span className="text-sm font-bold text-foreground">
              {String(day.dia).padStart(2, "0")}
            </span>
            {day.observacao && (
              <div className="absolute -top-1 -right-1 bg-foreground text-background p-0.5 rounded-full ring-1 ring-border">
                <MessageSquare className="w-2.5 h-2.5 fill-current" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-foreground truncate text-xs sm:text-sm leading-tight">
              {day.cliente_nome || (isNotVigente ? messages.ponto.labels.foraVigencia : messages.ponto.labels.semEscala)}
            </h4>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate mt-0.5">
              {day.unidade_nome || labelStatus}
            </p>
          </div>

          {onDelete && day.ponto_id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(day.ponto_id as number);
              }}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-[10px] transition-colors shrink-0 print:hidden cursor-pointer"
              title="Excluir marcação"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="hidden md:block md:col-span-2">
          <Badge
            variant="outline"
            className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-[8px] bg-muted/70 text-foreground border-border whitespace-nowrap"
          >
            {badgeLabel}
          </Badge>
        </div>

        <div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">{messages.ponto.labels.entrada}</p>
          <div className="flex flex-col">
            {day.shift_entrada && (
              <span className="text-[9px] text-muted-foreground/70 font-mono leading-none mb-0.5">{messages.ponto.labels.referenciaPrefix} {day.shift_entrada}</span>
            )}
            <p className={cn("text-xs sm:text-sm font-semibold font-mono leading-tight", day.entrada_hora ? "text-foreground" : "text-muted-foreground/50")}>
              {day.entrada_hora ? day.entrada_hora.substring(11, 16) : "--:--"}
            </p>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">{messages.ponto.labels.saida}</p>
          <div className="flex flex-col">
            {day.shift_saida && (
              <span className="text-[9px] text-muted-foreground/70 font-mono leading-none mb-0.5">{messages.ponto.labels.referenciaPrefix} {day.shift_saida}</span>
            )}
            <p className={cn("text-xs sm:text-sm font-semibold font-mono leading-tight", day.saida_hora ? "text-foreground" : "text-muted-foreground/50")}>
              {day.saida_hora ? day.saida_hora.substring(11, 16) : "--:--"}
            </p>
          </div>
        </div>

        {canViewAll && (
          <>
            <div className="text-center">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">{messages.ponto.labels.kmRodado}</p>
              <p className={cn("text-xs sm:text-sm font-semibold font-mono", day.km_rodado > 0 ? "text-foreground" : "text-muted-foreground/50")}>
                {day.km_rodado > 0 ? `${day.km_rodado}km` : "---"}
              </p>
            </div>

            <div className="text-center">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">{messages.ponto.labels.efetivo}</p>
              <p className={cn("text-xs sm:text-sm font-semibold font-mono", day.minutos_trabalhados > 0 ? "text-foreground" : "text-muted-foreground/50")}>
                {formatMinutes(day.minutos_trabalhados)}
              </p>
            </div>

            <div className="text-center">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">{messages.ponto.labels.esperado}</p>
              <p className="text-xs sm:text-sm font-normal font-mono text-muted-foreground">
                {formatMinutes(day.minutos_esperados)}
              </p>
            </div>

            <div className="text-right col-span-2">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">{messages.ponto.labels.saldoDia}</p>
              <p
                className={cn(
                  "text-xs sm:text-sm font-bold font-mono",
                  day.minutos_saldo > 0 ? "text-emerald-600 dark:text-emerald-400" : day.minutos_saldo < 0 ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {formatMinutes(day.minutos_saldo, true)}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
