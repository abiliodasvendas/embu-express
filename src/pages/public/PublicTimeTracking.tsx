import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { usePublicTimeTracking, usePublicCollaborators } from "@/hooks/api/usePublicClient";
import { format } from "date-fns";
import { FilterX, Users, Timer, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListSkeleton } from "@/components/skeletons";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { cn } from "@/lib/utils";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { STATUS_CADASTRO } from "@/constants/cadastro";
import { DateNavigation } from "@/components/common/DateNavigation";

import { PONTO_STATUS_UI_CONFIG } from "@/constants/ponto";
import { useTimeTrackingViewModel } from "@/hooks";
import { TimeTrackingList } from "@/components/features/timetracking/TimeTrackingList";

export default function PublicTimeTracking() {
    const { uuid } = useParams();
    const [date, setDate] = useState(new Date());

    const { data: records, isLoading, refetch: refetchTracking } = usePublicTimeTracking(uuid, format(date, "yyyy-MM-dd"));
    const { data: collaborators, refetch: refetchCollabs } = usePublicCollaborators(uuid);

    // Unified Logic Hook (ViewModel)
    const vm = useTimeTrackingViewModel({
        records,
        date,
        collaborators,
        syncWithUrl: false // No URL sync for public view to keep it clean
    });

    const handleRefresh = async () => {
        await Promise.all([refetchTracking(), refetchCollabs()]);
    };

    return (
        <PullToRefreshWrapper onRefresh={handleRefresh}>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                {/* Header & Main Filters */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <DateNavigation date={date} onNavigate={setDate} />

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                            {vm.hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={vm.clearAllFilters}
                                    className="text-gray-500 hover:text-gray-900 h-11 px-3 order-last sm:order-none w-full sm:w-auto"
                                >
                                    <FilterX className="h-4 w-4 mr-1.5" />
                                    Limpar
                                </Button>
                            )}

                            <div className="relative w-full sm:w-64 lg:w-72">
                                <Combobox
                                    options={[
                                        { value: STATUS_CADASTRO.TODOS, label: "Todos os Colaboradores" },
                                        ...(collaborators || []).map(f => ({ value: f.id.toString(), label: f.nome_completo }))
                                    ]}
                                    value={vm.selectedUsuario === STATUS_CADASTRO.TODOS ? "" : vm.selectedUsuario}
                                    onSelect={(val) => vm.setSelectedUsuario(val || STATUS_CADASTRO.TODOS)}
                                    placeholder="Buscar colaborador..."
                                    searchPlaceholder="Digite o nome..."
                                    emptyText="Nenhum colaborador encontrado."
                                    startIcon={<Search className="h-4 w-4 text-gray-400" />}
                                    className="h-11 rounded-xl bg-white border-gray-200 focus-visible:ring-primary/20 font-medium shadow-none text-sm text-gray-600 hover:bg-white transition-none pl-9"
                                />
                            </div>

                            <Select value={vm.selectedTurno} onValueChange={vm.setSelectedTurno}>
                                <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 focus:ring-primary/20 font-medium text-gray-600 shadow-none w-full sm:w-[200px]">
                                    <div className="flex items-center gap-2">
                                        <Timer className="h-4 w-4 text-gray-400" />
                                        <SelectValue placeholder="Todos os turnos" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-100 z-[1001]">
                                    <SelectItem value={STATUS_CADASTRO.TODOS} className="font-medium">Todos os turnos</SelectItem>
                                    {vm.uniqueShifts.map((label: string) => (
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
                        const config = PONTO_STATUS_UI_CONFIG[status];
                        const isActive = (status === 'ALL' && vm.activeKpiFilter === null) || vm.activeKpiFilter === status;
                        const count = vm.dynamicKpiCounts[status];

                        return (
                            <button
                                key={status}
                                onClick={() => vm.handleKpiClick(status)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 group text-center h-full active:scale-95 cursor-pointer",
                                    isActive
                                        ? cn(config.border.replace('bg-', 'border-'), config.bg, "shadow-md scale-[1.02]")
                                        : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 hover:shadow-sm"
                                )}
                            >
                                <config.icon className={cn("w-4 h-4 mb-2 opacity-40", isActive ? config.color : "text-gray-400")} />
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
                                    {String(count || 0).padStart(2, '0')}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* List Header */}
                <div className="flex items-center justify-between px-2 pt-2">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Colaboradores ({vm.filteredRecords.length})
                    </h2>
                </div>

                {/* List Container - Responsivo Grid/Lista */}
                {isLoading ? (
                    <ListSkeleton />
                ) : vm.filteredRecords.length === 0 ? (
                    <UnifiedEmptyState
                        icon={FilterX}
                        title="Nenhum registro encontrado"
                        description="Não há registros de ponto para os filtros selecionados nesta data."
                    />
                ) : (
                    <TimeTrackingList
                        records={vm.filteredRecords}
                        date={date}
                    />
                )}
            </div>
        </PullToRefreshWrapper>
    );
}
