import { Banknote, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATUS_DESPESA } from "@/constants/financeiro.constants";
import type { DespesaOperacional } from "@/types/database";

interface DespesaRowActionsProps {
  despesa: DespesaOperacional;
  onLiquidar: (despesa: DespesaOperacional) => void;
  onEdit: (despesa: DespesaOperacional) => void;
  onDelete: (despesa: DespesaOperacional) => void;
}

export function DespesaRowActions({
  despesa,
  onLiquidar,
  onEdit,
  onDelete,
}: DespesaRowActionsProps) {
  const podePagar =
    despesa.status !== STATUS_DESPESA.PAGO &&
    despesa.status !== STATUS_DESPESA.CANCELADO;

  return (
    <div className="flex items-center justify-center gap-1.5">
      {podePagar && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 rounded-[18px] px-3 text-xs font-medium border-border hover:bg-muted text-foreground gap-1.5 shadow-2xs"
          onClick={() => onLiquidar(despesa)}
          title="Liquidar / Pagar conta"
        >
          <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Pagar</span>
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-[18px] text-muted-foreground hover:text-foreground"
        onClick={() => onEdit(despesa)}
        title="Editar Despesa"
      >
        <Edit2 className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-[18px] text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(despesa)}
        title="Excluir Despesa"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
