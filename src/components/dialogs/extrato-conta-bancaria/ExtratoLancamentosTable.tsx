import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ORIGEM_EXTRATO_BANCARIO,
  TIPO_MOVIMENTACAO_AVULSA,
} from "@/constants/financeiro.constants";
import { ExtratoBancarioItem } from "@/types/database";
import { formatCurrency } from "@/utils/formatters/currency";
import { formatDateToBR } from "@/utils/formatters/date";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface ExtratoLancamentosTableProps {
  mes: number;
  ano: number;
  saldoAnterior: number;
  itensFiltrados: ExtratoBancarioItem[];
  isLoading: boolean;
  isFetching: boolean;
  onDeleteMovimentacaoAvulsa: (item: ExtratoBancarioItem) => void;
}

export function ExtratoLancamentosTable({
  mes,
  ano,
  saldoAnterior,
  itensFiltrados,
  isLoading,
  isFetching,
  onDeleteMovimentacaoAvulsa,
}: ExtratoLancamentosTableProps) {
  return (
    <div className="relative rounded-[24px] border border-border overflow-hidden bg-card">
      {isFetching && !isLoading && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-surface-alt overflow-hidden z-20">
          <div className="h-full bg-primary w-full animate-pulse" />
        </div>
      )}
      <div
        className={cn(
          "overflow-x-auto transition-opacity duration-200",
          isFetching && !isLoading && "opacity-60 pointer-events-none"
        )}
      >
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/40 border-b border-border">
            <tr className="text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
              <th className="py-3 px-4 w-[100px]">Data</th>
              <th className="py-3 px-4">Histórico / Lançamento</th>
              <th className="py-3 px-4 w-[160px]">Categoria</th>
              <th className="py-3 px-4 w-[130px] text-right text-emerald-700 dark:text-emerald-400">
                Entradas (+)
              </th>
              <th className="py-3 px-4 w-[130px] text-right text-rose-700 dark:text-rose-400">
                Saídas (-)
              </th>
              <th className="py-3 px-4 w-[135px] text-right">Saldo</th>
              <th className="py-3 px-3 w-[56px] text-center">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            <tr className="bg-muted/20 font-medium">
              <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                01/{String(mes).padStart(2, "0")}/{ano}
              </td>
              <td className="py-3 px-4 font-semibold text-foreground" colSpan={2}>
                SALDO ANTERIOR
              </td>
              <td className="py-3 px-4 text-right text-muted-foreground">—</td>
              <td className="py-3 px-4 text-right text-muted-foreground">—</td>
              <td
                className={cn(
                  "py-3 px-4 text-right font-bold tabular-nums whitespace-nowrap",
                  saldoAnterior < 0 ? "text-rose-600" : "text-foreground"
                )}
              >
                {formatCurrency(saldoAnterior)}
              </td>
              <td className="py-3 px-3 text-center text-muted-foreground">—</td>
            </tr>

            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-muted-foreground">
                  Carregando movimentações do extrato...
                </td>
              </tr>
            ) : itensFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-muted-foreground">
                  Nenhuma movimentação realizada encontrada neste período.
                </td>
              </tr>
            ) : (
              itensFiltrados.map((item) => {
                const isEntrada = item.tipo === TIPO_MOVIMENTACAO_AVULSA.ENTRADA;
                const isTransferencia =
                  item.origem === ORIGEM_EXTRATO_BANCARIO.TRANSFERENCIA_ENTRE_CONTAS;

                return (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-foreground">
                      {formatDateToBR(item.data)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-foreground block">
                        {item.descricao}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-[18px] text-[10px] font-medium",
                          isTransferencia
                            ? "bg-primary/10 border-primary/25 text-primary"
                            : "bg-muted/40 border-border text-muted-foreground"
                        )}
                      >
                        {item.origem_label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap tabular-nums">
                      {isEntrada ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          + {formatCurrency(item.valor)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap tabular-nums">
                      {!isEntrada ? (
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          - {formatCurrency(item.valor)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td
                      className={cn(
                        "py-3 px-4 text-right whitespace-nowrap font-semibold tabular-nums",
                        item.saldo_apos < 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-foreground"
                      )}
                    >
                      {formatCurrency(item.saldo_apos)}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {item.movimentacao_avulsa_id ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="Excluir lançamento"
                          onClick={() => onDeleteMovimentacaoAvulsa(item)}
                          className="h-7 w-7 rounded-[18px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      ) : (
                        <span className="text-muted-foreground/30">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
