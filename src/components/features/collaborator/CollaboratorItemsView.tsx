import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLayout } from "@/contexts/LayoutContext";
import {
  useDesassociarItem,
  useDesassociarTodosItens,
  useItensColaboradorQuery,
} from "@/hooks/api/useItensEquipamentos";
import { ActionItem } from "@/types/actions";
import { ColaboradorItem } from "@/types/database";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { Loader2, Package, Plus, RotateCcw } from "lucide-react";

interface CollaboratorItemsViewProps {
  colaboradorId: string;
}

const ItemMobileCard = ({
  itemAlocado,
  onDevolver,
  isPending,
}: {
  itemAlocado: ColaboradorItem;
  onDevolver: (id: number) => void;
  isPending: boolean;
}) => {
  const actions: ActionItem[] = [
    {
      label: "Devolver Item",
      icon: <RotateCcw className="w-4 h-4" />,
      onClick: () => onDevolver(itemAlocado.id),
      isDestructive: true,
      variant: "destructive",
      disabled: isPending,
    },
  ];

  return (
    <Card className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <CardContent className="p-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 text-slate-400 w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
              <Package className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-800 text-sm truncate">
                {itemAlocado.item?.nome}
              </p>
              <Badge variant="outline" className="text-[10px] border-slate-100 text-slate-400 font-bold uppercase mt-1">
                {itemAlocado.item?.categoria?.nome || "Sem Categoria"}
              </Badge>
            </div>
          </div>
          {itemAlocado.observacao && (
            <div className="bg-slate-50/50 p-2 rounded-lg border border-gray-100/50 mt-2">
              <p className="text-xs text-gray-500 font-semibold leading-relaxed italic">
                "{itemAlocado.observacao}"
              </p>
            </div>
          )}
        </div>
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <ActionsDropdown actions={actions} />
        </div>
      </CardContent>
    </Card>
  );
};

const ItemTableRow = ({
  itemAlocado,
  onDevolver,
  isPending,
}: {
  itemAlocado: ColaboradorItem;
  onDevolver: (id: number) => void;
  isPending: boolean;
}) => {
  const actions: ActionItem[] = [
    {
      label: "Devolver Item",
      icon: <RotateCcw className="w-4 h-4" />,
      onClick: () => onDevolver(itemAlocado.id),
      isDestructive: true,
      variant: "destructive",
      disabled: isPending,
    },
  ];

  return (
    <tr className="hover:bg-gray-50/80 transition-colors group">
      <td className="py-4 pl-6 align-middle">
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0">
            <Package className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm leading-tight">
              {itemAlocado.item?.nome}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 align-middle">
        <Badge variant="outline" className="text-xs border-slate-100 text-slate-400 font-bold uppercase shadow-none">
          {itemAlocado.item?.categoria?.nome || "Sem Categoria"}
        </Badge>
      </td>
      <td className="px-6 py-4 align-middle">
        {itemAlocado.observacao ? (
          <p className="text-xs text-gray-500 font-semibold italic truncate max-w-[250px]">
            "{itemAlocado.observacao}"
          </p>
        ) : (
          <span className="text-xs text-gray-300">-</span>
        )}
      </td>
      <td className="px-6 py-4 text-right align-middle" onClick={(e) => e.stopPropagation()}>
        <ActionsDropdown actions={actions} />
      </td>
    </tr>
  );
};

export function CollaboratorItemsView({ colaboradorId }: CollaboratorItemsViewProps) {
  const { data: itensAlocados = [], isLoading, refetch } = useItensColaboradorQuery(colaboradorId);
  const devolverMutation = useDesassociarItem();
  const devolverTodosMutation = useDesassociarTodosItens();
  const { openAlocarEquipamentoDialog, openConfirmationDialog, closeConfirmationDialog } = useLayout();

  const handleDevolver = (alocacaoId: number) => {
    openConfirmationDialog({
      title: "Devolver Equipamento",
      description: "Tem certeza que deseja registrar a devolução deste equipamento?",
      confirmText: "Sim, devolver",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await devolverMutation.mutateAsync(alocacaoId);
        } catch {
          // Erro tratado pela mutation
        } finally {
          safeCloseDialog(closeConfirmationDialog);
        }
      },
    });
  };

  const handleDevolverTodos = () => {
    openConfirmationDialog({
      title: "Devolver Todos os Equipamentos",
      description: "Tem certeza que deseja registrar a devolução de todos os equipamentos sob a responsabilidade deste colaborador?",
      confirmText: "Sim, devolver todos",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await devolverTodosMutation.mutateAsync(colaboradorId);
        } catch {
          // Erro tratado pela mutation
        } finally {
          safeCloseDialog(closeConfirmationDialog);
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-slate-400 font-medium">Buscando itens do colaborador...</p>
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-sm rounded-3xl min-h-[500px] flex flex-col pt-4 bg-white">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-50 pb-6 pt-8 px-8 gap-4">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="block">Itens Alocados</span>
              <span className="text-xs text-muted-foreground font-medium mt-0.5">
                Equipamentos e materiais sob a responsabilidade do colaborador.
              </span>
            </div>
          </CardTitle>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {itensAlocados.length > 0 && (
            <Button
              variant="outline"
              onClick={handleDevolverTodos}
              disabled={devolverTodosMutation.isPending}
              className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50/50 hover:text-rose-700 flex items-center gap-1.5 font-semibold text-xs h-9 select-none"
            >
              {devolverTodosMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              <span>Devolver Todos</span>
            </Button>
          )}
          <Button
            onClick={() => openAlocarEquipamentoDialog({ colaboradorId, onSuccess: refetch })}
            className="rounded-xl flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold h-9 shadow-sm select-none"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Alocar Item</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-8 flex-1">
        {itensAlocados.length > 0 ? (
          <ResponsiveDataList
            data={itensAlocados}
            mobileContainerClassName="space-y-3"
            mobileItemRenderer={(itemAlocado) => (
              <ItemMobileCard
                key={itemAlocado.id}
                itemAlocado={itemAlocado}
                onDevolver={handleDevolver}
                isPending={devolverMutation.isPending}
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
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Observação
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider w-[100px]">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {itensAlocados.map((itemAlocado) => (
                    <ItemTableRow
                      key={itemAlocado.id}
                      itemAlocado={itemAlocado}
                      onDevolver={handleDevolver}
                      isPending={devolverMutation.isPending}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </ResponsiveDataList>
        ) : (
          <UnifiedEmptyState
            icon={Package}
            title="Nenhum item alocado"
            description="Este colaborador não possui nenhum item alocado no momento."
          />
        )}
      </CardContent>
    </Card>
  );
}
