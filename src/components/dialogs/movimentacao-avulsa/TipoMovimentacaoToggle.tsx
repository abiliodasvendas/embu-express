import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { TipoMovimentacaoAvulsa } from "@/types/database";
import { TIPO_MOVIMENTACAO_AVULSA } from "@/constants/financeiro.constants";

interface TipoMovimentacaoToggleProps {
  tipo: TipoMovimentacaoAvulsa;
  forcedTipo?: TipoMovimentacaoAvulsa;
  onTipoChange: (tipo: TipoMovimentacaoAvulsa) => void;
}

export function TipoMovimentacaoToggle({
  tipo,
  forcedTipo,
  onTipoChange,
}: TipoMovimentacaoToggleProps) {
  if (forcedTipo) {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-[14px] bg-muted/40 border border-border/80 text-xs">
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
        Tipo de Movimentação <span className="text-destructive">*</span>
      </FormLabel>
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          className={`h-11 rounded-[18px] text-xs font-medium gap-1.5 transition-all cursor-pointer ${
            tipo === TIPO_MOVIMENTACAO_AVULSA.ENTRADA
              ? "bg-background border-primary text-foreground ring-1 ring-primary shadow-xs"
              : "border-border text-muted-foreground hover:bg-muted"
          }`}
          onClick={() => onTipoChange(TIPO_MOVIMENTACAO_AVULSA.ENTRADA)}
        >
          <ArrowDownRight className="w-4 h-4 text-emerald-600" />
          Entrada / Receita
        </Button>
        <Button
          type="button"
          variant="outline"
          className={`h-11 rounded-[18px] text-xs font-medium gap-1.5 transition-all cursor-pointer ${
            tipo === TIPO_MOVIMENTACAO_AVULSA.SAIDA
              ? "bg-background border-primary text-foreground ring-1 ring-primary shadow-xs"
              : "border-border text-muted-foreground hover:bg-muted"
          }`}
          onClick={() => onTipoChange(TIPO_MOVIMENTACAO_AVULSA.SAIDA)}
        >
          <ArrowUpRight className="w-4 h-4 text-rose-600" />
          Saída / Despesa
        </Button>
      </div>
    </div>
  );
}
