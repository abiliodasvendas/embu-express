import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useAlocadosPorItemQuery, useDesassociarItem } from "@/hooks/api/useItensEquipamentos";
import { useLayout } from "@/contexts/LayoutContext";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { Loader2, RotateCcw, Users } from "lucide-react";

interface AlocadosPorItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: number;
  itemName: string;
}

export function AlocadosPorItemDialog({
  open,
  onOpenChange,
  itemId,
  itemName,
}: AlocadosPorItemDialogProps) {
  const { data: alocados = [], isLoading } = useAlocadosPorItemQuery(itemId, open);
  const devolverMutation = useDesassociarItem();
  const { openConfirmationDialog, closeConfirmationDialog } = useLayout();

  const handleDevolver = (alocacaoId: number, colaboradorNome?: string) => {
    openConfirmationDialog({
      title: "Devolver Equipamento",
      description: `Tem certeza que deseja registrar a devolução deste equipamento para "${colaboradorNome || "o colaborador"}"?`,
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

  return (
    <BaseDialog
      open={open}
      onOpenChange={(val) => !val && safeCloseDialog(() => onOpenChange(false))}
      maxWidth="md"
    >
      <BaseDialog.Header
        icon={<Users className="h-5 w-5" />}
        title="Colaboradores Alocados"
        subtitle={`Item: ${itemName}`}
        onClose={() => safeCloseDialog(() => onOpenChange(false))}
      />

      <BaseDialog.Body className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground font-medium">Buscando alocações...</p>
          </div>
        ) : alocados.length > 0 ? (
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {alocados.map((aloc) => (
              <div
                key={aloc.id}
                className="bg-card rounded-2xl border border-border p-4 flex flex-col gap-2.5 shadow-xs"
              >
                <div className="flex items-center justify-between gap-3 min-w-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-xl bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold text-xs shrink-0">
                      {aloc.colaborador?.nome_completo?.charAt(0) || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-foreground text-sm truncate">
                        {aloc.colaborador?.nome_completo}
                      </h4>
                      <div className="mt-1">
                        <StatusBadge status={aloc.colaborador?.status} />
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <ActionsDropdown
                      actions={[
                        {
                          label: "Devolver Item",
                          icon: <RotateCcw className="h-4 w-4" />,
                          onClick: () => handleDevolver(aloc.id, aloc.colaborador?.nome_completo),
                          isDestructive: true,
                          disabled: devolverMutation.isPending,
                        },
                      ]}
                      title={aloc.colaborador?.nome_completo}
                      description={`Devolução de item: ${itemName}`}
                    />
                  </div>
                </div>

                {aloc.observacao && (
                  <div className="bg-surface-alt p-2.5 rounded-xl border border-border text-xs text-muted-foreground italic leading-relaxed">
                    "{aloc.observacao}"
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <UnifiedEmptyState
            icon={Users}
            title="Nenhuma alocação ativa"
            description="Nenhum colaborador possui este item alocado atualmente."
          />
        )}
      </BaseDialog.Body>
    </BaseDialog>
  );
}
