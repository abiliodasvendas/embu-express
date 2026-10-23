import { Can } from "@/components/auth/Can";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { PerfilList } from "@/components/features/perfil/PerfilList";
import { PerfisToolbar } from "@/components/features/perfil/PerfisToolbar";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { useLayout } from "@/contexts/LayoutContext";
import { safeCloseDialog } from "@/hooks";
import { useDeletePerfil, usePerfis } from "@/hooks/api/usePerfis";
import { Perfil } from "@/types/database";
import { toast } from "@/utils/notifications/toast";
import { Plus, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { useFiltersManager, useSearchFilters } from "@/hooks/ui/useFilters";

export default function Perfis() {
  const { data: perfis = [], isLoading, isFetching, refetch } = usePerfis();
  const deletePerfil = useDeletePerfil();
  const { setPageTitle, openConfirmationDialog, closeConfirmationDialog, openPerfilFormDialog } = useLayout();

  const { searchTerm, setSearchTerm } = useSearchFilters("search");
  const { hasActiveFilters, clearFilters } = useFiltersManager(["search"]);

  const isInitialLoading = isLoading && !perfis.length;

  useEffect(() => {
    setPageTitle("Perfis de Acesso");
  }, [setPageTitle]);

  const pullToRefreshReload = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleEdit = (perfil: Perfil) => {
    openPerfilFormDialog({ perfilToEdit: perfil });
  };

  const handleCreate = () => {
    openPerfilFormDialog({});
  };

  const handleDelete = (perfil: Perfil) => {
    openConfirmationDialog({
      title: "Você tem certeza absoluta?",
      description: `Isso apagará o perfil "${perfil.nome.toUpperCase()}" permanentemente. Essa ação pode quebrar o acesso de usuários vinculados a ele.`,
      confirmText: "Sim, deletar perfil",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deletePerfil.mutateAsync(perfil.id);
          toast.success("Perfil deletado com sucesso!");
          safeCloseDialog(closeConfirmationDialog);
        } catch (error: unknown) {
          const err = error as { response?: { data?: { error?: string } } };
          toast.error("Erro ao deletar perfil", {
            description: err.response?.data?.error || "Perfil pode estar em uso.",
          });
        }
      },
    });
  };

  const filteredPerfis = useMemo(() => {
    if (!searchTerm) return perfis;
    const term = searchTerm.toLowerCase();
    return perfis.filter(
      (p) =>
        p.nome.toLowerCase().includes(term) ||
        (p.descricao && p.descricao.toLowerCase().includes(term))
    );
  }, [perfis, searchTerm]);

  const isActionLoading = deletePerfil.isPending;

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="space-y-6 w-full animate-in fade-in duration-300 pb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Perfis de Acesso
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Gerencie os perfis de acesso e permissões de usuários no sistema
                </p>
              </div>
            </div>

            <Can I={PERMISSIONS.PERFIS.CRIAR}>
              <Button
                onClick={handleCreate}
                className="h-11 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-4 gap-2 shadow-xs transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Novo Perfil</span>
              </Button>
            </Can>
          </div>

          <PerfisToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            hasActiveFilters={hasActiveFilters}
            onClear={clearFilters}
          />

          {isInitialLoading ? (
            <ListSkeleton />
          ) : filteredPerfis.length > 0 ? (
            <PerfilList
              perfis={filteredPerfis}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isFetching={isFetching}
            />
          ) : (
            <UnifiedEmptyState
              icon={ShieldCheck}
              title="Nenhum perfil encontrado"
              description={
                searchTerm
                  ? "Não encontramos nenhum perfil com os filtros atuais."
                  : "Cadastre seu primeiro perfil de acesso para começar."
              }
              action={!searchTerm ? { label: "Cadastrar Perfil", onClick: handleCreate } : undefined}
            />
          )}
        </div>
      </PullToRefreshWrapper>

      <LoadingOverlay active={isActionLoading} text="Processando..." />
    </>
  );
}
