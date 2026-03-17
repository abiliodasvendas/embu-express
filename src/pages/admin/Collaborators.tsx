import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { CollaboratorList } from "@/components/features/collaborator/CollaboratorList";
import { CollaboratorsToolbar } from "@/components/features/collaborator/CollaboratorsToolbar";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { messages } from "@/constants/messages";
import { useCollaboratorsViewModel } from "@/hooks";
import { Users } from "lucide-react";
import { useEffect } from "react";

export function Collaborators() {
    const vm = useCollaboratorsViewModel();

    useEffect(() => {
        vm.setPageTitle("Colaboradores");
    }, [vm]);

    return (
        <>
            <PullToRefreshWrapper onRefresh={async () => { await vm.refetch(); }}>
                <div className="space-y-6">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardContent className="px-0">
                            <div className="mb-6">
                                <CollaboratorsToolbar
                                    searchTerm={vm.searchTerm}
                                    onSearchChange={vm.setSearchTerm}
                                    selectedStatus={vm.selectedStatus}
                                    onStatusChange={vm.setSelectedStatus}
                                    selectedRole={vm.selectedRole}
                                    onRoleChange={vm.setSelectedRole}
                                    onRegister={vm.handleRegister}
                                    onApplyFilters={vm.handleApplyFilters}
                                    roles={vm.roles}
                                    clients={vm.clients}
                                    selectedClient={vm.selectedClient}
                                    onClientChange={vm.setSelectedClient}
                                    empresas={vm.empresas}
                                    selectedEmpresa={vm.selectedEmpresa}
                                    onEmpresaChange={(val) => vm.setSelectedEmpresa(val)}
                                />
                            </div>

                            {vm.isLoading ? (
                                <ListSkeleton />
                            ) : vm.collaborators && vm.collaborators.length > 0 ? (
                                <CollaboratorList
                                    collaborators={vm.collaborators}
                                    onEdit={vm.handleEdit}
                                    onStatusChange={vm.handleStatusChange}
                                    onDelete={vm.handleDelete}
                                />
                            ) : (
                                <UnifiedEmptyState
                                    icon={Users}
                                    title={messages.emptyState.colaborador.titulo}
                                    description={
                                        vm.searchTerm
                                            ? messages.emptyState.colaborador.semResultados
                                            : messages.emptyState.colaborador.descricao
                                    }
                                    action={
                                        !vm.searchTerm
                                            ? {
                                                label: "Cadastrar Colaborador",
                                                onClick: vm.handleRegister,
                                            }
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

export default Collaborators;
