import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/skeletons";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { cn } from "@/lib/utils";
import { MovimentacaoAvulsa } from "@/types/database";
import { CATEGORIA_MOVIMENTACAO_AVULSA_LABELS } from "@/constants/financeiro.constants";
import { formatDateToBR } from "@/utils/formatters/date";
import { formatCurrency, formatContaBancaria } from "@/utils/formatters";
import {
  Banknote,
  ArrowDownRight,
  ArrowUpRight,
  Edit2,
  Trash2,
} from "lucide-react";

interface AvulsasTableProps {
  movimentacoes: MovimentacaoAvulsa[];
  isLoading: boolean;
  isFetching: boolean;
  search: string;
  onClearSearch: () => void;
  onNovoLancamento: () => void;
  sortKey: string;
  sortDirection: "asc" | "desc";
  onSort: (key: string) => void;
  onEdit: (movimentacao: MovimentacaoAvulsa) => void;
  onDelete: (movimentacao: MovimentacaoAvulsa) => void;
  canEdit?: boolean;
}

export function AvulsasTable({
  movimentacoes,
  isLoading,
  isFetching,
  search,
  onClearSearch,
  onNovoLancamento,
  sortKey,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
  canEdit = true,
}: AvulsasTableProps) {
  if (isLoading) {
    return <TableSkeleton cols={8} rows={4} />;
  }

  if (movimentacoes.length === 0) {
    return (
      <div className="rounded-[24px] border border-border bg-card shadow-xs p-8">
        <UnifiedEmptyState
          icon={Banknote}
          title="Nenhuma movimentação avulsa encontrada"
          description={
            search
              ? `Nenhuma movimentação avulsa encontrada para "${search}".`
              : "Nenhuma movimentação avulsa encontrada na competência selecionada."
          }
          action={
            search
              ? { label: "Limpar busca", onClick: onClearSearch }
              : canEdit
                ? { label: "Novo Lançamento", onClick: onNovoLancamento }
                : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden md:block relative rounded-[24px] border border-border overflow-hidden bg-card shadow-xs">
        {isFetching && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-surface-alt overflow-hidden z-20">
            <div className="h-full bg-primary w-full animate-pulse" />
          </div>
        )}
        <div
          className={cn(
            "overflow-x-auto transition-opacity duration-200",
            isFetching && "opacity-50 pointer-events-none"
          )}
        >
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-surface-alt/60">
              <tr className="border-b border-border text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                <SortableHeader
                  label="Data"
                  sortKey="data_movimentacao"
                  currentKey={sortKey}
                  direction={sortDirection}
                  onSort={onSort}
                />
                <SortableHeader
                  label="Tipo"
                  sortKey="tipo_movimentacao"
                  currentKey={sortKey}
                  direction={sortDirection}
                  onSort={onSort}
                />
                <SortableHeader
                  label="Categoria"
                  sortKey="categoria"
                  currentKey={sortKey}
                  direction={sortDirection}
                  onSort={onSort}
                />
                <SortableHeader
                  label="Descrição"
                  sortKey="descricao"
                  currentKey={sortKey}
                  direction={sortDirection}
                  onSort={onSort}
                />
                <th className="py-3 px-4 font-semibold">Empresa</th>
                <SortableHeader
                  label="Conta Bancária"
                  sortKey="conta_bancaria"
                  currentKey={sortKey}
                  direction={sortDirection}
                  onSort={onSort}
                />
                <SortableHeader
                  label="Valor"
                  sortKey="valor"
                  currentKey={sortKey}
                  direction={sortDirection}
                  onSort={onSort}
                  align="right"
                />
                <th className="py-3 px-4 text-center font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {movimentacoes.map((m) => (
                <tr key={m.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap font-medium">
                    {formatDateToBR(m.data_movimentacao)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {m.tipo_movimentacao === "ENTRADA" ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-medium px-2.5 py-0.5 rounded-[18px] gap-1"
                      >
                        <ArrowDownRight className="w-3 h-3" /> Entrada
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 text-[11px] font-medium px-2.5 py-0.5 rounded-[18px] gap-1"
                      >
                        <ArrowUpRight className="w-3 h-3" /> Saída
                      </Badge>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap font-medium text-xs">
                    {CATEGORIA_MOVIMENTACAO_AVULSA_LABELS[m.categoria] || m.categoria}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-sm text-foreground block max-w-xs truncate">
                      {m.descricao}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-foreground/80 whitespace-nowrap text-xs">
                    {m.empresa?.nome_fantasia || "Empresa"}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap text-xs font-medium">
                    {m.conta_bancaria ? (
                      <span>
                        {formatContaBancaria(m.conta_bancaria, m.empresa?.nome_fantasia)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40 font-normal">-</span>
                    )}
                  </td>
                  <td
                    className={cn(
                      "py-3.5 px-4 text-right font-semibold text-xs sm:text-sm tabular-nums whitespace-nowrap",
                      m.tipo_movimentacao === "ENTRADA"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    )}
                  >
                    {m.tipo_movimentacao === "ENTRADA" ? "+ " : "- "}
                    {formatCurrency(m.valor)}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {canEdit ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-[18px] text-muted-foreground hover:text-foreground"
                          onClick={() => onEdit(m)}
                          title="Editar Lançamento"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-[18px] text-muted-foreground hover:text-destructive"
                          onClick={() => onDelete(m)}
                          title="Excluir Lançamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {movimentacoes.map((m) => (
          <div
            key={m.id}
            className="bg-card rounded-[24px] border border-border p-4 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <h4 className="font-bold text-sm text-foreground truncate">
                  {m.descricao}
                </h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">
                    {m.empresa?.nome_fantasia || "Empresa"}
                  </span>
                  <span>•</span>
                  <span>{CATEGORIA_MOVIMENTACAO_AVULSA_LABELS[m.categoria] || m.categoria}</span>
                </div>
              </div>
              <div className="shrink-0">
                {m.tipo_movimentacao === "ENTRADA" ? (
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-medium px-2.5 py-0.5 rounded-[18px] gap-1"
                  >
                    <ArrowDownRight className="w-3 h-3" /> Entrada
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 text-[11px] font-medium px-2.5 py-0.5 rounded-[18px] gap-1"
                  >
                    <ArrowUpRight className="w-3 h-3" /> Saída
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
              <div>
                <span className="text-[11px] text-muted-foreground block">Data</span>
                <span className="font-medium text-foreground">
                  {formatDateToBR(m.data_movimentacao)}
                </span>
                {m.conta_bancaria && (
                  <span className="text-[10px] text-muted-foreground block truncate">
                    {formatContaBancaria(m.conta_bancaria, m.empresa?.nome_fantasia)}
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-[11px] text-muted-foreground block">Valor</span>
                <span
                  className={cn(
                    "font-semibold text-xs tabular-nums",
                    m.tipo_movimentacao === "ENTRADA"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  )}
                >
                  {m.tipo_movimentacao === "ENTRADA" ? "+ " : "- "}
                  {formatCurrency(m.valor)}
                </span>
              </div>
            </div>

            {canEdit && (
              <div className="pt-2 border-t border-border flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-[18px] text-muted-foreground hover:text-foreground"
                  onClick={() => onEdit(m)}
                  title="Editar Lançamento"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-[18px] text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(m)}
                  title="Excluir Lançamento"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
