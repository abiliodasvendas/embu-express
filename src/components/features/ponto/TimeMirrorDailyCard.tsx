import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
        <Card
            className={cn(
                "border border-gray-100 shadow-sm rounded-[1.5rem] overflow-hidden group transition-all duration-300 relative",
                isClickable ? "hover:shadow-md cursor-pointer active:scale-[0.99]" : "cursor-default",
                isFetchingRecord && selectedPontoId === day.dia && "opacity-60 cursor-wait",
                isNotVigente && "opacity-40 grayscale pointer-events-none"
            )}
            onClick={() => isClickable && onClick(day)}
        >
            {/* Sidebar de Status - Estética Premium */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1.5 transition-colors",
                isWorked ? "bg-emerald-500" :
                    isLack ? "bg-red-500" :
                        isFeriado ? "bg-teal-500" :
                            isFuture ? "bg-gray-300" : "bg-gray-100"
            )} />

            <CardContent className="p-4 md:py-3 md:px-6">
                <div className={cn(
                    "grid gap-y-4 gap-x-2 md:gap-4 items-center",
                    canViewAll ? "grid-cols-2 md:grid-cols-11" : "grid-cols-2 md:grid-cols-6",
                    isFuture && "opacity-60"
                )}>
                    {/* Date & Client */}
                    <div className="flex items-center gap-3 col-span-2 md:col-span-2">
                        <div className={cn(
                            "h-10 w-10 rounded-xl transition-colors flex flex-col items-center justify-center shrink-0",
                            isLack ? "bg-red-50" : isWorked ? "bg-emerald-50" : isFeriado ? "bg-teal-50" : "bg-gray-50"
                        )}>
                            <span className={cn(
                                "text-[10px] uppercase font-bold leading-none mb-0.5",
                                isLack ? "text-red-400" : isWorked ? "text-emerald-400" : isFeriado ? "text-teal-500" : "text-gray-400"
                            )}>
                                {day.dia_semana_curto}
                            </span>
                            <span className={cn(
                                "text-sm font-black",
                                isLack ? "text-red-600" : isWorked ? "text-emerald-600" : isFeriado ? "text-teal-600" : "text-gray-700"
                            )}>
                                {String(day.dia).padStart(2, '0')}
                            </span>
                            {day.observacao && (
                                <div className="absolute top-2.5 right-2.5 bg-amber-500 text-white p-0.5 rounded-full ring-2 ring-white">
                                    <MessageSquare className="w-2.5 h-2.5 fill-current" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-gray-900 line-clamp-1 leading-tight text-sm">
                                {day.cliente_nome || (isNotVigente ? messages.ponto.labels.foraVigencia : messages.ponto.labels.semEscala)}
                            </h4>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">
                                {day.unidade_nome || labelStatus}
                            </p>
                        </div>

                        {/* Botão de Excluir */}
                        {onDelete && day.ponto_id && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(day.ponto_id as number);
                                }}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                title="Excluir marcação"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Badge Status */}
                    <div className="hidden md:block md:col-span-2">
                        <Badge variant="secondary" className={cn(
                            "text-[10px] uppercase font-bold px-2 py-0 border-none h-5 whitespace-nowrap",
                            isLack ? "bg-red-100 text-red-600" :
                                isWorked ? "bg-emerald-100 text-emerald-600" :
                                    isFeriado ? "bg-teal-100 text-teal-600 uppercase font-black" :
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
                                <p className={cn("text-sm font-bold", day.km_rodado > 0 ? "text-gray-700" : "text-gray-300")}>
                                    {day.km_rodado > 0 ? `${day.km_rodado}km` : '---'}
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
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{messages.ponto.labels.esperado}</p>
                                <p className="text-xs font-bold text-gray-300">
                                    {formatMinutes(day.minutos_esperados)}
                                </p>
                            </div>

                            {/* Saldo Diário */}
                            <div className="text-right col-span-1 md:col-span-2">
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
