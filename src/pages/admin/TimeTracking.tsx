import { TimeTrackingList } from "@/components/features/timetracking/TimeTrackingList";
import { TimeTrackingToolbar } from "@/components/features/timetracking/TimeTrackingToolbar";
import { TimeTrackingKpiFilters } from "@/components/features/timetracking/TimeTrackingKpiFilters";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useEffect, useCallback } from "react";
import { useActiveCollaborators, useClients, useTimeTrackingViewModel, useCountdown } from "@/hooks";
import { cn } from "@/lib/utils";

export default function TimeTracking() {
    const { data: activeCollaborators = [] } = useActiveCollaborators();
    const { data: clients = [] } = useClients(undefined, { staleTime: 0, refetchOnWindowFocus: true });

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
                        colaboradorId: vm.selectedUsuario,
                        clienteId: vm.selectedCliente,
                        turno: vm.selectedTurno
                    }}
                    onFiltersChange={(key, val) => {
                        if (key === "colaboradorId") vm.setSelectedUsuario(val);
                        if (key === "clienteId") vm.setSelectedCliente(val);
                        if (key === "turno") vm.setSelectedTurno(val);
                    }}
                    collaborators={vm.collaborators}
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

                <div className="space-y-4 relative">
                    {vm.isFetching && !vm.isInitialLoading && (
                        <div className="absolute -top-2 left-0 right-0 h-1 bg-surface-alt overflow-hidden rounded-full z-20">
                            <div className="h-full bg-primary w-full animate-pulse" />
                        </div>
                    )}

                    {vm.isInitialLoading ? (
                        <ListSkeleton />
                    ) : (
                        <div className={cn("transition-opacity duration-200", vm.isFetching && "opacity-60")}>
                            <TimeTrackingList
                                records={vm.filteredRecords}
                                date={vm.date}
                                showClient={true}
                                manualAbsenceIds={vm.manualAbsenceIds}
                                addManualAbsence={vm.addManualAbsence}
                                removeManualAbsence={vm.removeManualAbsence}
                            />
                        </div>
                    )}
                </div>

                <LoadingOverlay active={vm.isActionLoading} text="Processando..." />
            </div>
        </PullToRefreshWrapper>
    );
}
