import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ClientList } from "@/components/features/client/ClientList";
import { ClientsToolbar } from "@/components/features/client/ClientsToolbar";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { messages } from "@/constants/messages";
import { useClientsViewModel } from "@/hooks";
import { Building2, Plus } from "lucide-react";
import { useEffect } from "react";

export default function Clients() {
  const vm = useClientsViewModel();

  useEffect(() => {
    vm.setPageTitle("Clientes");
  }, [vm]);

  return (
    <>
      <PullToRefreshWrapper onRefresh={async () => { await vm.refetch(); }}>
        <div className="space-y-6 w-full animate-in fade-in duration-300 pb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Clientes
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Gerencie a carteira de clientes, contratos e regras operacionais
                </p>
              </div>
            </div>

            <Button
              onClick={vm.handleRegister}
              className="h-11 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-4 gap-2 shadow-xs transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Cliente</span>
            </Button>
          </div>

          <ClientsToolbar
            searchTerm={vm.searchTerm}
            onSearchChange={vm.setSearchTerm}
            selectedStatus={vm.selectedStatus}
            onStatusChange={vm.setSelectedStatus}
            onApplyFilters={vm.handleApplyFilters}
            hasActiveFilters={vm.hasActiveFilters}
            onClear={vm.clearFilters}
          />

          {vm.isInitialLoading ? (
            <ListSkeleton />
          ) : vm.clients && vm.clients.length > 0 ? (
            <ClientList
              clients={vm.clients}
              onEdit={vm.handleEdit}
              onToggleStatus={vm.handleToggleStatus}
              onDelete={vm.handleDelete}
              isFetching={vm.isFetching}
            />
          ) : (
            <UnifiedEmptyState
              icon={Building2}
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
        </div>
      </PullToRefreshWrapper>

      <LoadingOverlay active={vm.isActionLoading} text="Processando..." />
    </>
  );
}
