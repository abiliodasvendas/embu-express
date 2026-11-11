import { Banknote, Edit2, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATUS_DESPESA } from "@/constants/financeiro.constants";
import { isPrevisaoFixa } from "./despesaTableUtils";
import type { DespesaOperacional } from "@/types/database";

interface DespesaRowActionsProps {
  despesa: DespesaOperacional;
  onLiquidar: (despesa: DespesaOperacional) => void;
  onDesfazerPagamento?: (despesa: DespesaOperacional) => void;
  onEdit: (despesa: DespesaOperacional) => void;
  onDelete: (despesa: DespesaOperacional) => void;
  canEdit?: boolean;
}

export function DespesaRowActions({
  despesa,
  onLiquidar,
  onDesfazerPagamento,
  onEdit,
  onDelete,
  canEdit = true,
}: DespesaRowActionsProps) {
  if (!canEdit) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const podePagar =
    despesa.status !== STATUS_DESPESA.PAGO &&
    despesa.status !== STATUS_DESPESA.CANCELADO;

  const podeDesfazerPagamento =
    !isPrevisaoFixa(despesa.id) &&
    (despesa.status === STATUS_DESPESA.PAGO || (despesa.valor_pago || 0) > 0);

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
      {podeDesfazerPagamento && onDesfazerPagamento && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-[18px] text-muted-foreground hover:text-destructive"
          onClick={() => onDesfazerPagamento(despesa)}
          title="Desfazer Pagamento (Estornar)"
        >
          <RotateCcw className="h-3.5 w-3.5" />
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
