import { AlertCircle, Banknote, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/formatters/currency";
import { formatDateToBR } from "@/utils/formatters/date";
import { STATUS_FATURA } from "@/constants/financeiro.constants";
import { cn } from "@/lib/utils";
import { FaturaStatusBadge } from "./FaturaStatusBadge";
import {
  getFaturaAtrasoInfo,
  getFaturaPagamentoInfo,
  getFaturaPeriodoTexto,
} from "./faturaTableUtils";
import type { FaturaCliente } from "@/types/database";

interface FaturaMobileCardProps {
  fatura: FaturaCliente;
  onLiquidar: (fatura: FaturaCliente) => void;
  onEdit: (fatura: FaturaCliente) => void;
  onDelete: (fatura: FaturaCliente) => void;
}

export function FaturaMobileCard({
  fatura,
  onLiquidar,
  onEdit,
  onDelete,
}: FaturaMobileCardProps) {
  const { isVencido, diasAtraso } = getFaturaAtrasoInfo(
    fatura.data_vencimento,
    fatura.status,
  );
  const periodoTexto = getFaturaPeriodoTexto(
    fatura.tipo_periodo,
    fatura.numero_periodo,
    fatura.quinzena,
  );
  const { temPagamento, quantidadeBaixas, ultimaData } = getFaturaPagamentoInfo(
    fatura.recebimentos,
  );
  const podeReceber =
    fatura.status !== STATUS_FATURA.LIQUIDADA &&
    fatura.status !== STATUS_FATURA.CANCELADA;

  return (
    <div className="bg-card rounded-[24px] border border-border p-4 shadow-xs space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-sm text-foreground truncate">
              {fatura.cliente?.nome_fantasia || `Cliente #${fatura.cliente_id}`}
            </h4>
            {fatura.numero_os && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-[6px] bg-muted/60 text-muted-foreground font-mono text-[10px] font-medium">
                #{fatura.numero_os}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">
              {fatura.empresa?.nome_fantasia || "Empresa"}
            </span>
            <span>•</span>
            <span>{periodoTexto}</span>
          </div>
        </div>
        <div className="shrink-0">
          <FaturaStatusBadge
            status={fatura.status}
            isPrevisao={fatura.is_previsao}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border text-xs">
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
            {formatDateToBR(fatura.data_vencimento)}
          </span>
          {isVencido && diasAtraso > 0 && (
            <span className="text-[10px] text-destructive block">
              {diasAtraso}d atraso
            </span>
          )}
        </div>
        <div className="text-right sm:text-left">
          <span className="text-[11px] text-muted-foreground block">Valor Total</span>
          <span className="font-semibold text-foreground text-xs tabular-nums">
            {formatCurrency(fatura.valor_faturado)}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-muted-foreground block">Valor Pago</span>
          <span
            className={cn(
              "text-xs tabular-nums",
              (fatura.valor_pago || 0) > 0
                ? "font-semibold text-emerald-600 dark:text-emerald-400"
                : "font-normal text-muted-foreground/50",
            )}
          >
            {formatCurrency(fatura.valor_pago || 0)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-muted-foreground block">Data Pagto</span>
          <span className="text-xs tabular-nums font-medium text-foreground">
            {temPagamento && ultimaData ? (
              <span>
                {formatDateToBR(ultimaData)}
                {quantidadeBaixas > 1 && (
                  <span className="ml-1 text-[10px] font-semibold text-primary">
                    (+{quantidadeBaixas - 1})
                  </span>
                )}
              </span>
            ) : (
              <span className="text-muted-foreground/40">-</span>
            )}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
        <div>
          {podeReceber && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-[18px] px-3 text-xs font-medium border-border hover:bg-muted text-foreground gap-1.5 shadow-2xs"
              onClick={() => onLiquidar(fatura)}
            >
              <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Receber</span>
            </Button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-[18px] text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(fatura)}
            title="Editar Fatura"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-[18px] text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(fatura)}
            title="Excluir Fatura"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
