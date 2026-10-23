import { AlertCircle } from "lucide-react";
import { formatCurrency } from "@/utils/formatters/currency";
import { formatDateToBR } from "@/utils/formatters/date";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FaturaStatusBadge } from "./FaturaStatusBadge";
import { FaturaRowActions } from "./FaturaRowActions";
import {
  getFaturaAtrasoInfo,
  getFaturaPagamentoInfo,
  getFaturaPeriodoTexto,
} from "./faturaTableUtils";
import type { FaturaCliente } from "@/types/database";

interface FaturaTableRowProps {
  fatura: FaturaCliente;
  onLiquidar: (fatura: FaturaCliente) => void;
  onEdit: (fatura: FaturaCliente) => void;
  onDelete: (fatura: FaturaCliente) => void;
  canEdit?: boolean;
}

export function FaturaTableRow({
  fatura,
  onLiquidar,
  onEdit,
  onDelete,
  canEdit = true,
}: FaturaTableRowProps) {
  const { isVencido, diasAtraso } = getFaturaAtrasoInfo(
    fatura.data_vencimento,
    fatura.status,
  );
  const periodoTexto = getFaturaPeriodoTexto(
    fatura.tipo_periodo,
    fatura.numero_periodo,
    fatura.quinzena,
  );
  const { temPagamento, quantidadeBaixas, ultimaData, recebimentos } =
    getFaturaPagamentoInfo(fatura.recebimentos);

  return (
    <tr className="hover:bg-muted/40 transition-colors">
      <td className="py-3.5 px-4 whitespace-nowrap">
        {fatura.numero_os ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] bg-muted/60 text-muted-foreground font-mono text-[11px] font-medium">
            #{fatura.numero_os}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/40 font-normal">-</span>
        )}
      </td>
      <td className="py-3.5 px-4">
        <span className="font-bold text-sm text-foreground block truncate">
          {fatura.cliente?.nome_fantasia || `Cliente #${fatura.cliente_id}`}
        </span>
      </td>
      <td className="py-3.5 px-4 text-xs font-medium text-foreground/80 whitespace-nowrap">
        {fatura.empresa?.nome_fantasia || "Empresa"}
      </td>
      <td className="py-3.5 px-4 text-xs font-medium text-muted-foreground whitespace-nowrap">
        {periodoTexto}
      </td>
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
            {formatDateToBR(fatura.data_vencimento)}
          </span>
          {isVencido && diasAtraso > 0 && (
            <span className="text-[10px] text-destructive font-medium block">
              {diasAtraso} {diasAtraso === 1 ? "dia" : "dias"} de atraso
            </span>
          )}
        </div>
      </td>
      <td className="py-3.5 px-4 text-right font-semibold text-foreground text-xs sm:text-sm tabular-nums whitespace-nowrap">
        {formatCurrency(fatura.valor_faturado)}
      </td>
      <td
        className={cn(
          "py-3.5 px-4 text-right text-xs sm:text-sm tabular-nums whitespace-nowrap",
          (fatura.valor_pago || 0) > 0
            ? "font-semibold text-emerald-600 dark:text-emerald-400"
            : "font-normal text-muted-foreground/50",
        )}
      >
        {formatCurrency(fatura.valor_pago || 0)}
      </td>
      <td className="py-3.5 px-4 text-center whitespace-nowrap">
        {!temPagamento ? (
          <span className="text-xs text-muted-foreground/40 font-normal">-</span>
        ) : quantidadeBaixas === 1 ? (
          <span className="text-foreground font-medium text-xs tabular-nums">
            {formatDateToBR(ultimaData!)}
          </span>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[14px] bg-muted/60 hover:bg-muted text-foreground text-xs font-medium cursor-pointer transition-colors border border-border/50"
              >
                <span className="tabular-nums">{formatDateToBR(ultimaData!)}</span>
                <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                  +{quantidadeBaixas - 1}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="p-3 max-w-xs space-y-2">
              <div className="font-semibold text-xs border-b border-border/40 pb-1">
                Histórico de Recebimentos ({quantidadeBaixas})
              </div>
              <div className="space-y-1.5 text-[11px]">
                {recebimentos.map((r, idx) => (
                  <div
                    key={r.id || idx}
                    className="flex justify-between items-center gap-4"
                  >
                    <span className="text-muted-foreground">
                      {formatDateToBR(r.data_recebimento)}
                    </span>
                    <span className="font-semibold tabular-nums text-foreground">
                      {formatCurrency(r.valor_alocado)}
                    </span>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </td>
      <td className="py-3.5 px-4 text-center whitespace-nowrap">
        <div className="flex flex-col items-center gap-1">
          <FaturaStatusBadge
            status={fatura.status}
            isPrevisao={fatura.is_previsao}
          />
        </div>
      </td>
      <td className="py-3.5 px-4 text-center whitespace-nowrap">
        <FaturaRowActions
          fatura={fatura}
          onLiquidar={onLiquidar}
          onEdit={onEdit}
          onDelete={onDelete}
          canEdit={canEdit}
        />
      </td>
    </tr>
  );
}
