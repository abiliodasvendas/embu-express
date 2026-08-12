import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ListSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getMessage, messages } from "@/constants/messages";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { useLayout } from "@/contexts/LayoutContext";
import { useDeletePonto } from "@/hooks/api/usePontoMutations";
import { useTimeMirror } from "@/hooks/api/useTimeMirror";
import { useTimeRecord } from "@/hooks/api/useTimeRecord";
import { usePermissions } from "@/hooks/business/usePermissions";
import { cn } from "@/lib/utils";
import { RegistroPonto } from "@/types/database";
import { FilterOptions } from "@/types/enums";
import { PontoDiarioRelatorio } from "@/types/ponto-relatorio";
import { formatMinutes } from "@/utils/ponto";
import { TimeMirrorDailyCard } from "./TimeMirrorDailyCard";
import { safeCloseDialog } from "@/hooks";
import { CALENDARIO_STATUS } from "@/constants/financeiro.constants";
import { PrintReportHeader } from "@/components/common/PrintReportHeader";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown, ChevronUp, Info } from "lucide-react";
import { useEffect, useState } from "react";

interface TimeMirrorViewProps {
    usuarioId?: string;
    colaboradorNome?: string;
    cpf?: string;
    cargo?: string;
    selectedMonth?: number;
    selectedYear?: number;
    selectedShift?: string;
    hideCollaboratorSelect?: boolean;
    isActionable?: boolean;
}

export function TimeMirrorView({
    usuarioId,
    colaboradorNome,
    cpf,
    cargo,
    selectedMonth,
    selectedYear,
    selectedShift = FilterOptions.TODOS,
    isActionable = false
}: TimeMirrorViewProps) {
    const { can } = usePermissions();
    const canViewAll = can(PERMISSIONS.PONTO.ADMIN_VER);
    const month = selectedMonth || new Date().getMonth() + 1;
    const year = selectedYear || new Date().getFullYear();

    const { data: reportData = [], isLoading } = useTimeMirror(
        usuarioId || undefined,
        month,
        year
    );

    // Filtrar pelo turno selecionado (se não for "TODOS")
    const activeReport = selectedShift === FilterOptions.TODOS
        ? reportData[0] // Por padrão pegamos o primeiro se for todos
        : reportData.find(r => r.shift_id === Number(selectedShift)) || reportData[0];

    const { openTimeRecordDetailsDialog, openTimeRecordDialog, openConfirmationDialog, closeConfirmationDialog } = useLayout();
    const { mutateAsync: deletePonto } = useDeletePonto();
    const [selectedPontoId, setSelectedPontoId] = useState<number | null>(null);
    const { data: fullRecord, isFetching: isFetchingRecord } = useTimeRecord(selectedPontoId);
    const [showFutureScale, setShowFutureScale] = useState(false);

    const todayStr = new Date().toLocaleDateString('en-CA');
    const isCurrentPeriod = month === new Date().getMonth() + 1 && year === new Date().getFullYear();

    // Separar o calendário em "Atividades Realizadas" e "Escala Futura" de forma segura
    const calendario = activeReport?.calendario || [];
    const realizedDays = calendario.filter(day => {
        return day.data <= todayStr || day.ponto_id || day.status !== CALENDARIO_STATUS.FUTURO;
    });

    const futureDays = calendario.filter(day => {
        return day.data > todayStr && day.status === CALENDARIO_STATUS.FUTURO && !day.ponto_id;
    });

    // Auto-expandir a escala se não houver atividades realizadas
    useEffect(() => {
        if (!isLoading && realizedDays.length === 0 && futureDays.length > 0) {
            setShowFutureScale(true);
        }
    }, [realizedDays.length, futureDays.length, isLoading]);

    useEffect(() => {
        if (fullRecord && selectedPontoId) {
            openTimeRecordDetailsDialog({
                record: fullRecord,
                onEdit: isActionable && can(PERMISSIONS.PONTO.ADMIN_EDITAR) ? handleEditFromDetails : undefined,
                onDelete: isActionable && can(PERMISSIONS.PONTO.ADMIN_EDITAR) ? handleDelete : undefined
            });
            setSelectedPontoId(null);
        }
    }, [fullRecord, selectedPontoId, isActionable, can]);

    const handleDelete = (record: RegistroPonto) => {
        handleDeleteById(Number(record.id));
    };

    const handleDeleteById = (id: number) => {
        openConfirmationDialog({
            title: "Excluir Registro",
            description: "Tem certeza que deseja excluir permanentemente este registro de atividade? Esta ação não pode ser desfeita.",
            confirmText: "Sim, excluir",
            variant: "destructive",
            onConfirm: async () => {
                await deletePonto(id);
                safeCloseDialog(closeConfirmationDialog);
            }
        });
    };

    const handleEditFromDetails = (record: RegistroPonto) => {
        openTimeRecordDialog({ record });
    };

    const handleOpenRecord = (day: PontoDiarioRelatorio) => {
        if (day.ponto_id) {
            setSelectedPontoId(day.ponto_id);
        } else if (isActionable && usuarioId && can(PERMISSIONS.PONTO.ADMIN_CRIAR)) {
            openTimeRecordDialog({
                record: {
                    id: `ausente-${day.data}` as any,
                    usuario_id: usuarioId,
                    data_referencia: day.data,
                    colaborador_cliente_id: activeReport?.shift_id,
                    colaborador_cliente: {
                        id: activeReport?.shift_id,
                        unidade: { nome_unidade: day.unidade_nome },
                        cliente: { nome_fantasia: day.cliente_nome }
                    },
                    detalhes_calculo: {
                        entrada: { turno_base: day.shift_entrada },
                        saida: { turno_base: day.shift_saida }
                    }
                } as any
            });
        }
    };

    useEffect(() => {
        if (fullRecord && selectedPontoId) {
            openTimeRecordDetailsDialog({
                record: fullRecord,
                onEdit: isActionable && can(PERMISSIONS.PONTO.ADMIN_EDITAR) ? handleEditFromDetails : undefined,
                onDelete: isActionable && can(PERMISSIONS.PONTO.ADMIN_EDITAR) ? handleDelete : undefined
            });
            setSelectedPontoId(null);
        }
    }, [fullRecord, selectedPontoId, isActionable, can]);

    if (!usuarioId) {
        return (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 bg-primary/5 rounded-full">
                    <Calendar className="h-8 w-8 text-primary/40" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">{getMessage("ponto.labels.nenhumColaborador")}</h3>
                    <p className="text-sm text-gray-500 max-w-[280px]">{getMessage("ponto.labels.escolhaColaborador")}</p>
                </div>
            </div>
        );
    }

    if (isLoading) return <ListSkeleton />;

    if (!activeReport) {
        return (
            <UnifiedEmptyState
                icon={Calendar}
                title={getMessage("ponto.labels.semRegistros")}
                description={getMessage("ponto.labels.semRegistrosDesc")}
            />
        );
    }

    const { kpis } = activeReport;
    const hourBalance = kpis.horas_trabalhadas - kpis.horas_esperadas;


    return (
        <div className="flex flex-col gap-10 md:gap-14">
            <PrintReportHeader
                titulo="Relatório de Atividade"
                colaboradorNome={colaboradorNome}
                cpf={cpf}
                cargo={cargo}
                mes={month}
                ano={year}
            />

            {/* Visão de Impressão Exclusiva (1 Folha A4 Consolidada) */}
            <div className="hidden print:block space-y-4">
                {/* KPIs Compactos de Impressão */}
                <div className="grid grid-cols-4 gap-2 border border-gray-200 rounded-xl p-3 bg-gray-50/50">
                    <div>
                        <span className="text-[9px] font-bold text-gray-500 uppercase block">{messages.ponto.labels.saldoAtual}</span>
                        <span className={cn("text-sm font-black", hourBalance >= 0 ? "text-emerald-700" : "text-red-600")}>
                            {formatMinutes(hourBalance, true)}
                        </span>
                        <span className="text-[8px] text-gray-500 block">{formatMinutes(kpis.horas_trabalhadas)} / {formatMinutes(kpis.horas_esperadas)}</span>
                    </div>
                    <div>
                        <span className="text-[9px] font-bold text-gray-500 uppercase block">Com Atividade</span>
                        <span className="text-sm font-black text-gray-800">{kpis.dias_trabalhados} dias</span>
                        <span className="text-[8px] text-gray-500 block">Esperado: {kpis.dias_meta_turno} dias</span>
                    </div>
                    <div>
                        <span className="text-[9px] font-bold text-gray-500 uppercase block">{messages.ponto.labels.ausencias}</span>
                        <span className={cn("text-sm font-black", kpis.dias_ausencias === 0 ? "text-gray-800" : "text-red-600")}>
                            {kpis.dias_ausencias}
                        </span>
                        <span className="text-[8px] text-gray-500 block">{formatMinutes(kpis.horas_ausencias)} não realizadas</span>
                    </div>
                    <div>
                        <span className="text-[9px] font-bold text-gray-500 uppercase block">{messages.ponto.labels.rodagemKm}</span>
                        <span className="text-sm font-black text-gray-800">{kpis.km_realizado} km</span>
                        <span className="text-[8px] text-gray-500 block">Saldo: {kpis.km_saldo <= 0 ? `+${Math.abs(kpis.km_saldo)}` : `-${kpis.km_saldo}`} km</span>
                    </div>
                </div>

                {/* Tabela de Dias do Mês */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-[10px]">
                        <thead>
                            <tr className="border-b border-gray-200 text-gray-500 font-bold uppercase text-[8px] bg-gray-100/80">
                                <th className="py-1.5 px-2">Dia</th>
                                <th className="py-1.5 px-2">Cliente / Unidade</th>
                                <th className="py-1.5 px-2">Status</th>
                                <th className="py-1.5 px-2 text-center">Entrada</th>
                                <th className="py-1.5 px-2 text-center">Saída</th>
                                <th className="py-1.5 px-2 text-center">Efetivo</th>
                                <th className="py-1.5 px-2 text-center">Esperado</th>
                                <th className="py-1.5 px-2 text-right">Saldo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium">
                            {realizedDays.map((day: PontoDiarioRelatorio, idx) => {
                                const isLack = day.status === CALENDARIO_STATUS.SEM_ATIVIDADE;
                                const isWorked = day.status === CALENDARIO_STATUS.TRABALHADO;
                                const isFeriado = day.status === CALENDARIO_STATUS.FERIADO;
                                const isNotVigente = day.status === CALENDARIO_STATUS.NAO_VIGENTE;
                                return (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="py-1 px-2 font-bold whitespace-nowrap">
                                            {day.dia_semana_curto} {String(day.dia).padStart(2, '0')}
                                        </td>
                                        <td className="py-1 px-2 text-gray-800 truncate max-w-[140px]">
                                            {day.cliente_nome || '-'} {day.unidade_nome ? `(${day.unidade_nome})` : ''}
                                        </td>
                                        <td className="py-1 px-2 whitespace-nowrap">
                                            <span className={cn(
                                                "px-1.5 py-0.5 rounded font-bold text-[7px] uppercase tracking-wider",
                                                isWorked ? "bg-emerald-100 text-emerald-700" :
                                                isLack ? "bg-red-100 text-red-700" :
                                                isFeriado ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-600"
                                            )}>
                                                {isWorked ? messages.ponto.labels.ok : isLack ? messages.ponto.labels.ausencia.toUpperCase() : isFeriado ? "FERIADO" : isNotVigente ? messages.ponto.labels.off : day.status}
                                            </span>
                                        </td>
                                        <td className="py-1 px-2 text-center whitespace-nowrap">
                                            {day.entrada_hora ? day.entrada_hora.substring(11, 16) : '--:--'}
                                        </td>
                                        <td className="py-1 px-2 text-center whitespace-nowrap">
                                            {day.saida_hora ? day.saida_hora.substring(11, 16) : '--:--'}
                                        </td>
                                        <td className="py-1 px-2 text-center font-bold whitespace-nowrap">
                                            {formatMinutes(day.minutos_trabalhados)}
                                        </td>
                                        <td className="py-1 px-2 text-center text-gray-500 whitespace-nowrap">
                                            {formatMinutes(day.minutos_esperados)}
                                        </td>
                                        <td className={cn(
                                            "py-1 px-2 text-right font-bold whitespace-nowrap",
                                            day.minutos_saldo > 0 ? "text-emerald-700" : day.minutos_saldo < 0 ? "text-red-600" : "text-gray-600"
                                        )}>
                                            {formatMinutes(day.minutos_saldo, true)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Visão de Tela (Interativa) */}
            <div className="print:hidden flex flex-col gap-10 md:gap-14">
                {/* KPI Section - Soft & Slim */}
                <div className="order-2 md:order-1 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {/* 1. Saldo de Horas */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between transition-all hover:border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {messages.ponto.labels.saldoAtual}
                            </span>
                            {isCurrentPeriod && (
                                <Badge variant="outline" className="text-[9px] font-medium text-slate-400 border-slate-100 h-5 px-1.5 leading-none">
                                    PROPORCIONAL
                                </Badge>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className={cn("text-2xl font-bold tracking-tight", hourBalance >= 0 ? "text-emerald-600" : "text-rose-600")}>
                                {formatMinutes(hourBalance, true)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium mt-1">
                                {formatMinutes(kpis.horas_trabalhadas)} realizados / {formatMinutes(kpis.horas_esperadas)} esperados
                            </span>
                        </div>
                    </div>

                    {/* 2. Dias Trabalhados */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between transition-all hover:border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Com Atividade
                        </span>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-slate-700 tracking-tight">
                                {kpis.dias_trabalhados} <span className="text-xs text-slate-400 uppercase">dias</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium mt-1">
                                Esperado: {kpis.dias_meta_turno} dias
                            </span>
                        </div>
                    </div>

                    {/* 3. Ausências */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between transition-all hover:border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                            {messages.ponto.labels.ausencias}
                        </span>
                        <div className="flex flex-col">
                            <span className={cn("text-2xl font-bold tracking-tight", kpis.dias_ausencias === 0 ? "text-slate-700" : "text-rose-600")}>
                                {kpis.dias_ausencias}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium mt-1">
                                {formatMinutes(kpis.horas_ausencias)} perdidas
                            </span>
                        </div>
                    </div>

                    {/* 4. KM Rodado */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between transition-all hover:border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                            {messages.ponto.labels.rodagemKm}
                        </span>
                        <div className="flex flex-col">
                            <span className={cn("text-2xl font-bold tracking-tight", kpis.km_saldo <= 0 ? "text-emerald-600" : "text-rose-600")}>
                                {kpis.km_realizado} <span className="text-xs font-normal opacity-70">km</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium mt-1">
                                Saldo: {kpis.km_saldo <= 0 ? `+${Math.abs(kpis.km_saldo)}` : `-${kpis.km_saldo}`} km
                            </span>
                        </div>
                    </div>
                </div>

                {/* Daily Logs */}
                <div className="order-1 md:order-2 grid gap-3">
                    {/* Header da Listagem Desktop - Só aparece se houver atividades realizadas */}
                    {realizedDays.length > 0 && (
                        <div className={cn(
                            "hidden md:grid px-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] pb-2",
                            canViewAll ? "grid-cols-11" : "grid-cols-6"
                        )}>
                            <div className="col-span-2">{messages.ponto.labels.data} / CLIENTE</div>
                            <div className="col-span-2">{messages.ponto.labels.status}</div>
                            <div className="col-span-1">{messages.ponto.labels.entrada}</div>
                            <div className="col-span-1">{messages.ponto.labels.saida}</div>
                            {canViewAll && (
                                <>
                                    <div className="col-span-1 text-center">{messages.ponto.labels.kmTotal}</div>
                                    <div className="col-span-1 text-center">{messages.ponto.labels.efetivo}</div>
                                    <div className="col-span-1 text-center">{messages.ponto.labels.esperado}</div>
                                    <div className="col-span-2 text-right">{messages.ponto.labels.saldoDia}</div>
                                </>
                            )}
                        </div>
                    )}

                    {realizedDays.length > 0 ? (
                        realizedDays.map((day: PontoDiarioRelatorio, idx) => (
                            <TimeMirrorDailyCard
                                key={idx}
                                day={day}
                                canViewAll={canViewAll}
                                isFetchingRecord={isFetchingRecord}
                                selectedPontoId={selectedPontoId}
                                onClick={handleOpenRecord}
                                onDelete={isActionable && can(PERMISSIONS.PONTO.ADMIN_EDITAR) ? handleDeleteById : undefined}
                                isActionable={isActionable}
                            />
                        ))
                    ) : (
                        !isLoading && futureDays.length === 0 && (
                            <div className="py-12 bg-white/50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                                <Info className="h-8 w-8 text-slate-300 mb-2" />
                                <p className="text-sm text-slate-400">Nenhuma atividade registrada para este período.</p>
                            </div>
                        )
                    )}

                    {/* Escala Futura - Apartada */}
                    {futureDays.length > 0 && (
                        <div className="mt-6 space-y-4 print:hidden">
                            <div className="flex items-center gap-4">
                                <div className="h-[1px] flex-1 bg-slate-100"></div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowFutureScale(!showFutureScale)}
                                    className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50"
                                >
                                    {showFutureScale ? <ChevronUp className="h-3 w-3 mr-2" /> : <ChevronDown className="h-3 w-3 mr-2" />}
                                    {showFutureScale ? "Ocultar Escala" : `Ver Escala Futura (${futureDays.length} dias)`}
                                </Button>
                                <div className="h-[1px] flex-1 bg-slate-100"></div>
                            </div>

                            {showFutureScale && (
                                <div className="grid gap-3 transition-all animate-in fade-in slide-in-from-top-2">
                                    {futureDays.map((day: PontoDiarioRelatorio, idx) => (
                                        <TimeMirrorDailyCard
                                            key={`future-${idx}`}
                                            day={day}
                                            canViewAll={canViewAll}
                                            isFetchingRecord={isFetchingRecord}
                                            selectedPontoId={selectedPontoId}
                                            onClick={handleOpenRecord}
                                            onDelete={isActionable && can(PERMISSIONS.PONTO.ADMIN_EDITAR) ? handleDeleteById : undefined}
                                            isActionable={isActionable}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
