import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ItemEquipamentoList } from "@/components/features/item-equipamento/ItemEquipamentoList";
import { ItensEquipamentosToolbar } from "@/components/features/item-equipamento/ItensEquipamentosToolbar";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { messages } from "@/constants/messages";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { safeCloseDialog, useLayout, usePermissions } from "@/hooks";
import {
  useCategoriasQuery,
  useDeleteItem,
  useItensQuery,
} from "@/hooks/api/useItensEquipamentos";
import { useBatchFilters, useFiltersManager, useSearchFilters, useUrlState } from "@/hooks/ui/useFilters";
import { ItemEquipamento } from "@/types/database";
import { Package, Plus, Share2, Tag } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";

export default function ItensEquipamentos() {
  const {
    setPageTitle,
    openConfirmationDialog,
    closeConfirmationDialog,
    openAlocarEquipamentoDialog,
    openItemEquipamentoFormDialog,
    openCategoriasDialog,
    openAlocadosPorItemDialog,
  } = useLayout();

  const { can } = usePermissions();
  const canEdit = can(PERMISSIONS.EQUIPAMENTOS.EDITAR);

  const { searchTerm, setSearchTerm } = useSearchFilters("search");
  const [selectedCategoria, setSelectedCategoria] = useUrlState<string>({
    key: "categoria",
    defaultValue: "todos",
    syncWithUrl: true,
  });
  const { hasActiveFilters, clearFilters } = useFiltersManager(["search", "categoria"]);
  const setFilters = useBatchFilters({ categoriaParam: "categoria", searchParam: "search" });

  const { data: itens = [], isLoading, isFetching, refetch } = useItensQuery();
  const { data: categorias = [] } = useCategoriasQuery();
  const deleteItemMutation = useDeleteItem();

  const isInitialLoading = isLoading && !itens.length;

  useEffect(() => {
    setPageTitle("Itens e Equipamentos");
  }, [setPageTitle]);

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleAdd = () => {
    openItemEquipamentoFormDialog({ itemToEdit: null, onSuccess: refetch });
  };

  const handleEdit = (item: ItemEquipamento) => {
    openItemEquipamentoFormDialog({ itemToEdit: item, onSuccess: refetch });
  };

  const handleManageCategorias = () => {
    openCategoriasDialog({ onSuccess: refetch });
  };

  const handleAlocar = () => {
    openAlocarEquipamentoDialog({ onSuccess: refetch });
  };

  const handleViewAlocados = (item: ItemEquipamento) => {
    openAlocadosPorItemDialog({ itemId: item.id, itemName: item.nome });
  };

  const handleDelete = (item: ItemEquipamento) => {
    openConfirmationDialog({
      title: messages.dialogo.remover.titulo,
      description: `Deseja remover o item "${item.nome}"? Esta ação não pode ser desfeita e só será permitida se não houver alocações ativas.`,
      confirmText: "Sim, remover",
      variant: "destructive",
      onConfirm: async () => {
        await deleteItemMutation.mutateAsync(item.id);
        safeCloseDialog(closeConfirmationDialog);
      },
    });
  };

  const handleApplyFilters = useCallback((filters: { categoria?: string }) => {
    if (filters.categoria !== undefined) {
      setSelectedCategoria(filters.categoria);
    }
    setFilters({ categoria: filters.categoria });
  }, [setSelectedCategoria, setFilters]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategoria("todos");
    clearFilters();
  }, [setSearchTerm, setSelectedCategoria, clearFilters]);

  const filteredItens = useMemo(() => {
    return itens.filter((item) => {
      const matchSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategoria =
        selectedCategoria === "todos" || String(item.categoria_id) === selectedCategoria;
      return matchSearch && matchCategoria;
    });
  }, [itens, searchTerm, selectedCategoria]);

  const isActionLoading = deleteItemMutation.isPending;

  return (
    <>
      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <div className="space-y-6 w-full animate-in fade-in duration-300 pb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Itens e Equipamentos
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Controle do inventário, categorias e alocações de itens operacionais
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleManageCategorias}
                  className="h-11 rounded-[18px] border-border bg-card shadow-xs text-xs font-semibold px-3.5 gap-2 hover:border-primary hover:text-primary transition-all flex-1 sm:flex-initial"
                >
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span>Categorias</span>
                </Button>

                {canEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAlocar}
                    className="h-11 rounded-[18px] border-border bg-card shadow-xs text-xs font-semibold px-3.5 gap-2 hover:border-primary hover:text-primary transition-all flex-1 sm:flex-initial"
                  >
                    <Share2 className="h-4 w-4 text-muted-foreground" />
                    <span>Alocar</span>
                  </Button>
                )}
              </div>

              {canEdit && (
                <Button
                  onClick={handleAdd}
                  className="h-11 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-4 gap-2 shadow-xs transition-all active:scale-95 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>Novo Item</span>
                </Button>
              )}
            </div>
          </div>

          <ItensEquipamentosToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategoria={selectedCategoria}
            onCategoriaChange={setSelectedCategoria}
            onApplyFilters={handleApplyFilters}
            categorias={categorias}
            hasActiveFilters={hasActiveFilters}
            onClear={handleClearFilters}
          />

          {isInitialLoading ? (
            <ListSkeleton />
          ) : filteredItens.length > 0 ? (
            <ItemEquipamentoList
              itens={filteredItens}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewAlocados={handleViewAlocados}
              canEdit={canEdit}
              isFetching={isFetching}
            />
          ) : (
            <UnifiedEmptyState
              icon={Package}
              title="Nenhum item encontrado"
              description={
                searchTerm || selectedCategoria !== "todos"
                  ? "Não encontramos itens para os filtros atuais."
                  : "Cadastre seu primeiro item no catálogo clicando no botão acima."
              }
              action={!searchTerm && selectedCategoria === "todos" && canEdit ? { label: "Novo Item", onClick: handleAdd } : undefined}
            />
          )}
        </div>
      </PullToRefreshWrapper>

      <LoadingOverlay active={isActionLoading} text="Processando..." />
    </>
  );
}
