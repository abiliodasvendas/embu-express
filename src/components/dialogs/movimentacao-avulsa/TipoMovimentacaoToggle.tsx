import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { ArrowDownRight, ArrowLeftRight, ArrowUpRight } from "lucide-react";
import { TipoMovimentacaoAvulsa } from "@/types/database";
import {
  MODO_LANCAMENTO_AVULSO,
  TIPO_MOVIMENTACAO_AVULSA,
} from "@/constants/financeiro.constants";
import { ModoLancamentoAvulso } from "@/schemas/movimentacaoAvulsaSchema";

interface TipoMovimentacaoToggleProps {
  modo: ModoLancamentoAvulso;
  forcedTipo?: TipoMovimentacaoAvulsa;
  hideTransferencia?: boolean;
  onModoChange: (modo: ModoLancamentoAvulso) => void;
}

export function TipoMovimentacaoToggle({
  modo,
  forcedTipo,
  hideTransferencia = false,
  onModoChange,
}: TipoMovimentacaoToggleProps) {
  if (forcedTipo) {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-[18px] bg-muted/40 border border-border/80 text-xs">
        <span className="font-semibold text-muted-foreground">Tipo de Operação:</span>
        {forcedTipo === TIPO_MOVIMENTACAO_AVULSA.ENTRADA ? (
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
            <ArrowDownRight className="w-4 h-4" /> Entrada / Receita
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
            <ArrowUpRight className="w-4 h-4" /> Saída / Despesa
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <FormLabel className="text-xs font-semibold text-foreground">
        Tipo de Operação <span className="text-destructive">*</span>
      </FormLabel>
      <div className={`grid gap-2 ${hideTransferencia ? "grid-cols-2" : "grid-cols-3"}`}>
        <Button
          type="button"
          variant="outline"
          className={`h-11 rounded-[18px] text-xs font-semibold gap-1.5 transition-all cursor-pointer ${
            modo === MODO_LANCAMENTO_AVULSO.ENTRADA
              ? "bg-background border-primary text-foreground ring-1 ring-primary shadow-xs"
              : "border-border text-muted-foreground hover:bg-muted"
          }`}
          onClick={() => onModoChange(MODO_LANCAMENTO_AVULSO.ENTRADA)}
        >
          <ArrowDownRight className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="truncate">Entrada (+)</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className={`h-11 rounded-[18px] text-xs font-semibold gap-1.5 transition-all cursor-pointer ${
            modo === MODO_LANCAMENTO_AVULSO.SAIDA
              ? "bg-background border-primary text-foreground ring-1 ring-primary shadow-xs"
              : "border-border text-muted-foreground hover:bg-muted"
          }`}
          onClick={() => onModoChange(MODO_LANCAMENTO_AVULSO.SAIDA)}
        >
          <ArrowUpRight className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="truncate">Saída (-)</span>
        </Button>
        {!hideTransferencia && (
          <Button
            type="button"
            variant="outline"
            className={`h-11 rounded-[18px] text-xs font-semibold gap-1.5 transition-all cursor-pointer ${
              modo === MODO_LANCAMENTO_AVULSO.TRANSFERENCIA
                ? "bg-background border-primary text-foreground ring-1 ring-primary shadow-xs"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
            onClick={() => onModoChange(MODO_LANCAMENTO_AVULSO.TRANSFERENCIA)}
          >
            <ArrowLeftRight className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">Transferência</span>
          </Button>
        )}
      </div>
    </div>
  );
}
