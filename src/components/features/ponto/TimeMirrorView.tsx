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
}

export function TimeMirrorView({
    usuarioId,
    selectedMonth,
    selectedYear,
    selectedShift = FilterOptions.TODOS,
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
        ? reportData[0] // Por padrão pegamos o primeiro se for todos, ou deveríamos somar? O usuário geralmente vê um por vez.
        : reportData.find(r => r.shift_id === Number(selectedShift)) || reportData[0];

    const { openTimeRecordDetailsDialog, openTimeRecordDialog, openConfirmationDialog, closeConfirmationDialog } = useLayout();
    const { mutateAsync: deletePonto } = useDeletePonto();
    const [selectedPontoId, setSelectedPontoId] = useState<number | null>(null);
    const { data: fullRecord, isFetching: isFetchingRecord } = useTimeRecord(selectedPontoId);

    const handleDelete = (record: RegistroPonto) => {
        openConfirmationDialog({
            title: "Excluir Registro",
            description: "Tem certeza que deseja excluir permanentemente este registro de ponto? Esta ação não pode ser desfeita.",
            confirmText: "Sim, excluir",
            variant: "destructive",
            onConfirm: async () => {
                await deletePonto(Number(record.id));
                closeConfirmationDialog();
            }
        });
    };

    const handleEditFromDetails = (record: RegistroPonto) => {
        openTimeRecordDialog({ record });
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
                <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden border border-gray-100">
                    <CardContent className="p-0">
                        <div className="bg-blue-600 p-4 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <Clock className="h-5 w-5 opacity-80" />
                                <Badge className="bg-blue-500/30 text-white border-blue-400/50 text-[10px] font-bold uppercase">{messages.ponto.labels.jornadaMensal}</Badge>
                            </div>
                            <h3 className="text-3xl font-black">{formatMinutes(kpis.horas_trabalhadas)}</h3>
                            <p className="text-xs text-blue-100 font-medium opacity-80">Realizado de {formatMinutes(kpis.horas_esperadas)} planejadas</p>
                        </div>
                        <div className="p-4 flex items-center justify-between bg-gray-50/50">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{messages.ponto.labels.saldoAtual}</p>
                                <p className={cn("text-lg font-black", hourBalance >= 0 ? "text-emerald-600" : "text-rose-600")}>
                                    {formatMinutes(hourBalance, true)}
                                </p>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{messages.ponto.labels.diasAtuados}</p>
                                <p className="text-lg font-black text-gray-700">{kpis.dias_trabalhados} / {kpis.dias_meta_turno}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Assiduidade (Faltas) */}
                <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden border border-gray-100">
                    <CardContent className="p-0">
                        <div className="bg-rose-600 p-4 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <TrendingDown className="h-5 w-5 opacity-80" />
                                <Badge className="bg-rose-500/30 text-white border-rose-400/50 text-[10px] font-bold uppercase">{messages.ponto.labels.faltas}</Badge>
                            </div>
                            <h3 className="text-3xl font-black">{kpis.dias_faltas}</h3>
                            <p className="text-xs text-rose-100 font-medium opacity-80">Faltas detectadas</p>
                        </div>
                        <div className="p-4 flex items-center justify-between bg-gray-50/50">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{messages.ponto.labels.totalEmHoras}</p>
                                <p className="text-lg font-black text-rose-600">
                                    {formatMinutes(kpis.horas_faltas)}
                                </p>
                            </div>
                            <div className="p-2 bg-rose-100 rounded-2xl">
                                <Calendar className="h-5 w-5 text-rose-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Desempenho (KM) */}
                <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden border border-gray-100">
                    <CardContent className="p-0">
                        <div className="bg-slate-800 p-4 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <Gauge className="h-5 w-5 opacity-80" />
                                <Badge className="bg-slate-700 text-white border-slate-600 text-[10px] font-bold uppercase">{messages.ponto.labels.rodagemKm}</Badge>
                            </div>
                            <h3 className="text-3xl font-black">{kpis.km_realizado} <span className="text-sm font-normal text-slate-400">km</span></h3>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Contratado: {kpis.km_contratado} km</p>
                        </div>
                        <div className="p-4 flex items-center justify-between bg-gray-50/50">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{messages.ponto.labels.saldoKm}</p>
                                <p className={cn("text-lg font-black", kpis.km_saldo <= 0 ? "text-emerald-600" : "text-rose-600")}>
                                    {kpis.km_saldo <= 0 ? `+${Math.abs(kpis.km_saldo)}` : `-${kpis.km_saldo}`} km
                                </p>
                            </div>
                            <div className="p-2 bg-slate-100 rounded-2xl">
                                <MapPin className="h-5 w-5 text-slate-800" />
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
                            <div className="col-span-1 text-center">{messages.ponto.labels.carga}</div>
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
                        onClick={(id) => setSelectedPontoId(id)}
                    />
                ))}
            </div>
        </div>
    );
}
