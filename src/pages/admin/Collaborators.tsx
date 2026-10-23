import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { CollaboratorList } from "@/components/features/collaborator/CollaboratorList";
import { CollaboratorsToolbar } from "@/components/features/collaborator/CollaboratorsToolbar";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { messages } from "@/constants/messages";
import { useCollaboratorsViewModel } from "@/hooks";
import { Plus, Users } from "lucide-react";
import { useEffect } from "react";

export function Collaborators() {
  const vm = useCollaboratorsViewModel();

  useEffect(() => {
    vm.setPageTitle("Colaboradores");
  }, [vm]);

  return (
    <>
      <PullToRefreshWrapper onRefresh={async () => { await vm.refetch(); }}>
        <div className="space-y-6 w-full animate-in fade-in duration-300 pb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Colaboradores
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Gerencie a equipe, vínculos de clientes e status cadastral
                </p>
              </div>
            </div>

            <Can I={PERMISSIONS.USUARIOS.CRIAR}>
              <Button
                onClick={vm.handleRegister}
                className="h-11 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-4 gap-2 shadow-xs transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Novo Colaborador</span>
              </Button>
            </Can>
          </div>

          <CollaboratorsToolbar
            searchTerm={vm.searchTerm}
            onSearchChange={vm.setSearchTerm}
            selectedStatus={vm.selectedStatus}
            onStatusChange={vm.setSelectedStatus}
            selectedRole={vm.selectedRole}
            onRoleChange={vm.setSelectedRole}
            roles={vm.roles}
            clients={vm.clients}
            selectedClient={vm.selectedClient}
            onClientChange={vm.setSelectedClient}
            empresas={vm.empresas}
            selectedEmpresa={vm.selectedEmpresa}
            onEmpresaChange={(val) => vm.setSelectedEmpresa(val)}
            hasActiveFilters={vm.hasActiveFilters}
            onClear={vm.clearFilters}
            onApplyFilters={vm.handleApplyFilters}
          />

          {vm.isInitialLoading ? (
            <ListSkeleton />
          ) : vm.collaborators && vm.collaborators.length > 0 ? (
            <CollaboratorList
              collaborators={vm.collaborators}
              onEdit={vm.handleEdit}
              onStatusChange={vm.handleStatusChange}
              onDelete={vm.handleDelete}
              page={vm.page}
              pageSize={vm.pageSize}
              total={vm.total}
              totalPages={vm.totalPages}
              onPageChange={vm.setPage}
              onPageSizeChange={vm.setPageSize}
              isFetching={vm.isFetching}
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
        </div>
      </PullToRefreshWrapper>

            <LoadingOverlay active={vm.isActionLoading} text="Processando..." />
        </>
    );
}

export default Collaborators;
