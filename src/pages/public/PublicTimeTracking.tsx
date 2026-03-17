import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { usePublicTimeTracking, usePublicCollaborators } from "@/hooks/api/usePublicClient";
import { format } from "date-fns";
import { FilterX, Users, Timer, AlertTriangle, Search, Clock, PlayCircle, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListSkeleton } from "@/components/skeletons";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { getManagementStatus, ManagementStatus, formatTime, formatMinutes } from "@/utils/ponto";
import { cn } from "@/lib/utils";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { STATUS_CADASTRO } from "@/constants/cadastro";
import { DateNavigation } from "@/components/common/DateNavigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function PublicTimeTracking() {
    const { uuid } = useParams();
    const [date, setDate] = useState(new Date());
    const [selectedShift, setSelectedShift] = useState<string>(STATUS_CADASTRO.TODOS);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeKpiFilter, setActiveKpiFilter] = useState<ManagementStatus | null>(null);

    const { data: records, isLoading, refetch: refetchTracking } = usePublicTimeTracking(uuid, format(date, "yyyy-MM-dd"));
    const { data: collaborators, refetch: refetchCollabs } = usePublicCollaborators(uuid);

    const handleRefresh = async () => {
        await Promise.all([refetchTracking(), refetchCollabs()]);
    };

    const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any; border: string }> = {
        ALL: { label: "Todos", color: "text-primary", bg: "bg-primary/5", border: "bg-primary", icon: Users },
        LATE: { label: "Atrasados", color: "text-amber-600", bg: "bg-amber-50", border: "bg-amber-500", icon: Clock },
        WORKING: { label: "Trabalhando", color: "text-blue-600", bg: "bg-blue-50", border: "bg-blue-500", icon: PlayCircle },
        DONE: { label: "Finalizado", color: "text-gray-400", bg: "bg-gray-100", border: "bg-gray-400", icon: LogOut },
        WAITING: { label: "Aguar. Início", color: "text-sky-600", bg: "bg-sky-50", border: "bg-sky-400", icon: Clock },
        ABSENT: { label: "Faltas", color: "text-rose-600", bg: "bg-rose-50", border: "bg-rose-500", icon: AlertTriangle },
    };

    // Filter Logic
    const processedRecords = useMemo(() => {
        return records?.map(r => ({
            ...r,
            mgtStatus: getManagementStatus(r, date)
        })) || [];
    }, [records, date]);

    const filteredRecords = processedRecords.filter(r => {
        const matchesSearch = r.usuario?.nome_completo?.toLowerCase().includes(searchQuery.toLowerCase());
        
        let matchesShift = selectedShift === STATUS_CADASTRO.TODOS;
        if (!matchesShift) {
            const recordShift = r.detalhes_calculo?.entrada?.turno_base && r.detalhes_calculo?.saida?.turno_base
                ? `${r.detalhes_calculo.entrada.turno_base.substring(0, 5)} - ${r.detalhes_calculo.saida.turno_base.substring(0, 5)}`
                : null;
            matchesShift = recordShift === selectedShift;
        }

        const matchesKpi = !activeKpiFilter || r.mgtStatus === activeKpiFilter;

        return matchesSearch && matchesShift && matchesKpi;
    });

    const kpiCounts = useMemo(() => {
        const counts = { ALL: processedRecords.length, LATE: 0, WORKING: 0, DONE: 0, WAITING: 0, ABSENT: 0 };
        processedRecords.forEach(r => {
            counts[r.mgtStatus as ManagementStatus]++;
        });
        return counts;
    }, [processedRecords]);

    const uniqueShifts = Array.from(new Set(
        collaborators?.flatMap(c => c.links?.map((l: any) =>
            (l.hora_inicio && l.hora_fim) ? `${l.hora_inicio.substring(0, 5)} - ${l.hora_fim.substring(0, 5)}` : null
        ).filter(Boolean)) || []
    )).sort();

    return (
        <PullToRefreshWrapper onRefresh={handleRefresh}>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                {/* Header & Main Filters */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <DateNavigation date={date} onNavigate={setDate} />
                        
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                            {(searchQuery || selectedShift !== STATUS_CADASTRO.TODOS) && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedShift(STATUS_CADASTRO.TODOS);
                                    }}
                                    className="text-gray-500 hover:text-gray-900 h-11 px-3 order-last sm:order-none w-full sm:w-auto"
                                >
                                    <FilterX className="h-4 w-4 mr-1.5" />
                                    Limpar
                                </Button>
                            )}

                            <div className="relative w-full sm:w-64 lg:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar colaborador..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-11 rounded-xl bg-white border-gray-200 focus-visible:ring-primary/20 shadow-none font-medium text-gray-600"
                                />
                            </div>

                            <Select value={selectedShift} onValueChange={setSelectedShift}>
                                <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 focus:ring-primary/20 font-medium text-gray-600 shadow-none w-full sm:w-[200px]">
                                    <div className="flex items-center gap-2">
                                        <Timer className="h-4 w-4 text-gray-400" />
                                        <SelectValue placeholder="Todos os turnos" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-100 z-[1001]">
                                    <SelectItem value={STATUS_CADASTRO.TODOS} className="font-medium">Todos os turnos</SelectItem>
                                    {uniqueShifts.map((label: string) => (
                                        <SelectItem key={label} value={label} className="font-medium text-gray-600">{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* KPI Quick Filters */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
                    {(['ALL', 'LATE', 'WORKING', 'DONE', 'WAITING', 'ABSENT'] as const).map((status) => {
                        const config = status === 'ALL' ? statusConfig.ALL : statusConfig[status];
                        const isActive = (status === 'ALL' && activeKpiFilter === null) || activeKpiFilter === status;
                        const count = kpiCounts[status];
                        
                        return (
                            <button
                                key={status}
                                onClick={() => setActiveKpiFilter(status === 'ALL' ? null : (isActive ? null : (status as ManagementStatus)))}
                                className={cn(
                                    "flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 group text-center h-full active:scale-95 cursor-pointer",
                                    isActive
                                        ? cn(config.border.replace('bg-', 'border-'), config.bg, "shadow-md scale-[1.02]")
                                        : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 hover:shadow-sm"
                                )}
                            >
                                <span className={cn(
                                    "text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-0.5 sm:mb-1 transition-colors",
                                    isActive ? config.color : "text-gray-400 group-hover:text-gray-600"
                                )}>
                                    {config.label}
                                </span>
                                <span className={cn(
                                    "text-lg sm:text-2xl font-black transition-colors",
                                    isActive ? config.color : "text-gray-300 group-hover:text-gray-500"
                                )}>
                                    {String(count).padStart(2, '0')}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* List Header */}
                <div className="flex items-center justify-between px-2 pt-2">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Colaboradores ({filteredRecords.length})
                    </h2>
                </div>

                {/* List Container - Responsivo Grid/Lista */}
                {isLoading ? (
                    <ListSkeleton />
                ) : filteredRecords.length === 0 ? (
                    <UnifiedEmptyState
                        icon={FilterX}
                        title="Nenhum registro encontrado"
                        description="Não há registros de ponto para os filtros selecionados nesta data."
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredRecords.map((record) => {
                            const mStatus = record.mgtStatus as ManagementStatus;
                            const config = statusConfig[mStatus];
                            
                            return (
                                <Card key={record.id} className="border-none shadow-sm rounded-2xl overflow-hidden group hover:shadow-md transition-all duration-300 relative flex h-full">
                                    {/* Vertical Status Bar */}
                                    <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", config.border)} />

                                    <div className="flex-1 p-3 pl-6 flex flex-col h-full justify-between gap-2.5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border shadow-sm">
                                                    <AvatarImage src={record.usuario?.foto_url} />
                                                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold uppercase">
                                                        {record.usuario?.nome_completo?.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-gray-900 leading-tight line-clamp-1">{record.usuario?.nome_completo}</h3>
                                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5">
                                                        Turno: {record.detalhes_calculo?.entrada?.turno_base?.slice(0, 5) || '--:--'} - {record.detalhes_calculo?.saida?.turno_base?.slice(0, 5) || '--:--'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className={cn("text-[8px] uppercase font-black px-1.5 h-5 rounded-md border-none shrink-0", config.bg, config.color)}>
                                                {config.label}
                                            </Badge>
                                        </div>

                                        <div className="flex items-end justify-between border-t border-gray-50 pt-2.5">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Entrada</p>
                                                <p className={cn("text-base font-black leading-none", record.entrada_hora ? "text-gray-900" : "text-gray-300")}>
                                                    {record.entrada_hora ? formatTime(record.entrada_hora) : (mStatus === 'ABSENT' ? "Faltou" : "Pendente")}
                                                </p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Saída</p>
                                                <p className={cn("text-base font-black leading-none", record.saida_hora ? "text-gray-900" : "text-gray-300")}>
                                                    {record.saida_hora ? formatTime(record.saida_hora) : "--:--"}
                                                </p>
                                            </div>
                                        </div>

                                        {record.entrada_hora && record.saida_hora && (
                                            <div className="bg-gray-50 rounded-xl p-2.5 flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <Timer className="h-3 w-3 text-gray-400" />
                                                    <span className="text-[11px] font-bold text-gray-700">{record.detalhes_calculo?.resumo?.horas_trabalhadas || "00:00"}</span>
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] font-black",
                                                    (record.saldo_minutos || 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                                                )}>
                                                    {formatMinutes(record.saldo_minutos || 0, true)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </PullToRefreshWrapper>
    );
}
