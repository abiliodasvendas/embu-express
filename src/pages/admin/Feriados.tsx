import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { FeriadoList } from "@/components/features/feriado/FeriadoList";
import { FeriadosToolbar } from "@/components/features/feriado/FeriadosToolbar";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { messages } from "@/constants/messages";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { safeCloseDialog, useDeleteFeriado, useFeriados, useLayout, usePermissions } from "@/hooks";
import { useBatchFilters, useFiltersManager, useSearchFilters, useUrlState } from "@/hooks/ui/useFilters";
import { Feriado } from "@/types/database";
import { Calendar, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";

export default function Feriados() {
  const { setPageTitle, openConfirmationDialog, closeConfirmationDialog, openFeriadoFormDialog } = useLayout();
  const { can } = usePermissions();
  const canEdit = can(PERMISSIONS.CONFIGURACAO.EDITAR);

  const currentYearStr = new Date().getFullYear().toString();
  const { searchTerm, setSearchTerm } = useSearchFilters("search");
  const [selectedYear, setSelectedYear] = useUrlState<string>({
    key: "ano",
    defaultValue: currentYearStr,
    syncWithUrl: true,
  });
  const { hasActiveFilters, clearFilters } = useFiltersManager(["search", "ano"]);
  const setFilters = useBatchFilters({ anoParam: "ano", searchParam: "search" });

  const { data: feriados = [], isLoading, isFetching, refetch } = useFeriados(parseInt(selectedYear || currentYearStr));
  const deleteFeriado = useDeleteFeriado();

  const isInitialLoading = isLoading && !feriados.length;

  useEffect(() => {
    setPageTitle("Feriados");
  }, [setPageTitle]);

  const pullToRefreshReload = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleEdit = (feriado: Feriado) => {
    openFeriadoFormDialog({ feriadoToEdit: feriado });
  };

  const handleAdd = () => {
    openFeriadoFormDialog({});
  };

  const handleDelete = (feriado: Feriado) => {
    openConfirmationDialog({
      title: messages.dialogo.remover.titulo,
      description: `Deseja remover o feriado "${feriado.descricao}"? Esta ação não pode ser desfeita.`,
      confirmText: "Sim, remover",
      variant: "destructive",
      onConfirm: async () => {
        await deleteFeriado.mutateAsync(feriado.id);
        safeCloseDialog(closeConfirmationDialog);
      },
    });
  };

  const handleApplyFilters = useCallback((filters: { ano?: string }) => {
    if (filters.ano) {
      setSelectedYear(filters.ano);
    }
    setFilters({ ano: filters.ano });
  }, [setSelectedYear, setFilters]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedYear(currentYearStr);
    clearFilters();
  }, [setSearchTerm, setSelectedYear, currentYearStr, clearFilters]);

  const filteredFeriados = useMemo(() => {
    if (!searchTerm) return feriados;
    const term = searchTerm.toLowerCase();
    return feriados.filter((f) =>
      f.descricao.toLowerCase().includes(term) ||
      new Date(f.data).toLocaleDateString("pt-BR", { timeZone: "UTC" }).includes(term)
    );
  }, [feriados, searchTerm]);

  const isActionLoading = deleteFeriado.isPending;

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="space-y-6 w-full animate-in fade-in duration-300 pb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Feriados
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Gerencie o calendário de feriados e datas comemorativas da operação
                </p>
              </div>
            </div>

            {canEdit && (
              <Button
                onClick={handleAdd}
                className="h-11 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-4 gap-2 shadow-xs transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Novo Feriado</span>
              </Button>
            )}
          </div>

          <FeriadosToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            onApplyFilters={handleApplyFilters}
            hasActiveFilters={hasActiveFilters}
            onClear={handleClearFilters}
          />

          {isInitialLoading ? (
            <ListSkeleton />
          ) : filteredFeriados.length > 0 ? (
            <FeriadoList
              feriados={filteredFeriados}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canEdit={canEdit}
              isFetching={isFetching}
            />
          ) : (
            <UnifiedEmptyState
              icon={Calendar}
              title="Nenhum feriado encontrado"
              description={
                searchTerm
                  ? "Não encontramos nenhum feriado com os filtros atuais."
                  : `Não há feriados cadastrados para o ano de ${selectedYear}.`
              }
              action={!searchTerm && canEdit ? { label: "Cadastrar Feriado", onClick: handleAdd } : undefined}
            />
          )}
        </div>
      </PullToRefreshWrapper>

      <LoadingOverlay active={isActionLoading} text="Processando..." />
    </>
  );
}
