import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/formatters/currency";
import { formatDateToBR } from "@/utils/formatters/date";
import { ContaPagarItem } from "@/types/database";
import { CheckCircle2, Layers, AlertCircle, Edit2, Trash2, Repeat } from "lucide-react";
import { STATUS_DESPESA, TIPO_CONTA_PAGAR } from "@/constants/financeiro.constants";

interface ContasPagarMobileCardProps {
  item: ContaPagarItem;
  onLiquidar: (item: ContaPagarItem) => void;
  onEdit?: (item: ContaPagarItem) => void;
  onDelete?: (item: ContaPagarItem) => void;
  canEdit?: boolean;
}

export function ContasPagarMobileCard({
  item,
  onLiquidar,
  onEdit,
  onDelete,
  canEdit = true,
}: ContasPagarMobileCardProps) {
  const hoje = new Date().toISOString().split("T")[0];
  const isPago = item.status === STATUS_DESPESA.PAGO;
  const isVencido = !isPago && item.data_vencimento < hoje;
  const isHoje = !isPago && item.data_vencimento === hoje;

  return (
    <div className="bg-card rounded-[24px] border border-border p-4 shadow-xs space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-sm text-foreground truncate">
              {item.descricao}
            </h4>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-[6px] bg-muted/60 text-muted-foreground font-mono text-[10px] font-medium">
              {item.tipo === TIPO_CONTA_PAGAR.CONVENIO ? "CONVÊNIO" : "DESPESA"}
            </span>
            {item.total_parcelas && item.total_parcelas > 1 ? (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-[6px] bg-primary/10 text-primary font-mono text-[10px] font-semibold">
                {item.numero_parcela || 1}/{item.total_parcelas}
              </span>
            ) : null}
            {item.is_recorrente ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[6px] bg-sky-500/10 text-sky-700 dark:text-sky-400 text-[10px] font-medium">
                <Repeat className="h-2.5 w-2.5" /> Fixo
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span className="font-medium text-foreground/80">
              {item.empresa_nome || "Empresa não informada"}
            </span>
            <span>•</span>
            <span>{item.categoria}</span>
            {item.conta_bancaria_nome && (
              <>
                <span>•</span>
                <span className="text-muted-foreground/90 font-medium">
                  {item.conta_bancaria_nome}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="shrink-0">
          {isPago ? (
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-medium px-2.5 py-0.5 rounded-[18px]"
            >
              Quitado
            </Badge>
          ) : isVencido ? (
            <Badge
              variant="outline"
              className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 text-[11px] font-medium px-2.5 py-0.5 rounded-[18px]"
            >
              Atrasado
            </Badge>
          ) : isHoje ? (
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[11px] font-medium px-2.5 py-0.5 rounded-[18px]"
            >
              Vence Hoje
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-muted/50 text-muted-foreground border-border text-[11px] font-medium px-2.5 py-0.5 rounded-[18px]"
            >
              Pendente
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
        <div>
          <span className="text-[11px] text-muted-foreground block">Vencimento</span>
          <span
            className={
              isVencido
                ? "font-semibold text-rose-600 flex items-center gap-1 text-xs"
                : isHoje
                ? "font-semibold text-amber-600 text-xs"
                : "font-medium text-foreground text-xs"
            }
          >
            {isVencido && <AlertCircle className="h-3 w-3 shrink-0" />}
            {formatDateToBR(item.data_vencimento)}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-muted-foreground block">Valor Previsto</span>
          <span className="font-semibold text-foreground text-xs tabular-nums">
            {formatCurrency(item.valor_previsto)}
          </span>
        </div>

        <div>
          <span className="text-[11px] text-muted-foreground block">Valor Pago</span>
          <span className="text-xs tabular-nums text-emerald-600 font-medium">
            {item.valor_pago ? formatCurrency(item.valor_pago) : "—"}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-muted-foreground block">Saldo a Pagar</span>
          <span className="text-xs tabular-nums font-bold text-foreground">
            {formatCurrency(item.saldo_pendente)}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
        <div>
          {isPago ? (
            item.lote_pagamento_id ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Layers className="h-3 w-3" /> Lote
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground">Baixa Manual</span>
            )
          ) : (
            <span className="text-[11px] text-muted-foreground">Aguardando Liquidação</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {item.tipo === TIPO_CONTA_PAGAR.DESPESA && canEdit && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit?.(item)}
                className="h-8 w-8 rounded-[12px] text-muted-foreground hover:text-foreground"
                title="Editar Despesa"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete?.(item)}
                className="h-8 w-8 rounded-[12px] text-muted-foreground hover:text-destructive"
                title="Excluir Despesa"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}

          {!isPago && canEdit && (
            <Button
              size="sm"
              onClick={() => onLiquidar(item)}
              className="h-8 rounded-[12px] text-xs font-semibold px-3 bg-emerald-600 hover:bg-emerald-700 text-white gap-1 shadow-2xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Liquidar</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
