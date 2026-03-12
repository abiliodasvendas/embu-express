import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Info } from "lucide-react";
import { useMemo } from "react";

interface ToleranceTimelineProps {
    draftValues: Record<string, string>;
}

export function ToleranceTimeline({ draftValues }: ToleranceTimelineProps) {
    const verde = parseInt(draftValues.tolerancia_verde_min || "0", 10);
    const amarelo = parseInt(draftValues.tolerancia_amarelo_min || "0", 10);
    const flexSaida = parseInt(draftValues.tolerancia_saida_min || "0", 10);
    const heExcessiva = parseInt(draftValues.limite_he_excessiva_min || "0", 10);

    const renderEntrada = (isVertical: boolean) => {
        const totalMinutes = 90; // 08:30 to 10:00
        const baseOffset = 30; // 09:00 is 30 mins from 08:30

        const getPerc = (min: number) => Math.min(Math.max((min / totalMinutes) * 100, 0), 100);

        const earlyEnd = baseOffset;
        const greenEnd = baseOffset + verde;
        const yellowEnd = baseOffset + Math.max(verde, amarelo);

        const dim = (val: number) => isVertical ? { height: `${val}%` } : { width: `${val}%` };
        const minDim = (val: string) => isVertical ? { minHeight: val } : { minWidth: val };

        return (
            <div className={`flex ${isVertical ? 'flex-row' : 'flex-col space-y-2'}`}>
                {/* Headers */}
                <div className={`font-medium text-slate-500 ${isVertical ? 'flex flex-col justify-between items-end mr-4 text-xs py-2 h-72' : 'flex justify-between text-sm mb-1'}`}>
                    <span>08:30</span>
                    <span className="text-slate-900 font-bold">09:00 (Entrada)</span>
                    <span>10:00+</span>
                </div>
                
                {/* Bar */}
                <div className={`relative rounded-xl overflow-hidden bg-slate-100 flex shadow-inner ${isVertical ? 'w-16 h-72 flex-col' : 'h-10 w-full flex-row'}`}>
                    <div 
                        className={`bg-slate-200/80 border-slate-300 flex items-center justify-center text-xs font-medium text-slate-600 px-1 transition-all duration-300 ${isVertical ? 'border-b text-center' : 'border-r truncate'}`}
                        style={{ ...dim(getPerc(earlyEnd)) }}
                        title="Chegada Antecipada"
                    >
                        {getPerc(earlyEnd) > 15 && 'Adiantado'}
                    </div>

                    <div 
                        className={`bg-emerald-400 border-emerald-500 flex items-center justify-center text-xs font-bold text-emerald-900 px-1 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] transition-all duration-300 ${isVertical ? 'border-b w-full text-center' : 'border-r w-0 truncate'}`}
                        style={{ ...dim(getPerc(greenEnd - earlyEnd)), ...(verde > 0 ? minDim('1.5rem') : dim(0)) }}
                        title={`No Prazo (${verde}m)`}
                    >
                        {getPerc(greenEnd - earlyEnd) > 5 && 'Verde'}
                    </div>

                    <div 
                        className={`bg-amber-400 border-amber-500 flex items-center justify-center text-xs font-bold text-amber-900 px-1 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] transition-all duration-300 ${isVertical ? 'border-b w-full text-center' : 'border-r w-0 truncate'}`}
                        style={{ ...dim(getPerc(yellowEnd - greenEnd)), ...(amarelo > verde ? minDim('1.5rem') : dim(0)) }}
                        title={`Atenção (${amarelo}m)`}
                    >
                        {getPerc(yellowEnd - greenEnd) > 5 && 'Amarelo'}
                    </div>

                    <div 
                        className={`bg-rose-500 flex-1 flex items-center justify-center text-xs font-bold text-white px-1 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)] transition-all duration-300 ${isVertical ? 'text-center' : 'truncate'}`}
                        title="Atraso Crítico"
                    >
                        Atraso Crítico
                    </div>
                </div>

                {/* Footers for vertical are on the right as a legend */}
                {isVertical ? (
                    <div className="flex flex-col justify-center ml-4 gap-4 text-xs text-slate-600 font-medium">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm border border-emerald-500 shrink-0"></div>
                            <span>Até 09:{verde.toString().padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm border border-amber-500 shrink-0"></div>
                            <span>Até 09:{amarelo.toString().padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm border border-rose-600 shrink-0"></div>
                            <span>Após 09:{amarelo.toString().padStart(2, '0')}</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex text-[11px] text-slate-500 justify-between px-1 mt-1">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                            <span>Até 09:{verde.toString().padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                            <span>Até 09:{amarelo.toString().padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                            <span>Após 09:{amarelo.toString().padStart(2, '0')}</span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderSaida = (isVertical: boolean) => {
        const totalMinutes = Math.max(210, 60 + heExcessiva + 30); 
        const baseOffset = 60; // 18:00 is 60 mins from 17:00

        const getPerc = (min: number) => Math.min(Math.max((min / totalMinutes) * 100, 0), 100);

        const flexEarlyStart = Math.max(0, baseOffset - flexSaida);
        const flexLateEnd = baseOffset + flexSaida;
        const extraHoursEnd = baseOffset + heExcessiva;

        const dim = (val: number) => isVertical ? { height: `${val}%` } : { width: `${val}%` };
        const minDim = (val: string) => isVertical ? { minHeight: val } : { minWidth: val };

        return (
            <div className={`flex ${isVertical ? 'flex-row' : 'flex-col space-y-2'}`}>
                {/* Headers */}
                <div className={`font-medium text-slate-500 ${isVertical ? 'flex flex-col justify-between items-end mr-4 text-xs py-2 h-72' : 'flex justify-between text-sm mb-1'}`}>
                    <span>17:00</span>
                    <span className={`text-slate-900 font-bold ${isVertical ? '' : 'ml-12'}`}>18:00 (Saída)</span>
                    <span>20:30+</span>
                </div>
                
                {/* Bar */}
                <div className={`relative rounded-xl overflow-hidden bg-slate-100 flex shadow-inner ${isVertical ? 'w-16 h-72 flex-col' : 'h-10 w-full flex-row'}`}>
                    <div 
                        className={`bg-rose-400 border-rose-500 flex items-center justify-center text-xs font-bold text-white px-1 transition-all duration-300 ${isVertical ? 'border-b text-center' : 'border-r truncate'}`}
                        style={{ ...dim(getPerc(flexEarlyStart)) }}
                        title="Saída Antecipada (Ocorrência)"
                    >
                        {getPerc(flexEarlyStart) > 15 && 'Antecipada'}
                    </div>

                    <div 
                        className={`bg-emerald-400 border-emerald-500 flex items-center justify-center text-xs font-bold text-emerald-900 px-1 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] transition-all duration-300 ${isVertical ? 'border-b w-full text-center' : 'border-r w-0 truncate'}`}
                        style={{ ...dim(getPerc(flexLateEnd - flexEarlyStart)), ...(flexSaida > 0 ? minDim('2rem') : dim(0)) }}
                        title={`Flexibilidade (±${flexSaida}m)`}
                    >
                        {getPerc(flexLateEnd - flexEarlyStart) > 10 && 'No Horário'}
                    </div>

                    <div 
                        className={`bg-blue-400 border-blue-500 flex items-center justify-center text-xs font-bold text-white px-1 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] transition-all duration-300 ${isVertical ? 'border-b w-full text-center' : 'border-r w-0 truncate'}`}
                        style={{ ...dim(getPerc(Math.max(0, extraHoursEnd - flexLateEnd))), ...(heExcessiva > flexSaida ? minDim('2rem') : dim(0)) }}
                        title={`Hora Extra Regular (Até ${heExcessiva}m)`}
                    >
                        {getPerc(extraHoursEnd - flexLateEnd) > 10 && 'Hora Extra'}
                    </div>

                    <div 
                        className={`bg-amber-500 flex-1 flex items-center justify-center text-xs font-bold text-white px-1 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)] transition-all duration-300 ${isVertical ? 'text-center' : 'truncate'}`}
                        title="HE Excessiva / Alerta de Fadiga"
                    >
                        HE Excessiva
                    </div>
                </div>
                
                {/* Footers */}
                {isVertical ? (
                    <div className="flex flex-col justify-center ml-4 gap-4 text-xs text-slate-600 font-medium">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm border border-emerald-500 shrink-0"></div>
                            <span>Flex: ±{flexSaida}m</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-400 shadow-sm border border-blue-500 shrink-0"></div>
                            <span>HE Normal</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm border border-amber-600 shrink-0"></div>
                            <span>Excesso: &gt; {heExcessiva}m</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex text-[11px] text-slate-500 justify-between px-1 mt-1">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                            <span>Flex: ±{flexSaida}m</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            <span>HE Normal</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                            <span>Excesso: &gt; {heExcessiva}m</span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card className="rounded-3xl border-slate-200 shadow-sm bg-gradient-to-br from-white to-slate-50 overflow-hidden col-span-1 md:col-span-2 mb-6">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                        <Clock className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-800">Visualização de Tolerâncias</CardTitle>
                </div>
                <CardDescription className="text-slate-600 font-medium">
                    Simulação dinâmica baseada nos valores que você configurou. Use um horário de entrada às <strong className="text-slate-800">09:00</strong> e saída às <strong className="text-slate-800">18:00</strong> como exemplo prático.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Entrada */}
                <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 mb-2 md:hidden">Entrada</h3>
                    <div className="hidden md:block">{renderEntrada(false)}</div>
                    <div className="md:hidden flex justify-center">{renderEntrada(true)}</div>
                </div>

                {/* Saída */}
                <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 mb-2 md:hidden">Saída</h3>
                    <div className="hidden md:block">{renderSaida(false)}</div>
                    <div className="md:hidden flex justify-center">{renderSaida(true)}</div>
                </div>

                <div className="flex items-start gap-2 text-sm text-slate-500 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                    <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <p>
                        As barras acima são <strong>interativas</strong>. Ao alterar os valores nos campos abaixo, as faixas de cores se ajustarão em tempo real para refletir sua configuração antes mesmo de salvar.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
