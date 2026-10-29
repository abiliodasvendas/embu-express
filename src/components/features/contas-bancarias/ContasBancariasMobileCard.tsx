import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContaBancariaComSaldo } from "@/types/database";
import { formatCurrency } from "@/utils/formatters/currency";
import { cnpjMask } from "@/utils/masks";
import { Building2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContasBancariasMobileCardProps {
  conta: ContaBancariaComSaldo;
  onExcluir: (conta: ContaBancariaComSaldo) => void;
  isDeleting?: boolean;
}

export function ContasBancariasMobileCard({
  conta,
  onExcluir,
  isDeleting = false,
}: ContasBancariasMobileCardProps) {
  const saldoAtual = conta.saldo_atual || 0;
  const saldoProjetado = conta.saldo_projetado || 0;
  const isSaldoNegativo = saldoAtual < 0;

  return (
    <div className="bg-card rounded-[24px] border border-border p-4 shadow-xs space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-[10px] bg-muted/70 flex items-center justify-center text-foreground border border-border shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-sm text-foreground truncate">
                {conta.banco_nome}
              </h4>
              <Badge
                variant="outline"
                className="bg-muted/50 text-muted-foreground border-border text-[10px] font-medium px-2 py-0.5 rounded-[14px]"
              >
                {conta.tipo_conta || "CORRENTE"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Ag: {conta.agencia || "—"} • Conta: {conta.conta}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onExcluir(conta)}
          disabled={isDeleting}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-[10px] shrink-0 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="text-xs text-muted-foreground flex items-center justify-between flex-wrap gap-1 bg-muted/20 px-3 py-1.5 rounded-[14px]">
        <span className="font-medium text-foreground/80 truncate">
          {conta.empresa?.nome_fantasia || conta.empresa?.razao_social || "Empresa vinculada"}
        </span>
        {conta.empresa?.cnpj && (
          <span className="text-[11px] text-muted-foreground">
            {cnpjMask(conta.empresa.cnpj)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
        <div>
          <span className="text-[11px] text-muted-foreground block">Saldo Realizado</span>
          <span
            className={cn(
              "font-bold text-sm tabular-nums mt-0.5 block",
              isSaldoNegativo ? "text-rose-600 dark:text-rose-400" : "text-foreground"
            )}
          >
            {formatCurrency(saldoAtual)}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-muted-foreground block">Saldo Projetado</span>
          <span className="font-semibold text-sm tabular-nums text-foreground mt-0.5 block">
            {formatCurrency(saldoProjetado)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
        <div>
          <span className="text-[11px] text-muted-foreground block">Entradas (Real / Prev)</span>
          <span className="font-semibold text-xs tabular-nums text-foreground mt-0.5 block">
            {formatCurrency(conta.total_entradas_realizadas || 0)}
          </span>
          <span className="text-[10px] text-muted-foreground block">
            Prev: {formatCurrency(conta.total_entradas_previstas || 0)}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-muted-foreground block">Saídas (Real / Prev)</span>
          <span className="font-semibold text-xs tabular-nums text-foreground mt-0.5 block">
            {formatCurrency(conta.total_saidas_realizadas || 0)}
          </span>
          <span className="text-[10px] text-muted-foreground block">
            Prev: {formatCurrency(conta.total_saidas_previstas || 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
