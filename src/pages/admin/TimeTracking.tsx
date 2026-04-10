import { TimeTrackingList } from "@/components/features/timetracking/TimeTrackingList";
import { TimeTrackingToolbar } from "@/components/features/timetracking/TimeTrackingToolbar";
import { TimeTrackingKpiFilters } from "@/components/features/timetracking/TimeTrackingKpiFilters";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useEffect, useCallback } from "react";
import { useActiveCollaborators, useClients, useTimeTrackingViewModel, useCountdown } from "@/hooks";

export default function TimeTracking() {
    const { data: activeCollaborators = [] } = useActiveCollaborators();
    const { data: clients = [] } = useClients(undefined, { staleTime: 0, refetchOnWindowFocus: true });

    // Unified Logic Hook (ViewModel)
    const vm = useTimeTrackingViewModel({
        collaborators: activeCollaborators,
        syncWithUrl: true,
        isAdmin: true
    });

    const { seconds: countdown, reset: resetCountdown } = useCountdown({
        initialSeconds: 15,
        onComplete: async () => {
            await vm.refetch();
        }
    });

    const handleRefresh = useCallback(async () => {
        resetCountdown();
        await vm.refetch();
    }, [vm, resetCountdown]);

    useEffect(() => {
        vm.setPageTitle("Controle de Atividade");
    }, [vm]);

    return (
        <PullToRefreshWrapper onRefresh={handleRefresh}>
            <div className="space-y-6 pb-12">
                <TimeTrackingToolbar
                    date={vm.date}
                    onDateChange={vm.setDate}
                    filters={{
                        clienteId: vm.selectedCliente,
                        turno: vm.selectedTurno
                    }}
                    onFiltersChange={(key, val) => {
                        if (key === "clienteId") vm.setSelectedCliente(val);
                        if (key === "turno") vm.setSelectedTurno(val);
                    }}
                    clients={clients}
                    uniqueShifts={vm.uniqueShifts}
                    countdown={countdown}
                    isLoading={vm.isFetching || vm.isActionLoading}
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
