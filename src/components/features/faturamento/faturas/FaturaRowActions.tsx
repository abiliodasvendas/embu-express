import { Banknote, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATUS_FATURA } from "@/constants/financeiro.constants";
import type { FaturaCliente } from "@/types/database";

interface FaturaRowActionsProps {
  fatura: FaturaCliente;
  onLiquidar: (fatura: FaturaCliente) => void;
  onEdit: (fatura: FaturaCliente) => void;
  onDelete: (fatura: FaturaCliente) => void;
  canEdit?: boolean;
}

export function FaturaRowActions({
  fatura,
  onLiquidar,
  onEdit,
  onDelete,
  canEdit = true,
}: FaturaRowActionsProps) {
  if (!canEdit) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const podeReceber =
    fatura.status !== STATUS_FATURA.LIQUIDADA &&
    fatura.status !== STATUS_FATURA.CANCELADA;

  return (
    <div className="flex items-center justify-center gap-1.5">
      {podeReceber && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 rounded-[18px] px-3 text-xs font-medium border-border hover:bg-muted text-foreground gap-1.5 shadow-2xs"
          onClick={() => onLiquidar(fatura)}
          title="Dar baixa / Receber fatura"
        >
          <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Receber</span>
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-[18px] text-muted-foreground hover:text-foreground"
        onClick={() => onEdit(fatura)}
        title="Editar Fatura"
      >
        <Edit2 className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-[18px] text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(fatura)}
        title="Excluir Fatura"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
