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
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown, ChevronUp, Info } from "lucide-react";
import { useEffect, useState } from "react";

interface TimeMirrorViewProps {
    usuarioId?: string;
    selectedMonth?: number;
    selectedYear?: number;
    selectedShift?: string;
    hideCollaboratorSelect?: boolean;
    isActionable?: boolean;
}

export function TimeMirrorView({
    usuarioId,
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
                        Presença
                    </span>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-slate-700 tracking-tight">
                            {kpis.dias_trabalhados} <span className="text-xs text-slate-400 uppercase">dias</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium mt-1">
                            Meta: {kpis.dias_meta_turno} dias
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
                        canViewAll ? "grid-cols-10" : "grid-cols-5"
                    )}>
                        <div className="col-span-2">{messages.ponto.labels.data} / CLIENTE</div>
                        <div className="col-span-1">{messages.ponto.labels.status}</div>
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
                    <div className="mt-6 space-y-4">
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
    );
}
