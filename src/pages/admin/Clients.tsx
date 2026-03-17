import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ClientList } from "@/components/features/client/ClientList";
import { ClientsToolbar } from "@/components/features/client/ClientsToolbar";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { messages } from "@/constants/messages";
import { useClientsViewModel } from "@/hooks";
import { Users } from "lucide-react";
import { useEffect } from "react";

export default function Clients() {
    const vm = useClientsViewModel();

    useEffect(() => {
        vm.setPageTitle("Clientes");
    }, [vm]);

    return (
        <>
            <PullToRefreshWrapper onRefresh={async () => { await vm.refetch(); }}>
                <div className="space-y-6">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardContent className="px-0">
                            <div className="mb-6">
                                <ClientsToolbar
                                    searchTerm={vm.searchTerm}
                                    onSearchChange={vm.setSearchTerm}
                                    selectedStatus={vm.selectedStatus}
                                    onStatusChange={vm.setSelectedStatus}
                                    onRegister={vm.handleRegister}
                                    onApplyFilters={vm.handleApplyFilters}
                                />
                            </div>

                            {vm.isLoading ? (
                                <ListSkeleton />
                            ) : vm.clients && vm.clients.length > 0 ? (
                                <ClientList
                                    clients={vm.clients}
                                    onEdit={vm.handleEdit}
                                    onToggleStatus={vm.handleToggleStatus}
                                    onDelete={vm.handleDelete}
                                />
                            ) : (
                                <UnifiedEmptyState
                                    icon={Users}
                                    title={messages.emptyState.cliente.titulo}
                                    description={
                                        vm.searchTerm
                                            ? messages.emptyState.cliente.semResultados
                                            : messages.emptyState.cliente.descricao
                                    }
                                    action={
                                        !vm.searchTerm
                                            ? { label: "Cadastrar Cliente", onClick: vm.handleRegister }
                                            : undefined
                                    }
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </PullToRefreshWrapper>

            <LoadingOverlay active={vm.isActionLoading} text="Processando..." />
        </>
    );
}
