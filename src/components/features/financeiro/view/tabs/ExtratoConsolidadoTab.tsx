import { Receipt } from "lucide-react";
import { formatCurrency } from "@/utils/formatters/currency";
import { cn } from "@/lib/utils";
import { ExtratoMensal } from "@/types/financeiro";
import { LancamentoConsolidado } from "@/hooks/ui/financeiro";

interface ExtratoConsolidadoTabProps {
  extrato: ExtratoMensal;
  lancamentosConsolidados: LancamentoConsolidado[];
}

export function ExtratoConsolidadoTab({
  extrato,
  lancamentosConsolidados,
}: ExtratoConsolidadoTabProps) {
  return (
    <div className="rounded-[20px] sm:rounded-[24px] border border-border overflow-hidden bg-card shadow-xs">
      <div className="p-5 md:p-6 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm uppercase tracking-tight flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          Extrato Consolidado do Mês
        </h3>
        <span className="text-xs font-medium text-muted-foreground">
          {lancamentosConsolidados.length} lançamento(s)
        </span>
      </div>

      {lancamentosConsolidados.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted-foreground font-medium">
          Nenhum lançamento financeiro registrado para este período.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-medium uppercase tracking-wider text-[11px] bg-muted/30">
                <th className="py-3 px-4">Grupo / Origem</th>
                <th className="py-3 px-4">Descrição do Lançamento</th>
                <th className="py-3 px-4 text-center">Tipo</th>
                <th className="py-3 px-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lancamentosConsolidados.map((item) => (
                <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-foreground uppercase text-xs whitespace-nowrap">
                    {item.grupo}
                  </td>
                  <td className="py-3 px-4 text-foreground">{item.descricao}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase tracking-wider border",
                      item.tipo === "ENTRADA"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
                    )}>
                      {item.tipo}
                    </span>
                  </td>
                  <td
                    className={cn(
                      "py-3 px-4 text-right font-bold whitespace-nowrap",
                      item.tipo === "ENTRADA"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400",
                    )}
                  >
                    {item.tipo === "ENTRADA" ? "+" : "-"} {formatCurrency(item.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border font-bold text-xs bg-muted/20">
                <td colSpan={3} className="py-3.5 px-4 text-foreground uppercase">
                  Saldo Final a Pagar
                </td>
                <td
                  className={cn(
                    "py-3.5 px-4 text-right text-sm font-bold",
                    (extrato.totais?.saldo_final || 0) >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400",
                  )}
                >
                  {formatCurrency(extrato.totais?.saldo_final || 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
