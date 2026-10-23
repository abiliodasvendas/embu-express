import { useNavigate } from "react-router-dom";
import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionItem } from "@/types/actions";
import { Convenio, ConvenioResumoItem } from "@/types/database";
import { formatCurrency } from "@/utils/formatters/currency";
import { CheckCircle2, CreditCard, Handshake } from "lucide-react";

interface ConvenioMobileItemProps {
  convenio: Convenio;
  resumoItem?: ConvenioResumoItem;
  actions: ActionItem[];
  onLiquidar?: () => void;
}

export function ConvenioMobileItem({
  convenio,
  resumoItem,
  actions,
  onLiquidar,
}: ConvenioMobileItemProps) {
  const navigate = useNavigate();
  const total = resumoItem?.total_consumido || 0;
  const motoboys = resumoItem?.total_motoboys || 0;
  const david = resumoItem?.total_moto_embu_david || 0;
  const fatura = resumoItem?.fatura_fornecedor;

  return (
    <div
      onClick={() => navigate(`/convenios/${convenio.id}`)}
      className="bg-card rounded-[24px] shadow-xs border border-border p-4 active:scale-[0.99] transition-all cursor-pointer text-left space-y-3"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
            <Handshake className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-foreground text-sm truncate">
              {convenio.nome}
            </h3>
            <span className="text-[11px] text-muted-foreground font-medium">
              {resumoItem?.quantidade_lancamentos || 0} lançamentos no mês
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <StatusBadge status={convenio.ativo} />
          <ActionsDropdown actions={actions} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
        <div>
          <span className="text-muted-foreground text-[11px] block">Total Consumido</span>
          <span className="font-bold text-foreground">{formatCurrency(total)}</span>
        </div>
        <div>
          <span className="text-muted-foreground text-[11px] block">Motoboys</span>
          <span className="font-semibold text-foreground">{formatCurrency(motoboys)}</span>
        </div>
        <div>
          <span className="text-muted-foreground text-[11px] block">Moto Embu</span>
          <span className="font-semibold text-foreground">{formatCurrency(david)}</span>
        </div>
        <div>
          <span className="text-muted-foreground text-[11px] block">Fatura Dia 15</span>
          {fatura ? (
            fatura.status === "PAGA" ? (
              <span className="inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded-[18px] bg-muted/60 text-foreground border border-border">
                <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                {formatCurrency(fatura.valor_pago || fatura.valor_total_fatura)}
              </span>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLiquidar?.();
                }}
                className="inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded-[18px] bg-background hover:bg-muted text-foreground border border-border hover:border-foreground/30 transition-all cursor-pointer"
                title="Clique para quitar a fatura"
              >
                <CreditCard className="h-3 w-3 text-muted-foreground" />
                {formatCurrency(fatura.valor_total_fatura)}
              </button>
            )
          ) : (
            <span className="text-muted-foreground font-normal">—</span>
          )}
        </div>
      </div>
    </div>
  );
}
