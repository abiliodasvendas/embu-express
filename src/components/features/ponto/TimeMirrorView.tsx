import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ListSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTimeMirror } from "@/hooks/api/useTimeMirror";
import { cn } from "@/lib/utils";
import { Calendar, Clock, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { meses, anos } from "@/utils/formatters/constants";
import { useFilters } from "@/hooks/ui/useFilters";
import { useLayout } from "@/contexts/LayoutContext";
import { useTimeRecord } from "@/hooks/api/useTimeRecord";
import { useState, useEffect } from "react";
import { useDeletePonto } from "@/hooks/api/usePontoMutations";
import { RegistroPonto } from "@/types/database";

interface TimeMirrorViewProps {
    usuarioId?: string;
    hideCollaboratorSelect?: boolean;
}

export function TimeMirrorView({ usuarioId, hideCollaboratorSelect = false }: TimeMirrorViewProps) {
    const {
        selectedMes: selectedMonth = new Date().getMonth() + 1,
        setSelectedMes: setSelectedMonth = () => {},
        selectedAno: selectedYear = new Date().getFullYear(),
        setSelectedAno: setSelectedYear = () => {},
    } = useFilters({
        mesParam: "mes",
        anoParam: "ano",
    });

    const { data: report = [], isLoading } = useTimeMirror(
        usuarioId || undefined,
        selectedMonth,
        selectedYear
    );

    const { openTimeRecordDetailsDialog, openEditTimeRecordDialog, openConfirmationDialog, closeConfirmationDialog } = useLayout();
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
                await deletePonto(record.id);
                closeConfirmationDialog();
            }
        });
    };

    const handleEditFromDetails = (record: RegistroPonto) => {
        openEditTimeRecordDialog({ record });
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

    const monthOptions = useMemo(() =>
        meses.map((label, index) => ({ value: index + 1, label })),
        []);

    const totals = useMemo(() => {
        if (!report.length) return { worked: 0, expected: 0, balance: 0 };

        let workedMin = 0;
        let expectedMin = 0;

        report.forEach(day => {
            workedMin += (day.tempo_trabalhado_minutos || 0);
            expectedMin += ((day.tempo_trabalhado_minutos || 0) - (day.saldo_minutos || 0));
        });

        return {
            worked: workedMin,
            expected: expectedMin,
            balance: workedMin - expectedMin
        };
    }, [report]);

    const formatMinutes = (minutes: number) => {
        const roundedMin = Math.round(minutes);
        const absMin = Math.abs(roundedMin);
        const h = Math.floor(absMin / 60);
        const m = absMin % 60;
        const sign = roundedMin < 0 ? "-" : "";
        return `${sign}${h}h ${String(m).padStart(2, "0")}m`;
    };

    return (
        <div className="space-y-6">
            {/* Context Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                    <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
                        <SelectTrigger className="h-9 w-[130px] rounded-xl border-none bg-white shadow-sm font-semibold text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {monthOptions.map(m => (
                                <SelectItem key={m.value} value={String(m.value)} className="text-xs">{m.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                        <SelectTrigger className="h-9 w-[90px] rounded-xl border-none bg-white shadow-sm font-semibold text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {anos.map(a => (
                                <SelectItem key={a.value} value={a.value} className="text-xs">{a.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {!usuarioId ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-4 bg-primary/5 rounded-full">
                        <Calendar className="h-8 w-8 text-primary/40" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Nenhum colaborador selecionado</h3>
                        <p className="text-sm text-gray-500 max-w-[280px]">Escolha um colaborador acima para visualizar o espelho de ponto.</p>
                    </div>
                </div>
            ) : isLoading ? (
                <ListSkeleton />
            ) : report.length > 0 ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className="border-none shadow-sm rounded-3xl bg-blue-50/50">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 rounded-2xl">
                                        <Clock className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Total Trabalhado</p>
                                        <h3 className="text-2xl font-black text-blue-900">{formatMinutes(totals.worked)}</h3>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm rounded-3xl bg-amber-50/50">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-100 rounded-2xl">
                                        <Calendar className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-1">Total Esperado</p>
                                        <h3 className="text-2xl font-black text-amber-900">{formatMinutes(totals.expected)}</h3>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className={cn(
                            "border-none shadow-sm rounded-3xl",
                            totals.balance >= 0 ? "bg-emerald-50/50" : "bg-red-50/50"
                        )}>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "p-3 rounded-2xl",
                                        totals.balance >= 0 ? "bg-emerald-100" : "bg-red-100"
                                    )}>
                                        {totals.balance >= 0 ? <TrendingUp className="h-6 w-6 text-emerald-600" /> : <TrendingDown className="h-6 w-6 text-red-600" />}
                                    </div>
                                    <div>
                                        <p className={cn(
                                            "text-xs font-bold uppercase tracking-wider mb-1",
                                            totals.balance >= 0 ? "text-emerald-600" : "text-red-600"
                                        )}>Saldo do Mês</p>
                                        <h3 className={cn(
                                            "text-2xl font-black",
                                            totals.balance >= 0 ? "text-emerald-900" : "text-red-900"
                                        )}>{formatMinutes(totals.balance)}</h3>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Daily Logs */}
                    <div className="grid gap-3">
                        <div className="hidden md:grid grid-cols-7 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] pb-2">
                            <div className="col-span-1">Data</div>
                            <div className="col-span-1">Entrada</div>
                            <div className="col-span-1">Saída</div>
                            <div className="col-span-1 text-center">Intervalo</div>
                            <div className="col-span-1 text-center">Trabalhado</div>
                            <div className="col-span-1 text-center">Esperado</div>
                            <div className="col-span-1 text-right">Saldo</div>
                        </div>

                        {report.map((day, idx) => {
                            const balance = day.saldo_minutos || 0;
                            const esperadoForDay = (day.tempo_trabalhado_minutos || 0) - (day.saldo_minutos || 0);
                            return (
                                <Card
                                    key={idx}
                                    className={cn(
                                        "border-none shadow-sm rounded-[1.5rem] overflow-hidden group hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.99]",
                                        isFetchingRecord && selectedPontoId === day.id && "opacity-60 cursor-wait"
                                    )}
                                    onClick={() => !isFetchingRecord && setSelectedPontoId(day.id)}
                                >
                                    <CardContent className="p-4 md:py-3 md:px-6">
                                        <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-4">
                                            {/* Date */}
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-gray-50 group-hover:bg-primary/5 transition-colors flex flex-col items-center justify-center shrink-0">
                                                    <span className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-primary transition-colors leading-none mb-0.5">
                                                        {format(new Date(day.data_referencia + 'T12:00:00'), 'EEE', { locale: ptBR })}
                                                    </span>
                                                    <span className="text-sm font-black text-gray-700 group-hover:text-primary transition-colors">
                                                        {format(new Date(day.data_referencia + 'T12:00:00'), 'dd')}
                                                    </span>
                                                </div>
                                                <div className="md:hidden">
                                                    <h4 className="font-bold text-gray-900">
                                                        {format(new Date(day.data_referencia + 'T12:00:00'), "dd 'de' MMMM", { locale: ptBR })}
                                                    </h4>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-0.5">{day.cliente_nome || 'Sem Cliente'}</p>
                                                </div>
                                            </div>

                                            {/* Entrada / Saída */}
                                            <div className="grid grid-cols-2 md:contents gap-2">
                                                <div>
                                                    <p className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Entrada</p>
                                                    <p className="text-sm font-bold text-gray-700">
                                                        {day.entrada_hora ? format(new Date(day.entrada_hora), 'HH:mm') : '--:--'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Saída</p>
                                                    <p className="text-sm font-bold text-gray-700">
                                                        {day.saida_hora ? format(new Date(day.saida_hora), 'HH:mm') : '--:--'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Intervalo */}
                                            <div className="text-center">
                                                <p className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Intervalo</p>
                                                <p className="text-sm font-medium text-gray-400 italic">
                                                    {day.total_pausas_minutos ? `${Math.round(day.total_pausas_minutos)}m` : '0m'}
                                                </p>
                                            </div>

                                            {/* Trabalhado */}
                                            <div className="text-center bg-gray-50/50 md:bg-transparent rounded-2xl p-2 md:p-0">
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

                                            {/* Saldo Dia */}
                                            <div className="text-right">
                                                <p className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Saldo</p>
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
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            ) : (
                <UnifiedEmptyState
                    icon={Calendar}
                    title="Sem registros neste mês"
                    description="Não foram encontrados pontos batidos para este colaborador no período selecionado."
                />
            )}
        </div>
    );
}
