import { TimeTrackingList } from "@/components/features/timetracking/TimeTrackingList";
import { TimeTrackingToolbar } from "@/components/features/timetracking/TimeTrackingToolbar";
import { TimeTrackingKpiFilters } from "@/components/features/timetracking/TimeTrackingKpiFilters";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useActiveCollaborators, useClients } from "@/hooks";
import { useEffect } from "react";
import { useTimeTrackingViewModel } from "@/hooks";

export default function TimeTracking() {
    const { data: activeCollaborators = [] } = useActiveCollaborators();
    const { data: clients = [] } = useClients(undefined, { staleTime: 0, refetchOnWindowFocus: true });

    // Unified Logic Hook (ViewModel)
    const vm = useTimeTrackingViewModel({
        collaborators: activeCollaborators,
        syncWithUrl: true,
        isAdmin: true
    });

    useEffect(() => {
        vm.setPageTitle("Controle de Atividade");
    }, [vm]);

    return (
        <PullToRefreshWrapper onRefresh={async () => { await vm.refetch(); }}>
            <div className="space-y-6 pb-12">
                <TimeTrackingToolbar
                    date={vm.date}
                    onDateChange={vm.setDate}
                    searchTerm={vm.searchTerm}
                    onSearchChange={vm.setSearchTerm}
                    filters={{
                        usuarioId: vm.selectedUsuario,
                        clienteId: vm.selectedCliente,
                        turno: vm.selectedTurno
                    }}
                    onFiltersChange={(key, val) => {
                        if (key === "usuarioId") vm.setSelectedUsuario(val);
                        if (key === "clienteId") vm.setSelectedCliente(val);
                        if (key === "turno") vm.setSelectedTurno(val);
                    }}
                    onRegister={vm.handleCreate}
                    collaborators={activeCollaborators}
                    clients={clients}
                    uniqueShifts={vm.uniqueShifts}
                    onApplyFilters={(newFilters) => {
                        vm.setFilters({
                            usuario: newFilters.usuarioId,
                            cliente: newFilters.clienteId,
                            turno: newFilters.turno,
                            searchTerm: newFilters.searchTerm
                        });
                    }}
                    onClearFilters={vm.clearAllFilters}
                    hasActiveFilters={vm.hasActiveFilters}
                />

                <TimeTrackingKpiFilters
                    activeFilter={vm.activeKpiFilter}
                    counts={vm.dynamicKpiCounts}
                    onFilterClick={vm.handleKpiClick}
                    className="pt-2"
                />

                <div className="space-y-4">
                    {vm.isLoading ? (
                        <ListSkeleton />
                    ) : (
                        <TimeTrackingList
                            records={vm.filteredRecords}
                            date={vm.date}
                            showClient={true}
                        />
                    )}
                </div>

                <LoadingOverlay active={vm.isLoading || vm.isActionLoading} text="Carregando..." />
            </div>
        </PullToRefreshWrapper>
    );
}
