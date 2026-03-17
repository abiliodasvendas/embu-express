import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { TimeTrackingList } from "@/components/features/timetracking/TimeTrackingList";
import { TimeTrackingToolbar } from "@/components/features/timetracking/TimeTrackingToolbar";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useLayout } from "@/contexts/LayoutContext";
import { useActiveCollaborators, useClients } from "@/hooks";
import { useCreateTimeRecord, useDeleteTimeRecord, useUpdateTimeRecord } from "@/hooks/api/useTimeRecordMutations";
import { useTimeRecords } from "@/hooks/api/useTimeRecords";
import { format } from "date-fns";
import { CalendarX, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

import { PONTO_STATUS_UI_CONFIG } from "@/constants/ponto";
import { useTimeTrackingViewModel } from "@/hooks";

export default function TimeTracking() {
    const { setPageTitle, openTimeRecordDialog } = useLayout();
    const [date, setDate] = useState<Date>(new Date());

    // Data Hooks
    const { data: activeCollaborators = [] } = useActiveCollaborators();
    const { data: clients = [] } = useClients(undefined, { staleTime: 0, refetchOnWindowFocus: true });

    const { data: records, isLoading, refetch } = useTimeRecords({
        date: format(date, "yyyy-MM-dd"),
        searchTerm: undefined, // Controlled by ViewModel
        usuarioId: undefined, // Controlled by ViewModel
        statusEntrada: undefined, // Controlled by ViewModel
        statusSaida: undefined, // Controlled by ViewModel
        clienteId: undefined, // Controlled by ViewModel
        incluirTodos: true
    });

    // Unified Logic Hook (ViewModel)
    const vm = useTimeTrackingViewModel({
        records,
        date,
        collaborators: activeCollaborators,
        syncWithUrl: true
    });

    // Actions
    const createRecord = useCreateTimeRecord();
    const updateRecord = useUpdateTimeRecord();
    const deleteRecord = useDeleteTimeRecord();
    const isActionLoading = createRecord.isPending || updateRecord.isPending || deleteRecord.isPending;

    useEffect(() => {
        setPageTitle("Controle de Ponto");
    }, [setPageTitle]);

    return (
        <PullToRefreshWrapper onRefresh={async () => { await refetch(); }}>
            <div className="space-y-6 pb-12">
                <TimeTrackingToolbar
                    date={date}
                    onDateChange={setDate}
                    searchTerm={vm.searchTerm}
                    onSearchChange={vm.setSearchTerm}
                    filters={{
                        statusEntrada: vm.selectedStatusEntrada,
                        statusSaida: vm.selectedStatusSaida,
                        usuarioId: vm.selectedUsuario,
                        clienteId: vm.selectedCliente,
                        turno: vm.selectedTurno
                    }}
                    onFiltersChange={(key, val) => {
                        if (key === "statusEntrada") vm.setSelectedStatusEntrada(val);
                        if (key === "statusSaida") vm.setSelectedStatusSaida(val);
                        if (key === "usuarioId") vm.setSelectedUsuario(val);
                        if (key === "clienteId") vm.setSelectedCliente(val);
                        if (key === "turno") vm.setSelectedTurno(val);
                    }}
                    onRegister={() => openTimeRecordDialog({})}
                    collaborators={activeCollaborators}
                    clients={clients}
                    onApplyFilters={(newFilters) => {
                        vm.setFilters({
                            statusEntrada: newFilters.statusEntrada,
                            statusSaida: newFilters.statusSaida,
                            usuario: newFilters.usuarioId,
                            cliente: newFilters.clienteId,
                            turno: newFilters.turno,
                            searchTerm: newFilters.searchTerm
                        });
                    }}
                    hasActiveFilters={vm.hasActiveFilters}
                />

                {/* KPI Quick Filters */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                    {(['ALL', 'LATE', 'WORKING', 'DONE', 'WAITING', 'ABSENT'] as const).map((status) => {
                        const config = PONTO_STATUS_UI_CONFIG[status];
                        const isActive = (status === 'ALL' && vm.activeKpiFilter === null) || vm.activeKpiFilter === status;
                        const count = vm.dynamicKpiCounts[status];

                        return (
                            <button
                                key={status}
                                onClick={() => vm.handleKpiClick(status)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 text-center h-full active:scale-95 cursor-pointer",
                                    isActive
                                        ? cn(config.border, config.bg, "shadow-md scale-[1.02]")
                                        : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 hover:shadow-sm"
                                )}
                            >
                                <config.icon className={cn("w-4 h-4 mb-2 opacity-40", isActive ? config.color : "text-gray-400")} />
                                <span className={cn(
                                    "text-[8px] sm:text-[10px] font-bold uppercase tracking-wider mb-1 leading-tight text-center px-1",
                                    isActive ? config.color : "text-gray-400"
                                )}>
                                    {config.label}
                                </span>
                                <span className={cn(
                                    "text-lg sm:text-2xl font-black",
                                    isActive ? config.color : "text-gray-300"
                                )}>
                                    {String(count || 0).padStart(2, '0')}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2 pt-2">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Colaboradores ({vm.filteredRecords.length})
                        </h2>
                    </div>

                    {isLoading ? (
                        <ListSkeleton />
                    ) : vm.filteredRecords.length === 0 ? (
                        <UnifiedEmptyState
                            icon={CalendarX}
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

                <LoadingOverlay active={isActionLoading} text="Processando..." />
            </div>
        </PullToRefreshWrapper>
    );
}
