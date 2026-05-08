import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PONTO_STATUS_UI_CONFIG } from "@/config/ponto-ui";
import { cn } from "@/lib/utils";
import { RegistroPonto } from "@/types/database";
import { ManagementStatus } from "@/types/enums";
import { formatMinutes, formatTime, getManagementStatus } from "@/utils/ponto";
import { Clock } from "lucide-react";

interface TimeRecordCardProps {
    record: RegistroPonto;
    date: Date;
    onDetails?: (r: RegistroPonto) => void;
    actions?: any[];
    showActions?: boolean;
    showClient?: boolean;
}

export function TimeRecordCard({
    record,
    date,
    onDetails,
    actions = [],
    showActions = true,
    showClient = false
}: TimeRecordCardProps) {
    const mStatus = getManagementStatus(record, date);
    const config = PONTO_STATUS_UI_CONFIG[mStatus];

    const cardContent = (
        <Card
            onClick={() => showActions && onDetails?.(record)}
            className={cn(
                "bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all flex h-full relative",
                showActions && onDetails ? "cursor-pointer hover:shadow-md hover:border-blue-100" : "cursor-default"
            )}
        >
            {/* Sidebar de Status - Estilo Premium Absoluto */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", config.borderSide)} />

            <div className="flex-1 p-3 pl-6 flex flex-col h-full justify-between gap-2.5">
                {/* Header: Avatar + Info */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 border shadow-sm shrink-0">
                            <AvatarImage src={record.usuario?.foto_url} />
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold uppercase">
                                {record.usuario?.nome_completo?.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <h3 title={record.usuario?.nome_completo} className="font-bold text-gray-900 leading-tight line-clamp-1">{record.usuario?.nome_completo}</h3>
                            <div className="flex flex-col gap-0.5 mt-0.5">
                                {showClient && record.cliente?.nome_fantasia && (
                                    <p className="text-[10px] font-semibold text-gray-900 uppercase tracking-wide">
                                        {record.cliente.nome_fantasia}
                                    </p>
                                )}
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                                    Turno: {record.detalhes_calculo?.entrada?.turno_base?.substring(0, 5) || "--:--"} - {record.detalhes_calculo?.saida?.turno_base?.substring(0, 5) || "--:--"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Badge className={cn("text-[8px] hover:bg-inherit uppercase font-black px-1.5 h-5 rounded-md border-none shrink-0", config.bg, config.color)}>
                            {config.label}
                        </Badge>
                        {showActions && actions.length > 0 && <ActionsDropdown actions={actions} />}
                    </div>
                </div>

                {/* Horários: Entrada e Saída */}
                <div className="flex items-end justify-between border-t border-gray-50 pt-2.5 mt-auto">
                    <div className="space-y-1">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Entrada</p>
                        <p className={cn("text-base font-black leading-none", record.entrada_hora ? "text-gray-900" : "text-gray-300")}>
                            {record.entrada_hora ? formatTime(record.entrada_hora) : (mStatus === ManagementStatus.ABSENT ? "Faltou" : "Pendente")}
                        </p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Saída</p>
                        <p className={cn("text-base font-black leading-none", record.saida_hora ? "text-gray-900" : "text-gray-300")}>
                            {record.saida_hora ? formatTime(record.saida_hora) : "--:--"}
                        </p>
                    </div>
                </div>

                {/* Rodapé: Total e Saldo (Apenas se finalizado) */}
                {record.entrada_hora && record.saida_hora && (
                    <div className="bg-gray-50/50 rounded-xl p-2.5 flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-[11px] font-bold text-gray-700">{record.detalhes_calculo?.resumo?.horas_trabalhadas || "00:00"}</span>
                        </div>
                        {record.saldo_minutos !== undefined && record.saldo_minutos !== null && (
                            <span className={cn(
                                "text-[10px] font-black",
                                record.saldo_minutos >= 0 ? "text-emerald-600" : "text-rose-600"
                            )}>
                                {formatMinutes(record.saldo_minutos, true)}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );

    return <div className="h-full">{cardContent}</div>;
}

