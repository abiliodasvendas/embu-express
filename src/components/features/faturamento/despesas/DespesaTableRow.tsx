import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatters/currency";
import { formatDateToBR } from "@/utils/formatters/date";
import { CATEGORIA_DESPESA_LABELS } from "@/constants/financeiro.constants";
import { cn } from "@/lib/utils";
import { DespesaStatusBadge } from "./DespesaStatusBadge";
import { DespesaRowActions } from "./DespesaRowActions";
import {
  getDespesaAtrasoInfo,
  getDespesaTipoTexto,
  isPrevisaoFixa,
} from "./despesaTableUtils";
import type { DespesaOperacional } from "@/types/database";

interface DespesaTableRowProps {
  despesa: DespesaOperacional;
  onLiquidar: (despesa: DespesaOperacional) => void;
  onEdit: (despesa: DespesaOperacional) => void;
  onDelete: (despesa: DespesaOperacional) => void;
  canEdit?: boolean;
}

export function DespesaTableRow({
  despesa,
  onLiquidar,
  onEdit,
  onDelete,
  canEdit = true,
}: DespesaTableRowProps) {
  const { isVencido, diasAtraso } = getDespesaAtrasoInfo(
    despesa.data_vencimento,
    despesa.status,
  );
  const isPrevisaoRecorrente = isPrevisaoFixa(despesa.id);
  const tipoTexto = getDespesaTipoTexto(
    despesa.is_recorrente,
    despesa.total_parcelas,
    despesa.numero_parcela,
  );

  return (
    <tr className="hover:bg-muted/40 transition-colors">
      <td className="py-3.5 px-4 whitespace-nowrap">
        <div className="space-y-0.5">
          <span
            className={
              isVencido
                ? "font-semibold text-destructive flex items-center gap-1 text-xs"
                : "text-foreground font-medium text-xs"
            }
          >
            {isVencido && <AlertCircle className="h-3 w-3 shrink-0" />}
            {formatDateToBR(despesa.data_vencimento)}
          </span>
          {isVencido && diasAtraso > 0 && (
            <span className="text-[10px] text-destructive font-medium block">
              {diasAtraso} {diasAtraso === 1 ? "dia" : "dias"} de atraso
            </span>
          )}
        </div>
      </td>
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-sm text-foreground">
            {despesa.descricao}
          </span>
          {isPrevisaoRecorrente && (
            <Badge
              variant="outline"
              className="text-[10px] bg-muted/50 text-muted-foreground border-border px-2 py-0.5 font-medium rounded-[18px]"
            >
              Previsão Fixa
            </Badge>
          )}
        </div>
      </td>
      <td className="py-3.5 px-4 text-xs font-medium text-foreground/80 whitespace-nowrap">
        {despesa.is_holding
          ? "Holding (Rateio)"
          : despesa.empresa?.nome_fantasia || "Empresa"}
      </td>
      <td className="py-3.5 px-4 text-xs font-medium text-muted-foreground whitespace-nowrap">
        {CATEGORIA_DESPESA_LABELS[despesa.categoria] || despesa.categoria}
      </td>
      <td className="py-3.5 px-4 text-xs font-medium text-muted-foreground whitespace-nowrap">
        <span>{tipoTexto}</span>
      </td>
      <td className="py-3.5 px-4 text-right font-semibold text-rose-600 dark:text-rose-400 text-xs sm:text-sm tabular-nums whitespace-nowrap">
        - {formatCurrency(despesa.valor_previsto)}
      </td>
      <td
        className={cn(
          "py-3.5 px-4 text-right text-xs sm:text-sm tabular-nums whitespace-nowrap",
          (despesa.valor_pago || 0) > 0
            ? "font-semibold text-emerald-600 dark:text-emerald-400"
            : "font-normal text-muted-foreground/50",
        )}
      >
        {formatCurrency(despesa.valor_pago || 0)}
      </td>
      <td className="py-3.5 px-4 text-center whitespace-nowrap">
        {despesa.data_pagamento ? (
          <span className="text-foreground font-medium text-xs tabular-nums">
            {formatDateToBR(despesa.data_pagamento)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/40 font-normal">-</span>
        )}
      </td>
      <td className="py-3.5 px-4 text-center whitespace-nowrap">
        <DespesaStatusBadge status={despesa.status} />
      </td>
      <td className="py-3.5 px-4 text-center whitespace-nowrap">
        <DespesaRowActions
          despesa={despesa}
          onLiquidar={onLiquidar}
          onEdit={onEdit}
          onDelete={onDelete}
          canEdit={canEdit}
        />
      </td>
    </tr>
  );
}
