import { useNavigate } from "react-router-dom";
import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ActionItem } from "@/types/actions";
import { Convenio, ConvenioResumoItem } from "@/types/database";
import { formatCurrency } from "@/utils/formatters/currency";
import { formatDateToBR } from "@/utils/formatters/date";
import { CheckCircle2, CreditCard, Handshake } from "lucide-react";
import { getConvenioPagamentoInfo } from "./convenioTableUtils";

interface ConvenioTableRowProps {
  convenio: Convenio;
  resumoItem?: ConvenioResumoItem;
  actions: ActionItem[];
  onLiquidar?: () => void;
}

export function ConvenioTableRow({
  convenio,
  resumoItem,
  actions,
  onLiquidar,
}: ConvenioTableRowProps) {
  const navigate = useNavigate();
  const total = resumoItem?.total_consumido || 0;
  const motoboys = resumoItem?.total_motoboys || 0;
  const david = resumoItem?.total_moto_embu_david || 0;
  const fatura = resumoItem?.fatura_fornecedor;
  const pagamentoInfo = getConvenioPagamentoInfo(fatura);

  return (
    <TableRow
      onClick={() => navigate(`/convenios/${convenio.id}`)}
      className="cursor-pointer hover:bg-primary/[0.04] active:bg-primary/[0.08] transition-colors duration-150"
    >
      <TableCell className="py-4 pl-6 align-middle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
            <Handshake className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-foreground text-sm">{convenio.nome}</p>
            <span className="text-xs text-muted-foreground">
              {resumoItem?.quantidade_lancamentos || 0} lançamentos
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-6 py-4 align-middle">
        <StatusBadge status={convenio.ativo} />
      </TableCell>
      <TableCell className="px-6 py-4 align-middle font-bold text-foreground text-sm">
        {formatCurrency(total)}
      </TableCell>
      <TableCell className="px-6 py-4 align-middle font-semibold text-foreground text-sm">
        {formatCurrency(motoboys)}
      </TableCell>
      <TableCell className="px-6 py-4 align-middle font-semibold text-foreground text-sm">
        {formatCurrency(david)}
      </TableCell>
      <TableCell className="px-6 py-4 align-middle">
        {fatura ? (
          fatura.status === "PAGA" ? (
            <div className="flex flex-col gap-0.5">
              <span className="inline-flex items-center gap-1 font-semibold text-xs px-2.5 py-0.5 rounded-[18px] w-max bg-muted/60 text-foreground border border-border">
                <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                {formatCurrency(fatura.valor_pago || fatura.valor_total_fatura)}
              </span>
              <span className="text-[10px] text-muted-foreground pl-0.5">
                Quitado
              </span>
            </div>
          ) : fatura.status === "PAGO_PARCIAL" ? (
            <div
              className="flex flex-col gap-0.5"
              onClick={(e) => {
                e.stopPropagation();
                onLiquidar?.();
              }}
            >
              <button
                type="button"
                className="inline-flex items-center gap-1.5 font-semibold text-xs px-2.5 py-1 rounded-[18px] w-max bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 transition-all cursor-pointer shadow-2xs"
                title="Clique para amortizar / quitar restante"
              >
                <CreditCard className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                <span>Resta {formatCurrency(Math.max(0, fatura.valor_total_fatura - (fatura.valor_pago || 0)))}</span>
              </button>
              <span className="text-[10px] text-muted-foreground pl-1">
                Pago {formatCurrency(fatura.valor_pago || 0)} de {formatCurrency(fatura.valor_total_fatura)}
              </span>
            </div>
          ) : (
            <div
              className="flex flex-col gap-0.5"
              onClick={(e) => {
                e.stopPropagation();
                onLiquidar?.();
              }}
            >
              <button
                type="button"
                className="inline-flex items-center gap-1.5 font-semibold text-xs px-2.5 py-1 rounded-[18px] w-max bg-background hover:bg-muted text-foreground border border-border hover:border-foreground/30 transition-all cursor-pointer shadow-2xs"
                title="Clique para quitar a fatura"
              >
                <CreditCard className="h-3 w-3 text-muted-foreground" />
                <span>{formatCurrency(fatura.valor_total_fatura)}</span>
              </button>
              <span className="text-[10px] text-muted-foreground pl-1">
                A pagar
              </span>
            </div>
          )
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell
        className="px-6 py-4 text-center align-middle whitespace-nowrap"
        onClick={(e) => e.stopPropagation()}
      >
        {!pagamentoInfo.temPagamento ? (
          <span className="text-xs text-muted-foreground/40 font-normal">-</span>
        ) : pagamentoInfo.quantidadeBaixas === 1 ? (
          <span className="text-foreground font-medium text-xs tabular-nums">
            {formatDateToBR(pagamentoInfo.ultimaData!)}
          </span>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[14px] bg-muted/60 hover:bg-muted text-foreground text-xs font-medium cursor-pointer transition-colors border border-border/50"
              >
                <span className="tabular-nums">{formatDateToBR(pagamentoInfo.ultimaData!)}</span>
                <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                  +{pagamentoInfo.quantidadeBaixas - 1}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="p-3 max-w-xs space-y-2">
              <div className="font-semibold text-xs border-b border-border/40 pb-1">
                Histórico de Pagamentos ({pagamentoInfo.quantidadeBaixas})
              </div>
              <div className="space-y-1.5 text-[11px]">
                {pagamentoInfo.pagamentos.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="flex justify-between items-center gap-4"
                  >
                    <span className="text-muted-foreground">
                      {formatDateToBR(p.data_pagamento)}
                    </span>
                    <span className="font-semibold tabular-nums text-foreground">
                      {formatCurrency(p.valor_pago)}
                    </span>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </TableCell>
      <TableCell className="px-6 py-4 text-right align-middle" onClick={(e) => e.stopPropagation()}>
        <ActionsDropdown actions={actions} />
      </TableCell>
    </TableRow>
  );
}
