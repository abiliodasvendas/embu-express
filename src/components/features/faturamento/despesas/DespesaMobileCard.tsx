import { AlertCircle, Banknote, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/formatters/currency";
import { formatDateToBR } from "@/utils/formatters/date";
import { CATEGORIA_DESPESA_LABELS, STATUS_DESPESA } from "@/constants/financeiro.constants";
import { cn } from "@/lib/utils";
import { DespesaStatusBadge } from "./DespesaStatusBadge";
import { getDespesaAtrasoInfo, isPrevisaoFixa } from "./despesaTableUtils";
import type { DespesaOperacional } from "@/types/database";

interface DespesaMobileCardProps {
  despesa: DespesaOperacional;
  onLiquidar: (despesa: DespesaOperacional) => void;
  onEdit: (despesa: DespesaOperacional) => void;
  onDelete: (despesa: DespesaOperacional) => void;
}

export function DespesaMobileCard({
  despesa,
  onLiquidar,
  onEdit,
  onDelete,
}: DespesaMobileCardProps) {
  const { isVencido, diasAtraso } = getDespesaAtrasoInfo(
    despesa.data_vencimento,
    despesa.status,
  );
  const isPrevisaoRecorrente = isPrevisaoFixa(despesa.id);
  const podePagar =
    despesa.status !== STATUS_DESPESA.PAGO &&
    despesa.status !== STATUS_DESPESA.CANCELADO;

  return (
    <div className="bg-card rounded-[24px] border border-border p-4 shadow-xs space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-sm text-foreground truncate">
              {despesa.descricao}
            </h4>
            {isPrevisaoRecorrente && (
              <Badge
                variant="outline"
                className="text-[10px] bg-muted/50 text-muted-foreground border-border px-2 py-0.5 font-medium rounded-[18px]"
              >
                Previsão Fixa
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">
              {despesa.is_holding
                ? "Holding (Rateio)"
                : despesa.empresa?.nome_fantasia || "Empresa"}
            </span>
            <span>•</span>
            <span>{CATEGORIA_DESPESA_LABELS[despesa.categoria] || despesa.categoria}</span>
          </div>
        </div>
        <div className="shrink-0">
          <DespesaStatusBadge status={despesa.status} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-xs">
        <div>
          <span className="text-[11px] text-muted-foreground block">Vencimento</span>
          <span
            className={
              isVencido
                ? "font-semibold text-destructive flex items-center gap-1 text-xs"
                : "font-medium text-foreground text-xs"
            }
          >
            {isVencido && <AlertCircle className="h-3 w-3 shrink-0" />}
            {formatDateToBR(despesa.data_vencimento)}
          </span>
          {isVencido && diasAtraso > 0 && (
            <span className="text-[10px] text-destructive block">
              {diasAtraso}d atraso
            </span>
          )}
        </div>
        <div className="text-right">
          <span className="text-[11px] text-muted-foreground block">Previsto</span>
          <span className="font-semibold text-rose-600 dark:text-rose-400 text-xs tabular-nums">
            - {formatCurrency(despesa.valor_previsto)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-muted-foreground block">Pago</span>
          <span
            className={cn(
              "text-xs tabular-nums",
              (despesa.valor_pago || 0) > 0
                ? "font-semibold text-emerald-600 dark:text-emerald-400"
                : "font-normal text-muted-foreground/50",
            )}
          >
            {formatCurrency(despesa.valor_pago || 0)}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
        <div>
          {podePagar && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-[18px] px-3 text-xs font-medium border-border hover:bg-muted text-foreground gap-1.5 shadow-2xs"
              onClick={() => onLiquidar(despesa)}
            >
              <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Pagar</span>
            </Button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-[18px] text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(despesa)}
            title="Editar Despesa"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-[18px] text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(despesa)}
            title="Excluir Despesa"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
