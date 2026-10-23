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
    <Card className="bg-card border border-border rounded-[18px] overflow-hidden shadow-xs">
      <CardContent className="p-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-muted text-muted-foreground w-9 h-9 rounded-[14px] flex items-center justify-center shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-foreground text-sm truncate">
                {itemAlocado.item?.nome}
              </p>
              <Badge variant="outline" className="text-[10px] border-border text-muted-foreground font-semibold uppercase mt-1">
                {itemAlocado.item?.categoria?.nome || "Sem Categoria"}
              </Badge>
            </div>
          </div>
          {itemAlocado.observacao && (
            <div className="bg-muted/40 p-2.5 rounded-[12px] border border-border mt-2">
              <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">
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
    <tr className="hover:bg-muted/40 transition-colors group">
      <td className="py-4 pl-6 align-middle">
        <div className="flex items-center gap-3">
          <div className="bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground w-9 h-9 rounded-[14px] flex items-center justify-center transition-colors shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-foreground text-sm leading-tight">
              {itemAlocado.item?.nome}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 align-middle">
        <Badge variant="outline" className="text-xs border-border text-muted-foreground font-semibold uppercase shadow-none">
          {itemAlocado.item?.categoria?.nome || "Sem Categoria"}
        </Badge>
      </td>
      <td className="px-6 py-4 align-middle">
        {itemAlocado.observacao ? (
          <p className="text-xs text-muted-foreground font-medium italic truncate max-w-[250px]">
            "{itemAlocado.observacao}"
          </p>
        ) : (
          <span className="text-xs text-muted-foreground/40">-</span>
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
        } finally {
          safeCloseDialog(closeConfirmationDialog);
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2 bg-card rounded-[24px] border border-border shadow-xs">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground font-medium">Buscando itens do colaborador...</p>
      </div>
    );
  }

  return (
    <Card className="border border-border shadow-xs rounded-[24px] min-h-[500px] flex flex-col pt-4 bg-card">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-6 pt-8 px-8 gap-4">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <div className="h-10 w-10 rounded-[14px] bg-primary/10 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="block text-foreground font-bold">Itens Alocados</span>
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
              className="rounded-[14px] border-destructive/20 text-destructive hover:bg-destructive/10 flex items-center gap-1.5 font-semibold h-10 px-3.5 select-none"
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
            className="rounded-[14px] flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold h-10 px-4 shadow-xs select-none"
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
            <div className="rounded-[18px] border border-border overflow-hidden bg-card shadow-xs">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="border-b border-border text-left">
                    <th className="py-4 pl-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-[180px]">
                      Categoria
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Observação
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider w-[100px]">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
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
