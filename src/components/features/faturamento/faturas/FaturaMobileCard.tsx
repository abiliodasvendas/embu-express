import { AlertCircle, Banknote, Edit2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onLiquidar: (fatura: FaturaCliente) => void;
  onEdit: (fatura: FaturaCliente) => void;
  onDelete: (fatura: FaturaCliente) => void;
  canEdit?: boolean;
}

export function FaturaMobileCard({
  fatura,
  isSelected = false,
  onToggleSelect,
  onLiquidar,
  onEdit,
  onDelete,
  canEdit = true,
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

  const podeCancelar = fatura.status !== STATUS_FATURA.CANCELADA;

  return (
    <div
      className={cn(
        "bg-card rounded-[24px] border border-border p-4 shadow-xs space-y-3 transition-colors",
        isSelected && "border-primary/50 bg-primary/[0.03] dark:bg-primary/[0.06]"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect?.(fatura.id)}
            aria-label={`Selecionar fatura ${fatura.id}`}
          />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-sm text-foreground">
              {fatura.cliente?.nome_fantasia || `Cliente #${fatura.cliente_id}`}
            </h4>
            {fatura.unidade?.nome_unidade && (
              <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-[8px]">
                {fatura.unidade.nome_unidade}
              </span>
            )}
            {fatura.numero_os && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-[6px] bg-muted/60 text-muted-foreground font-mono text-[10px] font-medium">
                #{fatura.numero_os}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {fatura.empresa?.nome_fantasia || "Empresa"} • {periodoTexto}
          </p>
        </div>
        <FaturaStatusBadge
          status={fatura.status}
          isPrevisao={fatura.is_previsao}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs border-y border-border/60 py-2.5">
        <div>
          <span className="text-[11px] text-muted-foreground block">Vencimento</span>
          <span
            className={
              isVencido
                ? "font-semibold text-destructive flex items-center gap-1"
                : "font-medium text-foreground"
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
        <div className="text-right">
          <span className="text-[11px] text-muted-foreground block">Valor Faturado</span>
          <span className="font-bold text-sm text-foreground tabular-nums">
            {formatCurrency(fatura.valor_faturado)}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-muted-foreground block">Valor Pago</span>
          <span
            className={
              (fatura.valor_pago || 0) > 0
                ? "font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums"
                : "text-muted-foreground/50"
            }
          >
            {formatCurrency(fatura.valor_pago || 0)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-muted-foreground block">Último Pagto</span>
          <span className="font-medium text-foreground tabular-nums">
            {temPagamento ? (
              <>
                {formatDateToBR(ultimaData!)}
                {quantidadeBaixas > 1 && (
                  <span className="text-[10px] text-primary ml-1 font-semibold">
                    ({quantidadeBaixas}x)
                  </span>
                )}
              </>
            ) : (
              "-"
            )}
          </span>
        </div>
      </div>

      {canEdit && (
        <div className="flex items-center justify-between pt-1">
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
            {podeCancelar && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-[18px] text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(fatura)}
                title="Cancelar Fatura"
              >
                <Ban className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
