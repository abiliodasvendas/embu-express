import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PONTO_STATUS_UI_CONFIG } from "@/config/ponto-ui";
import { cn } from "@/lib/utils";
import { RegistroPonto } from "@/types/database";
import { ActionItem } from "@/types/actions";
import { ManagementStatus } from "@/types/enums";
import { formatMinutes, formatTime, getManagementStatus } from "@/utils/ponto";
import { Clock } from "lucide-react";

interface TimeRecordCardProps {
  record: RegistroPonto & { mgtStatus?: ManagementStatus };
  date: Date;
  onDetails?: (r: RegistroPonto) => void;
  actions?: ActionItem[];
  showActions?: boolean;
  showClient?: boolean;
  isManual?: boolean;
}

export function TimeRecordCard({
  record,
  date,
  onDetails,
  actions = [],
  showActions = true,
  showClient = false,
  isManual = false
}: TimeRecordCardProps) {
  const mStatus = record.mgtStatus || getManagementStatus(record, date);
  const config = PONTO_STATUS_UI_CONFIG[mStatus as ManagementStatus];

  const initials = record.usuario?.nome_completo
    ? record.usuario.nome_completo
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "--";

  return (
    <div
      onClick={() => showActions && onDetails?.(record)}
      className={cn(
        "rounded-[20px] sm:rounded-[24px] border border-border bg-card shadow-xs transition-all flex flex-col justify-between p-4 pl-5 h-full relative group overflow-hidden",
        showActions && onDetails ? "cursor-pointer hover:border-foreground/20 hover:shadow-sm" : "cursor-default"
      )}
    >
      <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", config.borderSide)} />

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-10 w-10 rounded-[14px] border border-border shrink-0">
              <AvatarImage src={record.usuario?.foto_url} className="rounded-[14px] object-cover" />
              <AvatarFallback className={cn("rounded-[14px] text-xs font-bold uppercase", config.color, config.bg)}>
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <h3 title={record.usuario?.nome_completo} className="font-semibold text-sm text-foreground leading-snug truncate">
                {record.usuario?.nome_completo}
              </h3>
              <div className="flex flex-col gap-0.5 mt-0.5">
                {showClient && record.cliente?.nome_fantasia && (
                  <p className="text-[10px] font-semibold text-foreground/80 uppercase tracking-wide truncate">
                    {record.cliente.nome_fantasia}
                  </p>
                )}
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                  {record.detalhes_calculo?.entrada?.turno_base?.substring(0, 5) || "--:--"} - {record.detalhes_calculo?.saida?.turno_base?.substring(0, 5) || "--:--"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-end gap-1">
              <Badge className={cn("text-[9px] uppercase font-bold px-2 py-0.5 rounded-[8px] border-none shrink-0", config.bg, config.color)}>
                {config.label}
              </Badge>
              {isManual && mStatus === ManagementStatus.ABSENT && (
                <Badge variant="outline" className="text-[9px] font-semibold bg-muted text-muted-foreground border-border px-1.5 py-0.5 rounded-[6px] shrink-0">
                  MANUAL
                </Badge>
              )}
            </div>
            {showActions && actions.length > 0 && <ActionsDropdown actions={actions} />}
          </div>
        </div>

        <div className="flex items-end justify-between border-t border-border/50 pt-3">
          <div className="space-y-0.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Entrada</p>
            <p className={cn("text-base font-semibold font-mono leading-none", record.entrada_hora ? "text-foreground" : "text-muted-foreground/60")}>
              {record.entrada_hora ? formatTime(record.entrada_hora) : (mStatus === ManagementStatus.ABSENT ? "Faltou" : "Pendente")}
            </p>
          </div>
          <div className="space-y-0.5 text-right">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Saída</p>
            <p className={cn("text-base font-semibold font-mono leading-none", record.saida_hora ? "text-foreground" : "text-muted-foreground/60")}>
              {record.saida_hora ? formatTime(record.saida_hora) : "--:--"}
            </p>
          </div>
        </div>
      </div>

      {record.entrada_hora && record.saida_hora && (
        <div className="rounded-[14px] bg-muted/40 border border-border/60 p-2.5 flex items-center justify-between mt-3">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold font-mono text-foreground">
              {record.detalhes_calculo?.resumo?.horas_trabalhadas || "00:00"}
            </span>
          </div>
          {record.saldo_minutos !== undefined && record.saldo_minutos !== null && (
            <span
              className={cn(
                "text-xs font-bold font-mono",
                record.saldo_minutos >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              )}
            >
              {formatMinutes(record.saldo_minutos, true)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
