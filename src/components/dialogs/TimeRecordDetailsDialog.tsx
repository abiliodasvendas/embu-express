import { Can } from "@/components/auth/Can";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { StatusVisualPonto } from "@/types/enums";
import { cn } from "@/lib/utils";
import { RegistroPonto, Pausa } from "@/types/database";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { formatKm } from "@/utils/masks";
import { formatMinutes, getStatusColorClass, getStatusLabel, formatTime } from "@/utils/ponto";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Building2, CalendarClock, Clock, Edit2, MapPin, Pause } from "lucide-react";
import { usePermissions } from "@/hooks/business/usePermissions";

interface TimeRecordDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  record: RegistroPonto | null;
  onEdit: (record: RegistroPonto) => void;
  onDelete?: (record: RegistroPonto) => void;
}

export function TimeRecordDetailsDialog({
  isOpen,
  onClose,
  record,
  onEdit
}: TimeRecordDetailsDialogProps) {
  const { can } = usePermissions();
  if (!record) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-").map(Number);
    return format(new Date(year, month - 1, day), "d 'de' MMMM, yyyy", { locale: ptBR });
  };

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const handleEdit = () => {
    safeCloseDialog(() => onEdit(record));
  };

  const pausas: Pausa[] = record.pausas || [];

  const initials = record.usuario?.nome_completo
    ? record.usuario.nome_completo
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "--";

  const renderCalculationDetails = (type: "entrada" | "saida") => {
    const details = record.detalhes_calculo?.[type];
    const timeIso = type === "entrada" ? record.entrada_hora : record.saida_hora;
    const status = type === "entrada" ? record.status_entrada : record.status_saida;

    if (!details || !timeIso) {
      return (
        <div className="bg-muted/30 rounded-[18px] p-4 border border-border flex items-center justify-center h-full min-h-[120px]">
          <p className="text-xs text-muted-foreground italic text-center">
            Aguardando registro para calcular...
          </p>
        </div>
      );
    }

    const diff = details.diff_minutos;

    return (
      <div className="bg-card rounded-[18px] p-4 space-y-2.5 border border-border shadow-xs">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Registrado</span>
          <span className="font-semibold text-foreground font-mono text-sm">{formatTime(timeIso)}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Turno Base</span>
          <span className="font-medium text-foreground font-mono">{details.turno_base?.substring(0, 5) || "--:--"}</span>
        </div>
        <div className="border-t border-border/50 pt-2 flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Diferença</span>
          <span className="font-semibold font-mono text-foreground">
            {formatMinutes(diff)}
          </span>
        </div>
        <div className="pt-1 text-center">
          <span className={`text-[10px] px-2.5 py-0.5 rounded-[8px] border uppercase tracking-wider font-semibold ${getStatusColorClass(status, type)}`}>
            {getStatusLabel(status, type)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={(val) => !val && handleClose()} maxWidth="lg">
      <BaseDialog.Header
        title="Detalhes da Atividade"
        subtitle="Visualização operacional completa da jornada"
        icon={<CalendarClock className="w-5 h-5 text-foreground" />}
      />

      <BaseDialog.Body className="space-y-5">
        <div className="bg-muted/30 p-4 rounded-[20px] border border-border flex flex-col items-center text-center space-y-2">
          <Avatar className="h-12 w-12 rounded-[14px] border border-border bg-muted/70">
            <AvatarImage src={record.usuario?.foto_url} className="rounded-[14px] object-cover" />
            <AvatarFallback className="rounded-[14px] text-sm font-semibold text-foreground uppercase">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-base font-semibold text-foreground leading-tight">
              {record.usuario?.nome_completo}
            </h3>
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>
                {record.cliente?.nome_fantasia || record.usuario?.links?.[0]?.cliente?.nome_fantasia || "Sem Cliente"}
              </span>
              {record.colaborador_cliente?.unidade?.nome_unidade && (
                <span className="text-muted-foreground font-medium">
                  • {record.colaborador_cliente.unidade.nome_unidade}
                </span>
              )}
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground mt-0.5">
              <MapPin className="w-3 h-3" />
              <span>{formatDate(record.data_referencia)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-[20px] p-4 border border-border bg-card space-y-4 shadow-xs">
          <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Linha do Tempo
          </h4>

          <div className="relative pl-6 space-y-4 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            {record.entrada_hora && (
              <div className="relative">
                <div className="absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full bg-foreground border border-background shadow-xs z-10" />
                <div className="flex justify-between items-center w-full">
                  <div>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Entrada</span>
                    <span className="text-sm font-semibold font-mono text-foreground">{formatTime(record.entrada_hora)}</span>
                  </div>
                  {record.entrada_km !== null && record.entrada_km !== undefined && (
                    <Badge variant="outline" className="text-[10px] font-mono font-semibold bg-muted/60 text-foreground border-border">
                      {formatKm(record.entrada_km)}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {pausas.map((p, idx) => (
              <div key={p.id} className="space-y-3">
                <div className="relative">
                  <div className="absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full bg-muted-foreground border border-background shadow-xs z-10" />
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Pausa #{idx + 1}</span>
                      <span className="text-sm font-semibold font-mono text-foreground">{format(new Date(p.inicio_hora), "HH:mm")}</span>
                    </div>
                    {p.inicio_km !== null && p.inicio_km !== undefined && (
                      <Badge variant="outline" className="text-[10px] font-mono font-semibold bg-muted/60 text-foreground border-border">
                        {formatKm(p.inicio_km)}
                      </Badge>
                    )}
                  </div>
                </div>

                {p.fim_hora && (
                  <div className="relative">
                    <div className="absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full bg-muted-foreground border border-background shadow-xs z-10" />
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold font-mono text-foreground">{format(new Date(p.fim_hora), "HH:mm")}</span>
                        <span className="text-[10px] text-muted-foreground italic">Retorno</span>
                      </div>
                      {p.fim_km !== undefined && p.fim_km !== null && (
                        <Badge variant="outline" className="text-[10px] font-mono font-semibold bg-muted/60 text-foreground border-border">
                          {formatKm(p.fim_km)}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {record.saida_hora && (
              <div className="relative">
                <div className="absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full bg-foreground border border-background shadow-xs z-10" />
                <div className="flex justify-between items-center w-full">
                  <div>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Saída</span>
                    <span className="text-sm font-semibold font-mono text-foreground">{formatTime(record.saida_hora)}</span>
                  </div>
                  {record.saida_km !== null && record.saida_km !== undefined && (
                    <Badge variant="outline" className="text-[10px] font-mono font-semibold bg-muted/60 text-foreground border-border">
                      {formatKm(record.saida_km)}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card p-3 rounded-[18px] border border-border shadow-xs flex flex-col items-center justify-center text-center col-span-2">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-0.5">Saldo Diário</span>
            <span className={cn(
              "text-lg font-bold font-mono",
              record.saldo_minutos !== undefined && record.saldo_minutos !== null
                ? (record.saldo_minutos >= 0 ? "text-foreground" : "text-destructive")
                : "text-muted-foreground"
            )}>
              {record.entrada_hora && record.saida_hora && record.saldo_minutos !== undefined && record.saldo_minutos !== null
                ? formatMinutes(record.saldo_minutos)
                : "--:--"}
            </span>
          </div>

          <div className="bg-card p-3 rounded-[18px] border border-border shadow-xs flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-0.5">Trabalhadas</span>
            <span className="text-base font-semibold text-foreground font-mono">
              {record.entrada_hora && record.saida_hora ? (record.detalhes_calculo?.resumo?.horas_trabalhadas || "--:--") : "--:--"}
            </span>
          </div>

          <div className="bg-card p-3 rounded-[18px] border border-border shadow-xs flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-0.5">Em Pausa</span>
            <span className="text-base font-semibold text-foreground font-mono">
              {record.entrada_hora && record.saida_hora ? (record.detalhes_calculo?.resumo?.horas_pausa || "--:--") : "--:--"}
            </span>
          </div>

          <div className="bg-card p-3 rounded-[18px] border border-border shadow-xs flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-0.5">KM Trabalhado</span>
            <span className="text-base font-semibold text-foreground font-mono">
              {record.entrada_hora && record.saida_hora && record.detalhes_calculo?.resumo?.km_trabalhado !== undefined
                ? formatKm(record.detalhes_calculo.resumo.km_trabalhado)
                : "--"}
            </span>
          </div>

          <div className="bg-card p-3 rounded-[18px] border border-border shadow-xs flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-0.5">KM em Pausa</span>
            <span className="text-base font-semibold text-foreground font-mono">
              {record.entrada_hora && record.saida_hora && record.detalhes_calculo?.resumo?.km_pausa !== undefined
                ? formatKm(record.detalhes_calculo.resumo.km_pausa)
                : "--"}
            </span>
          </div>
        </div>

        {pausas.length > 0 && (
          <div className="bg-card rounded-[20px] p-4 border border-border space-y-3 shadow-xs">
            <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Pause className="w-3.5 h-3.5 text-muted-foreground" />
              Histórico de Pausas
            </h4>

            <div className="space-y-2">
              {pausas.map((p, idx) => {
                const start = new Date(p.inicio_hora);
                const end = p.fim_hora ? new Date(p.fim_hora) : null;
                const duration = end ? Math.round((end.getTime() - start.getTime()) / 60000) : null;

                return (
                  <div key={p.id} className="text-xs bg-muted/30 p-2.5 rounded-[14px] border border-border/70 flex justify-between items-center">
                    <div className="flex gap-2.5 items-center">
                      <div className="w-6 h-6 rounded-[8px] bg-muted border border-border flex items-center justify-center font-bold text-[10px] text-foreground shrink-0">
                        {idx + 1}
                      </div>
                      <span className="text-foreground font-mono text-xs">
                        {format(start, "HH:mm")} - {end ? format(end, "HH:mm") : "Em andamento..."}
                      </span>
                    </div>
                    {duration !== null && (
                      <Badge variant="outline" className="text-[10px] font-semibold bg-muted/60 text-foreground border-border">
                        {duration} min
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider pl-1">Cálculo Entrada</h4>
            {renderCalculationDetails("entrada")}
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider pl-1">Cálculo Saída</h4>
            {renderCalculationDetails("saida")}
          </div>
        </div>

        {record.observacao && (
          <div className="bg-muted/30 p-3.5 rounded-[18px] border border-border text-xs space-y-1">
            <span className="font-semibold uppercase tracking-wider block text-muted-foreground text-[10px]">Observações</span>
            <p className="leading-relaxed text-foreground font-normal">{record.observacao}</p>
          </div>
        )}
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <Button
          variant="outline"
          onClick={handleClose}
        >
          Fechar
        </Button>
        <Can I={PERMISSIONS.PONTO.ADMIN_EDITAR}>
          <Button
            onClick={handleEdit}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            {record.ausente ? "Registrar Atividade" : "Editar Atividade"}
          </Button>
        </Can>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
