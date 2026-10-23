import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { EmpresaList } from "@/components/features/empresa/EmpresaList";
import { EmpresasToolbar } from "@/components/features/empresa/EmpresasToolbar";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { messages } from "@/constants/messages";
import { useLayout } from "@/contexts/LayoutContext";
import { safeCloseDialog } from "@/hooks";
import {
  useCreateEmpresa,
  useDeleteEmpresa,
  useToggleEmpresaStatus,
} from "@/hooks/api/useEmpresaMutations";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { useBatchFilters, useFiltersManager, useSearchFilters, useStatusFilters } from "@/hooks/ui/useFilters";
import { Empresa } from "@/types/database";
import { FilterOptions, StatusUsuario } from "@/types/enums";
import { Building2, Plus } from "lucide-react";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";

export function Empresas() {
  const { setPageTitle, openConfirmationDialog, closeConfirmationDialog, openEmpresaFormDialog, openContasBancariasDialog } = useLayout();

  const { searchTerm, setSearchTerm } = useSearchFilters();
  const { selectedStatus, setSelectedStatus } = useStatusFilters();
  const { hasActiveFilters, clearFilters } = useFiltersManager(["search", "status"]);
  const setFilters = useBatchFilters({ statusParam: "status", searchParam: "search" });

  const handleApplyFilters = useCallback((filters: { status?: string }) => {
    if (filters.status !== undefined) {
      setSelectedStatus(filters.status);
    }
    setFilters({ status: filters.status });
  }, [setSelectedStatus, setFilters]);

  const { data: empresas = [], isLoading, isFetching, refetch } = useEmpresas({
    searchTerm: searchTerm || undefined,
    ativo: selectedStatus === FilterOptions.TODOS ? undefined : (selectedStatus === StatusUsuario.ATIVO ? "true" : "false"),
  });

  const isInitialLoading = isLoading && !empresas?.length;

  const createEmpresa = useCreateEmpresa();
  const deleteEmpresa = useDeleteEmpresa();
  const toggleStatus = useToggleEmpresaStatus();

  useEffect(() => {
    setPageTitle("Empresas");
  }, [setPageTitle]);

  const pullToRefreshReload = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleEdit = (empresa: Empresa) => {
    openEmpresaFormDialog({ empresaToEdit: empresa });
  };

  const handleRegister = () => {
    openEmpresaFormDialog({});
  };

  const handleGerenciarContas = (empresa: Empresa) => {
    openContasBancariasDialog({ empresaIdInicial: empresa.id });
  };

  const handleDelete = async (empresa: Empresa) => {
    openConfirmationDialog({
      title: messages.dialogo.remover.titulo,
      description: `Tem certeza que deseja remover a empresa "${empresa.nome_fantasia}"? Esta ação não pode ser desfeita.`,
      confirmText: messages.dialogo.remover.botao,
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteEmpresa.mutateAsync(empresa.id);
          safeCloseDialog(closeConfirmationDialog);
        } catch (error) {
          console.error(error);
        }
      },
    });
  };

  const handleToggleStatus = (empresa: Empresa) => {
    const action = empresa.ativo ? "desativar" : "ativar";
    openConfirmationDialog({
      title: `${empresa.ativo ? "Desativar" : "Ativar"} Empresa`,
      description: `Tem certeza que deseja ${action} a empresa "${empresa.nome_fantasia}"?`,
      confirmText: empresa.ativo ? "Desativar" : "Ativar",
      variant: empresa.ativo ? "destructive" : "default",
      onConfirm: async () => {
        try {
          await toggleStatus.mutateAsync({
            id: empresa.id,
            ativo: !empresa.ativo,
          });
          safeCloseDialog(closeConfirmationDialog);
        } catch (error) {
          toast.error(messages.erro.atualizar);
        }
      },
    });
  };

  const isActionLoading = deleteEmpresa.isPending || toggleStatus.isPending || createEmpresa.isPending;

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="space-y-6 w-full animate-in fade-in duration-300 pb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Empresas
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Gerencie as empresas e filiais emissoras do grupo
                </p>
              </div>
            </div>

            <Button
              onClick={handleRegister}
              className="h-11 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-4 gap-2 shadow-xs transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Nova Empresa</span>
            </Button>
          </div>

          <EmpresasToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            onApplyFilters={handleApplyFilters}
            hasActiveFilters={hasActiveFilters}
            onClear={clearFilters}
          />

          {isInitialLoading ? (
            <ListSkeleton />
          ) : empresas && empresas.length > 0 ? (
            <EmpresaList
              empresas={empresas}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
              onGerenciarContas={handleGerenciarContas}
              isFetching={isFetching}
            />
          ) : (
            <UnifiedEmptyState
              icon={Building2}
              title="Nenhuma empresa encontrada"
              description={
                searchTerm
                  ? "Não encontramos nenhuma empresa com os filtros atuais."
                  : "Cadastre a primeira empresa para começar."
              }
              action={!searchTerm ? { label: "Cadastrar Empresa", onClick: handleRegister } : undefined}
            />
          )}
        </div>
      </PullToRefreshWrapper>

      <LoadingOverlay active={isActionLoading} text="Processando..." />
    </>
  );
}

export default Empresas;
