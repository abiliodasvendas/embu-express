import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { TimeTrackingList } from "@/components/features/timetracking/TimeTrackingList";
import { TimeTrackingToolbar } from "@/components/features/timetracking/TimeTrackingToolbar";
import { TimeTrackingKpiFilters } from "@/components/features/timetracking/TimeTrackingKpiFilters";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useLayout } from "@/contexts/LayoutContext";
import { useActiveCollaborators, useClients } from "@/hooks";
import { useTimeRecords } from "@/hooks/api/useTimeRecords";
import { format } from "date-fns";
import { CalendarX, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

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
        vm.setPageTitle("Controle de Ponto");
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
                    onRegister={vm.handleCreate}
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

                <TimeTrackingKpiFilters
                    activeFilter={vm.activeKpiFilter}
                    counts={vm.dynamicKpiCounts}
                    onFilterClick={vm.handleKpiClick}
                    className="pt-2"
                />
                <div className="space-y-4">
                    {vm.isLoading ? (
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
