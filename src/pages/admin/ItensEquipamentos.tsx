import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { messages } from "@/constants/messages";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { useLayout, usePermissions } from "@/hooks";
import {
  useCategoriasQuery,
  useDeleteItem,
  useItensQuery,
} from "@/hooks/api/useItensEquipamentos";
import { cn } from "@/lib/utils";
import { ActionItem } from "@/types/actions";
import { ItemEquipamento } from "@/types/database";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { Edit2, Package, Plus, Search, Tag, Trash2, Users, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const ItemMobileCard = ({
  item,
  onEdit,
  onDelete,
  onViewAlocados,
  canEdit,
}: {
  item: ItemEquipamento;
  onEdit: (i: ItemEquipamento) => void;
  onDelete: (id: number, name: string) => void;
  onViewAlocados: (id: number, name: string) => void;
  canEdit: boolean;
}) => {
  const actions: ActionItem[] = [
    {
      label: "Ver Alocados",
      icon: <Users className="w-4 h-4" />,
      onClick: () => onViewAlocados(item.id, item.nome),
    },
    {
      label: "Editar",
      icon: <Edit2 className="w-4 h-4" />,
      onClick: () => onEdit(item),
      hidden: !canEdit,
    },
    {
      label: "Excluir",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => onDelete(item.id, item.nome),
      isDestructive: true,
      variant: "destructive",
      hidden: !canEdit,
    },
  ];

  return (
    <div
      onClick={() => onEdit(item)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 active:scale-[0.99] transition-transform"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-sm line-clamp-1 leading-tight">
              {item.nome}
            </span>
            {!item.ativo && (
              <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-500 font-bold shrink-0">
                Inativo
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-[10px] border-slate-100 text-slate-400 font-bold uppercase">
              {item.categoria?.nome || "Sem Categoria"}
            </Badge>
            <span className="text-[10px] text-blue-600 font-bold bg-blue-50/50 px-2 py-0.5 rounded-full">
              {item.total_alocado || 0} alocados
            </span>
          </div>
        </div>
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <ActionsDropdown actions={actions} />
        </div>
      </div>
    </div>
  );
};

const ItemTableRow = ({
  item,
  onEdit,
  onDelete,
  onViewAlocados,
  canEdit,
}: {
  item: ItemEquipamento;
  onEdit: (i: ItemEquipamento) => void;
  onDelete: (id: number, name: string) => void;
  onViewAlocados: (id: number, name: string) => void;
  canEdit: boolean;
}) => {
  const actions: ActionItem[] = [
    {
      label: "Ver Alocados",
      icon: <Users className="w-4 h-4" />,
      onClick: () => onViewAlocados(item.id, item.nome),
    },
    {
      label: "Editar",
      icon: <Edit2 className="w-4 h-4" />,
      onClick: () => onEdit(item),
      hidden: !canEdit,
    },
    {
      label: "Excluir",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => onDelete(item.id, item.nome),
      isDestructive: true,
      variant: "destructive",
      hidden: !canEdit,
    },
  ];

  return (
    <tr
      onClick={() => onEdit(item)}
      className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
    >
      <td className="py-4 pl-6 align-middle">
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 w-9 h-9 rounded-xl flex items-center justify-center transition-colors">
            <Package className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm leading-tight">
              {item.nome}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 align-middle">
        <Badge variant="outline" className="text-xs border-slate-100 text-slate-400 font-bold uppercase shadow-none">
          {item.categoria?.nome || "Sem Categoria"}
        </Badge>
      </td>
      <td className="px-6 py-4 align-middle">
        <span className="text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full">
          {item.total_alocado || 0}
        </span>
      </td>
      <td className="px-6 py-4 text-right align-middle" onClick={(e) => e.stopPropagation()}>
        <ActionsDropdown actions={actions} />
      </td>
    </tr>
  );
};

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

  const [searchTerm, setSearchTerm] = useState("");

  const { data: itens = [], isLoading, refetch } = useItensQuery();
  const { data: categorias = [] } = useCategoriasQuery();
  const deleteItemMutation = useDeleteItem();

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

  const handleViewAlocados = (itemId: number, itemName: string) => {
    openAlocadosPorItemDialog({ itemId, itemName });
  };

  const handleDelete = (id: number, name: string) => {
    openConfirmationDialog({
      title: messages.dialogo.remover.titulo,
      description: `Deseja remover o item "${name}"? Esta ação não pode ser desfeita e só será permitida se não houver alocações ativas.`,
      confirmText: "Sim, remover",
      variant: "destructive",
      onConfirm: async () => {
        await deleteItemMutation.mutateAsync(id);
        safeCloseDialog(closeConfirmationDialog);
      },
    });
  };

  const filteredItens = useMemo(() => {
    return itens.filter((item) => {
      const matchSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [itens, searchTerm]);

  const isActionLoading = deleteItemMutation.isPending;

  return (
    <>
      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <div className="space-y-6">
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="px-0">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-6">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome de item..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white border-gray-100 focus-visible:ring-blue-500/20 h-11 rounded-xl shadow-none font-medium"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full md:w-auto">
                  <Button
                    onClick={handleManageCategorias}
                    variant="outline"
                    className="h-11 rounded-xl border-gray-100 bg-white gap-2 font-bold hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm flex-1 md:flex-initial"
                  >
                    <Tag className="h-4 w-4 text-slate-400" />
                    <span>Categorias</span>
                  </Button>

                  {canEdit && (
                    <>
                      <Button
                        onClick={handleAdd}
                        className="bg-blue-600 hover:bg-blue-700 h-11 rounded-xl gap-2 shadow-sm font-bold text-white transition-all active:scale-95 whitespace-nowrap flex-1 md:flex-initial"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Novo Item</span>
                      </Button>
                      
                      <Button
                        onClick={handleAlocar}
                        className="bg-blue-600 hover:bg-blue-700 h-11 rounded-xl gap-2 shadow-sm font-bold text-white transition-all active:scale-95 whitespace-nowrap flex-1 md:flex-initial"
                      >
                        <Users className="h-4 w-4" />
                        <span>Alocar</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {isLoading ? (
                <ListSkeleton />
              ) : filteredItens.length > 0 ? (
                <ResponsiveDataList
                  data={filteredItens}
                  mobileContainerClassName="space-y-3"
                  mobileItemRenderer={(item: ItemEquipamento) => (
                    <ItemMobileCard
                      key={item.id}
                      item={item}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onViewAlocados={handleViewAlocados}
                      canEdit={canEdit}
                    />
                  )}
                >
                  <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                    <table className="w-full">
                      <thead className="bg-gray-50/50">
                        <tr className="border-b border-gray-100 text-left">
                          <th className="py-4 pl-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Item
                          </th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[180px]">
                            Categoria
                          </th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[120px]">
                            Qtd. Alocada
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider w-[100px]">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredItens.map((item) => (
                          <ItemTableRow
                            key={item.id}
                            item={item}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onViewAlocados={handleViewAlocados}
                            canEdit={canEdit}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ResponsiveDataList>
              ) : (
                <UnifiedEmptyState
                  icon={Package}
                  title="Nenhum item encontrado"
                  description={
                    searchTerm
                      ? "Não encontramos itens para os filtros atuais."
                      : "Cadastre seu primeiro item no catálogo clicando no botão acima."
                  }
                  action={!searchTerm ? { label: "Novo Item", onClick: handleAdd } : undefined}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </PullToRefreshWrapper>

      <LoadingOverlay active={isActionLoading} text="Processando..." />
    </>
  );
}
