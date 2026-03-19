import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatMinutes } from "@/utils/ponto";
import { StatusVisualPonto } from "@/types/enums";
import { RelatorioPonto } from "@/types/database";

interface TimeMirrorDailyCardProps {
    day: RelatorioPonto;
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
    const balance = day.saldo_minutos || 0;
    const esperadoForDay = (day.tempo_trabalhado_minutos || 0) - (day.saldo_minutos || 0);
    const dateObj = new Date(day.data_referencia + 'T12:00:00');

    return (
        <Card
            className={cn(
                "border border-gray-100 shadow-sm rounded-[1.5rem] overflow-hidden group transition-all duration-300 relative",
                day.entrada_hora ? "hover:shadow-md cursor-pointer active:scale-[0.99]" : "cursor-default opacity-80",
                isFetchingRecord && selectedPontoId === day.id && "opacity-60 cursor-wait"
            )}
            onClick={() => day.entrada_hora && !isFetchingRecord && onClick(Number(day.id))}
        >
            {/* Sidebar de Status - Estética Premium */}
            {day.entrada_hora && (
                <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1.5",
                    balance > 0 ? "bg-emerald-500" : balance < 0 ? "bg-red-500" : "bg-gray-300"
                )} />
            )}

            <CardContent className="p-4 md:py-3 md:px-6">
                <div className={cn(
                    "grid items-center gap-4",
                    canViewAll ? "grid-cols-1 md:grid-cols-8" : "grid-cols-1 md:grid-cols-4"
                )}>
                    {/* Date */}
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gray-50 group-hover:bg-primary/5 transition-colors flex flex-col items-center justify-center shrink-0">
                            <span className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-primary transition-colors leading-none mb-0.5">
                                {format(dateObj, 'EEE', { locale: ptBR })}
                            </span>
                            <span className="text-sm font-black text-gray-700 group-hover:text-primary transition-colors">
                                {format(dateObj, 'dd')}
                            </span>
                        </div>
                        <div className="md:hidden">
                            <h4 className="font-bold text-gray-900 line-clamp-1">
                                {format(dateObj, "dd 'de' MMMM", { locale: ptBR })}
                            </h4>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-0.5">{day.cliente_nome || 'Sem Cliente'}</p>
                        </div>
                    </div>

                    {/* Turno */}
                    <div>
                        <p className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Turno</p>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-500 text-[10px] uppercase font-bold px-2 py-0 border-none h-5">
                            {day.turno_hora_inicio 
                                ? `${day.turno_hora_inicio.substring(0, 5)} - ${day.turno_hora_fim.substring(0, 5)}` 
                                : (day.detalhes_calculo?.entrada?.turno_base 
                                    ? `${day.detalhes_calculo.entrada.turno_base.substring(0, 5)} - ${(day.detalhes_calculo.saida?.turno_base || '00:00:00').substring(0, 5)}`
                                    : 'Sem Turno')}
                        </Badge>
                    </div>

                    {/* Entrada / Saída */}
                    <div className="grid grid-cols-2 md:contents gap-2">
                        <div>
                            <p className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Entrada</p>
                            <p className="text-sm font-bold text-gray-700">
                                {day.entrada_hora ? format(new Date(day.entrada_hora), 'HH:mm') : (day.status_entrada !== StatusVisualPonto.CINZA ? '--:--' : '')}
                            </p>
                        </div>
                        <div>
                            <p className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Saída</p>
                            <p className="text-sm font-bold text-gray-700">
                                {day.saida_hora ? format(new Date(day.saida_hora), 'HH:mm') : (day.status_saida !== StatusVisualPonto.CINZA ? '--:--' : '')}
                            </p>
                        </div>
                    </div>

                    {/* Detalhes Admin */}
                    {canViewAll && (
                        <>
                            {/* Intervalo */}
                            <div className="text-center flex flex-col items-center gap-0.5">
                                <p className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Intervalo</p>
                                <p className="text-sm font-bold text-gray-700 leading-none">
                                    {day.total_pausas_minutos ? `${Math.round(day.total_pausas_minutos)}m` : '0m'}
                                </p>
                                {day.detalhes_calculo?.resumo?.pausa_configurada > 0 && (
                                    <span className="text-[9px] text-gray-400 font-medium leading-none">
                                        Lim: {day.detalhes_calculo.resumo.pausa_configurada}m
                                    </span>
                                )}
                            </div>

                            {/* Trabalhado */}
                            <div className="text-center">
                                <p className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Trabalhado</p>
                                <p className="text-sm font-black text-gray-900">
                                    {formatMinutes(day.tempo_trabalhado_minutos || 0)}
                                </p>
                            </div>

                            {/* Esperado */}
                            <div className="text-center">
                                <p className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Esperado</p>
                                <p className="text-xs font-bold text-gray-300">
                                    {formatMinutes(esperadoForDay || 0)}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Saldo</p>
                                {day.entrada_hora && day.saida_hora && (
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "rounded-full px-3 py-1 font-black text-[10px] tracking-tight",
                                            balance > 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                balance < 0 ? "bg-red-50 text-red-600 border-red-100" :
                                                    "bg-gray-50 text-gray-500 border-gray-100"
                                        )}
                                    >
                                        {formatMinutes(balance)}
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
