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
import { Calendar, Clock, Gauge, MapPin, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { TimeMirrorDailyCard } from "./TimeMirrorDailyCard";

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

    const handleDelete = (record: RegistroPonto) => {
        handleDeleteById(Number(record.id));
    };

    const handleDeleteById = (id: number) => {
        openConfirmationDialog({
            title: "Excluir Registro",
            description: "Tem certeza que deseja excluir permanentemente este registro de ponto? Esta ação não pode ser desfeita.",
            confirmText: "Sim, excluir",
            variant: "destructive",
            onConfirm: async () => {
                await deletePonto(id);
                closeConfirmationDialog();
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
                onEdit: handleEditFromDetails,
                onDelete: handleDelete
            });
            setSelectedPontoId(null);
        }
    }, [fullRecord, selectedPontoId]);

    const { can } = usePermissions();
    const canViewAll = can(PERMISSIONS.PONTO.ADMIN_VER);

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

    const { kpis, calendario } = activeReport;
    const hourBalance = kpis.horas_trabalhadas - kpis.horas_esperadas;

    return (
        <div className="space-y-6">
            {/* KPI Section - Premium & Consolidated */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Jornada de Trabalho (Meta vs Realizado) */}
                <Card className="border shadow-sm rounded-3xl bg-slate-50/40 border-slate-200/60 overflow-hidden group hover:shadow-md transition-all duration-300">
                    <CardContent className="p-0">
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-white rounded-2xl group-hover:bg-blue-600 transition-colors duration-300 shadow-sm">
                                    <Clock className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <Badge variant="secondary" className="bg-white text-slate-600 border border-slate-200 text-[10px] font-bold uppercase py-0.5 px-2">
                                    {messages.ponto.labels.jornadaMensal}
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black text-slate-800 tracking-tight">{formatMinutes(kpis.horas_trabalhadas)}</h3>
                                <p className="text-xs text-slate-400 font-medium tracking-wide">
                                    Realizado de <span className="text-slate-600 font-bold">{formatMinutes(kpis.horas_esperadas)}</span> planejadas
                                </p>
                            </div>
                        </div>
                        <div className="px-5 py-4 flex items-center justify-between border-t border-slate-200/40 bg-white/50">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{messages.ponto.labels.saldoAtual}</p>
                                <p className={cn("text-lg font-black leading-none", hourBalance >= 0 ? "text-emerald-600" : "text-rose-600")}>
                                    {formatMinutes(hourBalance, true)}
                                </p>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{messages.ponto.labels.diasAtuados}</p>
                                <p className="text-lg font-black text-slate-700 leading-none">{kpis.dias_trabalhados} / {kpis.dias_meta_turno}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Assiduidade (Faltas) */}
                <Card className="border shadow-sm rounded-3xl bg-slate-50/40 border-slate-200/60 overflow-hidden group hover:shadow-md transition-all duration-300">
                    <CardContent className="p-0">
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn("p-3 bg-white rounded-2xl transition-colors duration-300 shadow-sm", kpis.dias_faltas === 0 ? "group-hover:bg-emerald-600" : "group-hover:bg-rose-600")}>
                                    <TrendingDown className={cn("h-5 w-5 transition-colors duration-300", kpis.dias_faltas === 0 ? "text-emerald-600 group-hover:text-white" : "text-rose-600 group-hover:text-white")} />
                                </div>
                                <Badge variant="secondary" className={cn("bg-white border text-[10px] font-bold uppercase py-0.5 px-2", kpis.dias_faltas === 0 ? "text-emerald-600 border-emerald-100" : "text-rose-600 border-rose-100")}>
                                    {messages.ponto.labels.faltas}
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <h3 className={cn("text-3xl font-black tracking-tight", kpis.dias_faltas === 0 ? "text-emerald-600" : "text-rose-600")}>{kpis.dias_faltas}</h3>
                                <p className="text-xs text-slate-400 font-medium tracking-wide">Faltas detectadas no período</p>
                            </div>
                        </div>
                        <div className="px-5 py-4 flex items-center justify-between border-t border-slate-200/40 bg-white/50">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{messages.ponto.labels.totalEmHoras}</p>
                                <p className={cn("text-lg font-black leading-none", kpis.dias_faltas === 0 ? "text-emerald-600" : "text-rose-600")}>
                                    {formatMinutes(kpis.horas_faltas)}
                                </p>
                            </div>
                            <div className={cn("p-2 rounded-xl", kpis.dias_faltas === 0 ? "bg-emerald-50" : "bg-rose-50")}>
                                <Calendar className={cn("h-4 w-4", kpis.dias_faltas === 0 ? "text-emerald-600" : "text-rose-600")} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Desempenho (KM) */}
                <Card className="border shadow-sm rounded-3xl bg-slate-50/40 border-slate-200/60 overflow-hidden group hover:shadow-md transition-all duration-300">
                    <CardContent className="p-0">
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-white rounded-2xl group-hover:bg-slate-800 transition-colors duration-300 shadow-sm">
                                    <Gauge className="h-5 w-5 text-slate-800 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <Badge variant="secondary" className="bg-white text-slate-600 border border-slate-200 text-[10px] font-bold uppercase py-0.5 px-2">
                                    {messages.ponto.labels.rodagemKm}
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black text-slate-800 tracking-tight">{kpis.km_realizado} <span className="text-sm font-normal text-slate-400">km</span></h3>
                                <p className="text-xs text-slate-400 font-medium tracking-wide uppercase tracking-widest">
                                    Contratado: <span className="text-slate-700 font-bold">{kpis.km_contratado} km</span>
                                </p>
                            </div>
                        </div>
                        <div className="px-5 py-4 flex items-center justify-between border-t border-slate-200/40 bg-white/50">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{messages.ponto.labels.saldoKm}</p>
                                <p className={cn("text-lg font-black leading-none", kpis.km_saldo <= 0 ? "text-emerald-600" : "text-rose-600")}>
                                    {kpis.km_saldo <= 0 ? `+${Math.abs(kpis.km_saldo)}` : `-${kpis.km_saldo}`} km
                                </p>
                            </div>
                            <div className="p-2 bg-slate-100 rounded-xl">
                                <MapPin className="h-4 w-4 text-slate-800" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Daily Logs */}
            <div className="grid gap-3">
                {/* Header da Listagem Desktop */}
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

                {calendario.map((day: PontoDiarioRelatorio, idx) => (
                    <TimeMirrorDailyCard
                        key={idx}
                        day={day}
                        canViewAll={canViewAll}
                        isFetchingRecord={isFetchingRecord}
                        selectedPontoId={selectedPontoId}
                        onClick={handleOpenRecord}
                        onDelete={can(PERMISSIONS.PONTO.ADMIN_EDITAR) ? handleDeleteById : undefined}
                        isActionable={isActionable}
                    />
                ))}
            </div>
        </div>
    );
}
