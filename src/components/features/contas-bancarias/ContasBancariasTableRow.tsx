import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContaBancariaComSaldo } from "@/types/database";
import { formatCurrency } from "@/utils/formatters/currency";
import { cnpjMask } from "@/utils/masks";
import { Building2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContasBancariasTableRowProps {
  conta: ContaBancariaComSaldo;
  onExcluir: (conta: ContaBancariaComSaldo) => void;
  isDeleting?: boolean;
}

export function ContasBancariasTableRow({
  conta,
  onExcluir,
  isDeleting = false,
}: ContasBancariasTableRowProps) {
  const saldoAtual = conta.saldo_atual || 0;
  const saldoProjetado = conta.saldo_projetado || 0;
  const isSaldoNegativo = saldoAtual < 0;

  return (
    <tr className="hover:bg-muted/40 transition-colors">
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[10px] bg-muted/70 flex items-center justify-center text-foreground border border-border shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-xs sm:text-sm text-foreground block truncate">
              {conta.banco_nome}
            </span>
            <p className="text-xs text-muted-foreground">
              Ag: {conta.agencia || "—"} • Conta: {conta.conta}
            </p>
          </div>
        </div>
      </td>

      <td className="py-3.5 px-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground truncate">
            {conta.empresa?.nome_fantasia || conta.empresa?.razao_social || "Empresa"}
          </p>
          {conta.empresa?.cnpj && (
            <p className="text-[11px] text-muted-foreground">
              {cnpjMask(conta.empresa.cnpj)}
            </p>
          )}
        </div>
      </td>

      <td className="py-3.5 px-4 whitespace-nowrap">
        <Badge
          variant="outline"
          className="bg-muted/50 text-muted-foreground border-border text-[11px] font-medium px-2 py-0.5 rounded-[14px]"
        >
          {conta.tipo_conta || "CORRENTE"}
        </Badge>
      </td>

      <td className="py-3.5 px-4 text-right whitespace-nowrap">
        <span className="text-xs sm:text-sm font-semibold tabular-nums text-foreground block">
          {formatCurrency(conta.total_entradas_realizadas || 0)}
        </span>
        <span className="text-[11px] text-muted-foreground tabular-nums block">
          Prev: {formatCurrency(conta.total_entradas_previstas || 0)}
        </span>
      </td>

      <td className="py-3.5 px-4 text-right whitespace-nowrap">
        <span className="text-xs sm:text-sm font-semibold tabular-nums text-foreground block">
          {formatCurrency(conta.total_saidas_realizadas || 0)}
        </span>
        <span className="text-[11px] text-muted-foreground tabular-nums block">
          Prev: {formatCurrency(conta.total_saidas_previstas || 0)}
        </span>
      </td>

      <td className="py-3.5 px-4 text-right whitespace-nowrap">
        <span
          className={cn(
            "text-xs sm:text-sm font-bold tabular-nums block",
            isSaldoNegativo ? "text-rose-600 dark:text-rose-400" : "text-foreground"
          )}
        >
          {formatCurrency(saldoAtual)}
        </span>
      </td>

      <td className="py-3.5 px-4 text-right whitespace-nowrap">
        <span className="text-xs sm:text-sm font-semibold tabular-nums text-foreground block">
          {formatCurrency(saldoProjetado)}
        </span>
      </td>

      <td className="py-3.5 px-4 text-right whitespace-nowrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onExcluir(conta)}
          disabled={isDeleting}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-[10px] cursor-pointer"
          title="Excluir conta"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  );
}
