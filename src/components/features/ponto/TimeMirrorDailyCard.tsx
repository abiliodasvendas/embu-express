import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatMinutes } from "@/utils/ponto";
import { PontoDiarioRelatorio } from "@/types/ponto-relatorio";
import { CALENDARIO_STATUS } from "@/constants/financeiro.constants";
import { messages } from "@/constants/messages";

interface TimeMirrorDailyCardProps {
    day: PontoDiarioRelatorio;
    canViewAll: boolean;
    isFetchingRecord?: boolean;
    selectedPontoId?: number | null;
    onClick: (id: number) => void;
}

export function TimeMirrorDailyCard({
    day,
    canViewAll,
    isFetchingRecord,
    selectedPontoId,
    onClick
}: TimeMirrorDailyCardProps) {
    const isLack = day.status === CALENDARIO_STATUS.FALTA;
    const isWorked = day.status === CALENDARIO_STATUS.TRABALHADO;
    const isFuture = day.status === CALENDARIO_STATUS.FUTURO;
    const isNotVigente = day.status === CALENDARIO_STATUS.NAO_VIGENTE;

    const getStatusLabels = () => {
        switch (day.status) {
            case CALENDARIO_STATUS.TRABALHADO:
                return { label: messages.ponto.labels.trabalhado, badge: messages.ponto.labels.ok };
            case CALENDARIO_STATUS.FALTA:
                return { label: messages.ponto.labels.falta, badge: messages.ponto.labels.falta };
            case CALENDARIO_STATUS.NAO_VIGENTE:
                return { label: messages.ponto.labels.naoVigente, badge: messages.ponto.labels.off };
            case CALENDARIO_STATUS.FUTURO:
                return { label: messages.ponto.labels.dataFutura, badge: messages.ponto.labels.futuro };
            default:
                return { label: messages.ponto.labels.escalado, badge: messages.ponto.labels.vazio };
        }
    };

    const { label: labelStatus, badge: badgeLabel } = getStatusLabels();

    return (
        <Card
            className={cn(
                "border border-gray-100 shadow-sm rounded-[1.5rem] overflow-hidden group transition-all duration-300 relative",
                isWorked ? "hover:shadow-md cursor-pointer active:scale-[0.99]" : "cursor-default",
                isFetchingRecord && selectedPontoId === day.dia && "opacity-60 cursor-wait",
                isNotVigente && "opacity-40 grayscale pointer-events-none"
            )}
            onClick={() => isWorked && !isFetchingRecord && onClick(day.dia)}
        >
            {/* Sidebar de Status - Estética Premium */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1.5 transition-colors",
                isWorked ? "bg-emerald-500" :
                    isLack ? "bg-red-500" :
                        isFuture ? "bg-gray-300" : "bg-gray-100"
            )} />

            <CardContent className="p-4 md:py-3 md:px-6">
                <div className={cn(
                    "grid items-center gap-4",
                    canViewAll ? "grid-cols-10" : "grid-cols-5",
                    isFuture && "opacity-60"
                )}>
                    {/* Date & Client */}
                    <div className="flex items-center gap-3 col-span-1 md:col-span-2">
                        <div className={cn(
                            "h-10 w-10 rounded-xl transition-colors flex flex-col items-center justify-center shrink-0",
                            isLack ? "bg-red-50" : isWorked ? "bg-emerald-50" : "bg-gray-50"
                        )}>
                            <span className={cn(
                                "text-[10px] uppercase font-bold leading-none mb-0.5",
                                isLack ? "text-red-400" : isWorked ? "text-emerald-400" : "text-gray-400"
                            )}>
                                {day.dia_semana_curto}
                            </span>
                            <span className={cn(
                                "text-sm font-black",
                                isLack ? "text-red-600" : isWorked ? "text-emerald-600" : "text-gray-700"
                            )}>
                                {String(day.dia).padStart(2, '0')}
                            </span>
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 line-clamp-1 leading-tight text-sm">
                                {day.cliente_nome || (isNotVigente ? messages.ponto.labels.foraVigencia : messages.ponto.labels.semEscala)}
                            </h4>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">
                                {labelStatus}
                            </p>
                        </div>
                    </div>

                    {/* Badge Status */}
                    <div className="hidden md:block">
                        <Badge variant="secondary" className={cn(
                            "text-[10px] uppercase font-bold px-2 py-0 border-none h-5",
                            isLack ? "bg-red-100 text-red-600" :
                                isWorked ? "bg-emerald-100 text-emerald-600" :
                                    "bg-gray-100 text-gray-500"
                        )}>
                            {badgeLabel}
                        </Badge>
                    </div>

                    {/* Entrada (Esperado vs Realizado) */}
                    <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{messages.ponto.labels.entrada}</p>
                        <div className="flex flex-col">
                            {day.shift_entrada && (
                                <span className="text-[10px] text-gray-400 font-medium leading-none mb-1">{messages.ponto.labels.referenciaPrefix} {day.shift_entrada}</span>
                            )}
                            <p className={cn("text-sm font-black leading-tight", day.entrada_hora ? "text-gray-900" : "text-gray-300")}>
                                {day.entrada_hora ? day.entrada_hora.substring(11, 16) : '--:--'}
                            </p>
                        </div>
                    </div>

                    {/* Saída (Esperado vs Realizado) */}
                    <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{messages.ponto.labels.saida}</p>
                        <div className="flex flex-col">
                            {day.shift_saida && (
                                <span className="text-[10px] text-gray-400 font-medium leading-none mb-1">{messages.ponto.labels.referenciaPrefix} {day.shift_saida}</span>
                            )}
                            <p className={cn("text-sm font-black leading-tight", day.saida_hora ? "text-gray-900" : "text-gray-300")}>
                                {day.saida_hora ? day.saida_hora.substring(11, 16) : '--:--'}
                            </p>
                        </div>
                    </div>

                    {/* Detalhes Admin */}
                    {canViewAll && (
                        <>
                            {/* KM Percorrido */}
                            <div className="text-center">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{messages.ponto.labels.kmRodado}</p>
                                <p className={cn("text-sm font-bold", (day.km_fim && day.km_inicio) ? "text-gray-700" : "text-gray-300")}>
                                    {(day.km_fim && day.km_inicio) ? `${day.km_fim - day.km_inicio}km` : '---'}
                                </p>
                            </div>

                            {/* Trabalhado (Efetivo) */}
                            <div className="text-center">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{messages.ponto.labels.efetivo}</p>
                                <p className={cn("text-sm font-black", isWorked ? "text-gray-900" : "text-gray-300")}>
                                    {formatMinutes(day.minutos_trabalhados)}
                                </p>
                            </div>

                            {/* Carga (Esperado / Meta) */}
                            <div className="text-center">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{messages.ponto.labels.carga}</p>
                                <p className="text-xs font-bold text-gray-300">
                                    {formatMinutes(day.minutos_esperados)}
                                </p>
                            </div>

                            {/* Saldo Diário */}
                            <div className="text-right col-span-1 md:col-span-1">
                                <p className="md:hidden text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{messages.ponto.labels.saldo}</p>
                                {(isWorked || isLack) && (
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "rounded-full px-3 py-1 font-black text-[10px] tracking-tight shrink-0",
                                            day.minutos_saldo > 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                day.minutos_saldo < 0 ? "bg-red-50 text-red-600 border-red-100" :
                                                    "bg-gray-50 text-gray-500 border-gray-100"
                                        )}
                                    >
                                        {formatMinutes(day.minutos_saldo, true)}
                                    </Badge>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
