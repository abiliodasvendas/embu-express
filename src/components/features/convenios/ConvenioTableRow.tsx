import { useNavigate } from "react-router-dom";
import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TableCell, TableRow } from "@/components/ui/table";
import { ActionItem } from "@/types/actions";
import { Convenio, ConvenioResumoItem } from "@/types/database";
import { formatCurrency } from "@/utils/formatters/currency";
import { CheckCircle2, CreditCard, Handshake } from "lucide-react";

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
                Quitado {fatura.data_pagamento ? `em ${new Date(fatura.data_pagamento + "T12:00:00").toLocaleDateString("pt-BR")}` : ""}
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
                A pagar dia 15
              </span>
            </div>
          )
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="px-6 py-4 text-right align-middle" onClick={(e) => e.stopPropagation()}>
        <ActionsDropdown actions={actions} />
      </TableCell>
    </TableRow>
  );
}
