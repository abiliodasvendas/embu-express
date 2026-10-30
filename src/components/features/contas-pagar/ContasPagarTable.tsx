import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/formatters/currency";
import { formatDateToBR } from "@/utils/formatters/date";
import { ContaPagarItem } from "@/types/database";
import { CheckCircle2, Layers, CreditCard, Edit2, Trash2, Repeat } from "lucide-react";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { TableSkeleton } from "@/components/skeletons";
import { ContasPagarMobileCard } from "./ContasPagarMobileCard";
import { STATUS_DESPESA, TIPO_CONTA_PAGAR } from "@/constants/financeiro.constants";

interface ContasPagarTableProps {
  itens: ContaPagarItem[];
  isLoading: boolean;
  onLiquidar: (item: ContaPagarItem) => void;
  onEdit?: (item: ContaPagarItem) => void;
  onDelete?: (item: ContaPagarItem) => void;
  onNovaDespesa?: () => void;
  canEdit?: boolean;
}

export function ContasPagarTable({
  itens,
  isLoading,
  onLiquidar,
  onEdit,
  onDelete,
  onNovaDespesa,
  canEdit = true,
}: ContasPagarTableProps) {
  if (isLoading) {
    return <TableSkeleton cols={8} rows={5} />;
  }

  if (itens.length === 0) {
    return (
      <div className="rounded-[24px] border border-border bg-card shadow-xs p-8">
        <UnifiedEmptyState
          icon={CreditCard}
          title="Nenhum compromisso a pagar encontrado"
          description="Nenhuma despesa ou fatura de convênio para os filtros selecionados."
          action={canEdit && onNovaDespesa ? { label: "Nova Despesa", onClick: onNovaDespesa } : undefined}
        />
      </div>
    );
  }

  const hoje = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      <div className="hidden md:block rounded-[24px] border border-border overflow-hidden bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-alt/60">
              <tr className="border-b border-border text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4 w-[110px]">Status</th>
                <th className="py-3 px-4 w-[95px]">Tipo</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Empresa / Conta</th>
                <th className="py-3 px-4 w-[110px]">Vencimento</th>
                <th className="py-3 px-4 w-[120px] text-right">Valor Previsto</th>
                <th className="py-3 px-4 w-[110px] text-right">Valor Pago</th>
                <th className="py-3 px-4 w-[120px] text-right">Saldo a Pagar</th>
                <th className="py-3 px-4 w-[110px] text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {itens.map((item) => {
                const isPago = item.status === STATUS_DESPESA.PAGO;
                const isVencido = !isPago && item.data_vencimento < hoje;
                const isHoje = !isPago && item.data_vencimento === hoje;

                return (
                  <tr key={`${item.tipo}_${item.id}`} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
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
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] bg-muted/60 text-muted-foreground font-mono text-[11px] font-medium">
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
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-sm text-foreground block truncate">
                        {item.descricao}
                      </span>
                      <span className="text-[11px] text-muted-foreground block">
                        {item.categoria}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs font-medium text-foreground/80 whitespace-nowrap">
                      <span className="block">{item.empresa_nome || "—"}</span>
                      {item.conta_bancaria_nome ? (
                        <span className="text-[11px] text-muted-foreground block">
                          Conta: {item.conta_bancaria_nome}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/60 block">
                          Conta não definida
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={
                          isVencido
                            ? "text-rose-600 font-semibold text-xs"
                            : isHoje
                            ? "text-amber-600 font-semibold text-xs"
                            : "text-xs text-foreground"
                        }
                      >
                        {formatDateToBR(item.data_vencimento)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="text-xs font-medium text-muted-foreground block">
                        {formatCurrency(item.valor_previsto)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="text-xs font-medium text-emerald-600 block">
                        {item.valor_pago ? formatCurrency(item.valor_pago) : "—"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="text-sm font-bold text-foreground block">
                        {formatCurrency(item.saldo_pendente)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
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

                        {!isPago ? (
                          <Button
                            size="sm"
                            onClick={() => onLiquidar(item)}
                            className="h-8 rounded-[12px] text-xs font-semibold px-3 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Liquidar
                          </Button>
                        ) : item.lote_pagamento_id ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Layers className="h-3 w-3" /> Lote
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">Baixa Manual</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {itens.map((item) => (
          <ContasPagarMobileCard
            key={`${item.tipo}_${item.id}`}
            item={item}
            onLiquidar={onLiquidar}
            onEdit={onEdit}
            onDelete={onDelete}
            canEdit={canEdit}
          />
        ))}
      </div>
    </div>
  );
}
