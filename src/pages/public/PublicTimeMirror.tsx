import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { usePublicTimeMirror, usePublicCollaborators } from "@/hooks/api/usePublicClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, TrendingDown, TrendingUp, Users, Filter, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListSkeleton } from "@/components/skeletons";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { formatMinutes, getStatusColorClass, getStatusLabel } from "@/utils/ponto";
import { meses, anos } from "@/utils/formatters/constants";
import { cn } from "@/lib/utils";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";

export default function PublicTimeMirror() {
    const { uuid } = useParams();
    const [selectedCollab, setSelectedCollab] = useState<string>("");
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedShift, setSelectedShift] = useState("todos");

    const { data: collaborators, isLoading: isLoadingCollabs, refetch: refetchCollabs } = usePublicCollaborators(uuid);
    const { data: rawReport, isLoading: isLoadingMirror, refetch: refetchMirror } = usePublicTimeMirror(uuid, selectedCollab, selectedMonth, selectedYear);

    const handleRefresh = async () => {
        await Promise.all([refetchCollabs(), refetchMirror()]);
    };

    // Current Collab Links
    const currentCollab = collaborators?.find(c => c.id === selectedCollab);
    const collabShifts = currentCollab?.links || [];

    // Filter Logic for Shifts
    const report = useMemo(() => {
        if (!rawReport) return [];
        if (selectedShift === "todos") return rawReport;
        return rawReport.filter(r => String(r.colaborador_cliente_id) === selectedShift);
    }, [rawReport, selectedShift]);

    // Totals
    const totals = useMemo(() => {
        if (!report.length) return { worked: 0, expected: 0, balance: 0 };
        let workedMin = 0;
        let expectedMin = 0;
        report.forEach(day => {
            workedMin += (day.tempo_trabalhado_minutos || 0);
            expectedMin += ((day.tempo_trabalhado_minutos || 0) - (day.saldo_minutos || 0));
        });
        return { worked: workedMin, expected: expectedMin, balance: workedMin - expectedMin };
    }, [report]);

    const monthOptions = meses.map((label, index) => ({ value: index + 1, label }));

    return (
        <PullToRefreshWrapper onRefresh={handleRefresh}>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Filters */}
            <Card className="border-none shadow-sm rounded-3xl">
                <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Colaborador */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Colaborador</label>
                            <Select value={selectedCollab} onValueChange={setSelectedCollab}>
                                <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50/50 h-11">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {collaborators?.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.nome_completo}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Turno (Só aparece se tiver colaborador selecionado) */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Turno</label>
                            <Select 
                                value={selectedShift} 
                                onValueChange={setSelectedShift}
                                disabled={!selectedCollab}
                            >
                                <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50/50 h-11">
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos os turnos</SelectItem>
                                    {collabShifts.map((s: any) => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {s.hora_inicio.substring(0, 5)} - {s.hora_fim.substring(0, 5)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Mês */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Mês</label>
                            <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
                                <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50/50 h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {monthOptions.map(m => (
                                        <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Ano */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Ano</label>
                            <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                                <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50/50 h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {anos.map(a => (
                                        <SelectItem key={a.value} value={String(a.value)}>{a.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {!selectedCollab ? (
                <UnifiedEmptyState 
                    icon={Users}
                    title="Selecione um colaborador"
                    description="Escolha um dos seus colaboradores para visualizar o espelho de ponto detalhado."
                />
            ) : isLoadingMirror ? (
                <ListSkeleton />
            ) : report.length > 0 ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className="border-none shadow-sm rounded-3xl bg-blue-50/50 overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 rounded-2xl">
                                        <Clock className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1">Trabalhado</p>
                                        <h3 className="text-xl font-black text-blue-900">{formatMinutes(totals.worked)}</h3>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm rounded-3xl bg-amber-50/50 overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-100 rounded-2xl">
                                        <Calendar className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-1">Esperado</p>
                                        <h3 className="text-xl font-black text-amber-900">{formatMinutes(totals.expected)}</h3>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className={cn(
                            "border-none shadow-sm rounded-3xl overflow-hidden",
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
                                            "text-[10px] font-bold uppercase tracking-wider mb-1",
                                            totals.balance >= 0 ? "text-emerald-600" : "text-red-600"
                                        )}>Saldo Final</p>
                                        <h3 className={cn(
                                            "text-xl font-black",
                                            totals.balance >= 0 ? "text-emerald-900" : "text-red-900"
                                        )}>{formatMinutes(totals.balance)}</h3>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Table */}
                    <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50 text-left">
                                    <tr>
                                        <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data</th>
                                        <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Turno</th>
                                        <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Entrada</th>
                                        <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Saída</th>
                                        <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Intervalo</th>
                                        <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Saldo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {report.map((day, idx) => {
                                        const balance = day.saldo_minutos || 0;
                                        return (
                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-xl bg-gray-50 flex flex-col items-center justify-center shrink-0">
                                                            <span className="text-[8px] font-black text-gray-400 uppercase leading-none">
                                                                {format(new Date(day.data_referencia + 'T12:00:00'), 'EEE', { locale: ptBR })}
                                                            </span>
                                                            <span className="text-xs font-black text-gray-700">
                                                                {format(new Date(day.data_referencia + 'T12:00:00'), 'dd')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                        {day.turno_hora_inicio?.substring(0, 5) || day.detalhes_calculo?.entrada?.turno_base?.substring(0, 5)} - {
                                                            (day.turno_hora_fim || 
                                                             day.detalhes_calculo?.saida?.turno_base || 
                                                             collabShifts.find((s: any) => s.id === day.colaborador_cliente_id)?.hora_fim || 
                                                             '00:00:00'
                                                            ).substring(0, 5)
                                                        }
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm font-bold text-gray-700">{day.entrada_hora ? format(new Date(day.entrada_hora), 'HH:mm') : '--:--'}</span>
                                                        <Badge variant="outline" className={cn("text-[8px] px-1 py-0 h-4 w-fit", getStatusColorClass(day.status_entrada))}>
                                                            {getStatusLabel(day.status_entrada, 'entrada')}
                                                        </Badge>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm font-bold text-gray-700">{day.saida_hora ? format(new Date(day.saida_hora), 'HH:mm') : '--:--'}</span>
                                                        {day.saida_hora && (
                                                            <Badge variant="outline" className={cn("text-[8px] px-1 py-0 h-4 w-fit", getStatusColorClass(day.status_saida))}>
                                                                {getStatusLabel(day.status_saida, 'saida')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-sm font-medium text-gray-400 italic">
                                                        {day.total_pausas_minutos ? `${Math.round(day.total_pausas_minutos)}m` : '0m'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <Badge variant="outline" className={cn(
                                                        "rounded-full px-3 py-1 font-black text-[10px]",
                                                        balance > 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                        balance < 0 ? "bg-red-50 text-red-600 border-red-100" :
                                                        "bg-gray-50 text-gray-400 border-gray-100"
                                                    )}>
                                                        {formatMinutes(balance)}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <UnifiedEmptyState 
                    icon={Calendar}
                    title="Sem registros encontrados"
                    description="Não há batidas de ponto para este colaborador no período selecionado."
                />
            )}
        </div>
        </PullToRefreshWrapper>
    );
}
