import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAlocadosPorItemQuery, useDesassociarItem } from "@/hooks/api/useItensEquipamentos";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { Users, Loader2, X, RotateCcw } from "lucide-react";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { StatusUsuario } from "@/types/enums";
import { cn } from "@/lib/utils";
import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { useLayout } from "@/hooks";

const getAvatarStyles = (status?: string) => {
  switch (status) {
    case StatusUsuario.ATIVO:
      return "bg-green-100 text-green-700";
    case StatusUsuario.PENDENTE:
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-500";
  }
};

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
          // Erro é tratado pelo React Mutation
        } finally {
          safeCloseDialog(closeConfirmationDialog);
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && safeCloseDialog(() => onOpenChange(false))}>
      <DialogContent
        onPointerDownOutside={(e) => {
          if (document.querySelector('[role="alertdialog"]')) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (document.querySelector('[role="alertdialog"]')) {
            e.preventDefault();
          }
        }}
        className="w-full max-w-md p-0 gap-0 h-[100dvh] sm:h-auto sm:max-h-[85vh] bg-white flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        <div className="bg-blue-600 p-4 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Fechar</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
            <Users className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Colaboradores Alocados
          </DialogTitle>
          <p className="text-xs text-white/80 font-medium mt-1 truncate max-w-[80%] mx-auto">
            Item: {itemName}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 bg-white">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-slate-400 font-medium">Buscando alocações...</p>
            </div>
          ) : alocados.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {alocados.map((aloc) => (
                <div
                  key={aloc.id}
                  className="bg-gray-50/50 rounded-xl border border-gray-100 p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-3 min-w-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                          getAvatarStyles(aloc.colaborador?.status)
                        )}>
                          {aloc.colaborador?.nome_completo?.charAt(0) || "?"}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-gray-900 text-sm truncate">
                          {aloc.colaborador?.nome_completo}
                        </h4>
                        <p className={cn(
                          "text-xs font-bold mt-0.5",
                          aloc.colaborador?.status === StatusUsuario.ATIVO && "text-green-600",
                          aloc.colaborador?.status === StatusUsuario.PENDENTE && "text-yellow-600",
                          aloc.colaborador?.status === StatusUsuario.INATIVO && "text-gray-400"
                        )}>
                          {aloc.colaborador?.status === StatusUsuario.ATIVO && "Colaborador Ativo"}
                          {aloc.colaborador?.status === StatusUsuario.PENDENTE && "Colaborador Pendente"}
                          {aloc.colaborador?.status === StatusUsuario.INATIVO && "Colaborador Inativo"}
                          {!aloc.colaborador?.status && "Status Desconhecido"}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <ActionsDropdown
                        actions={[
                          {
                            label: "Devolver Item",
                            icon: <RotateCcw className="h-4 w-4" />,
                            onClick: () => handleDevolver(aloc.id),
                            isDestructive: true,
                            disabled: devolverMutation.isPending,
                          }
                        ]}
                      />
                    </div>
                  </div>

                  {aloc.observacao && (
                    <div className="mt-1 bg-white p-2 rounded-lg border border-gray-100/80">
                      <p className="text-xs text-gray-500 font-semibold leading-relaxed italic">
                        "{aloc.observacao}"
                      </p>
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
        </div>

        <div className="p-4 border-t border-gray-100 bg-white shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full h-11 rounded-xl border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
