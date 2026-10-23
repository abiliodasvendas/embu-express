import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { Trash2, Loader2 } from "lucide-react";
import { LancamentoConvenio } from "@/types/database";

interface PortalDeleteDialogProps {
  deleteTarget: LancamentoConvenio | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  formatCurrency: (val: number) => string;
}

export function PortalDeleteDialog({
  deleteTarget,
  onClose,
  onConfirm,
  isDeleting,
  formatCurrency,
}: PortalDeleteDialogProps) {
  return (
    <BaseDialog
      open={!!deleteTarget}
      onOpenChange={(val) => !val && safeCloseDialog(onClose)}
      maxWidth="sm"
    >
      <BaseDialog.Header
        icon={<Trash2 className="h-5 w-5 text-destructive" />}
        title="Excluir Lançamento"
        subtitle="Confirmação de exclusão permanente"
        onClose={() => safeCloseDialog(onClose)}
      />
      <BaseDialog.Body className="py-4 px-6">
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Deseja realmente excluir este lançamento de manutenção de{" "}
          <strong className="text-foreground">
            {deleteTarget?.moto_embu
              ? "Veículo da Frota"
              : deleteTarget?.colaborador?.nome_completo}
          </strong>{" "}
          no valor de{" "}
          <strong className="text-foreground font-bold">
            {deleteTarget && formatCurrency(Number(deleteTarget.valor))}
          </strong>
          ?
        </p>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <Button
          type="button"
          variant="outline"
          onClick={() => safeCloseDialog(onClose)}
        >
          Cancelar
        </Button>
        <Button
          variant="destructive"
          onClick={onConfirm}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            "Excluir"
          )}
        </Button>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
