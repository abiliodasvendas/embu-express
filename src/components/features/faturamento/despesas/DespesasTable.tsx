import { Receipt } from "lucide-react";
import { TableSkeleton } from "@/components/skeletons";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { cn } from "@/lib/utils";
import { DespesasTableHeader } from "./DespesasTableHeader";
import { DespesaTableRow } from "./DespesaTableRow";
import { DespesaMobileCard } from "./DespesaMobileCard";
import type { DespesaOperacional } from "@/types/database";

interface DespesasTableProps {
  despesas: DespesaOperacional[];
  isLoading: boolean;
  isFetching: boolean;
  search: string;
  onClearSearch: () => void;
  onNovaDespesa: () => void;
  sortKey: string;
  sortDirection: "asc" | "desc";
  onSort: (key: string) => void;
  onLiquidar: (despesa: DespesaOperacional) => void;
  onEdit: (despesa: DespesaOperacional) => void;
  onDelete: (despesa: DespesaOperacional) => void;
  canEdit?: boolean;
}

export function DespesasTable({
  despesas,
  isLoading,
  isFetching,
  search,
  onClearSearch,
  onNovaDespesa,
  sortKey,
  sortDirection,
  onSort,
  onLiquidar,
  onEdit,
  onDelete,
  canEdit = true,
}: DespesasTableProps) {
  if (isLoading) {
    return <TableSkeleton cols={10} rows={5} />;
  }

  if (despesas.length === 0) {
    return (
      <div className="rounded-[24px] border border-border bg-card shadow-xs p-8">
        <UnifiedEmptyState
          icon={Receipt}
          title="Nenhuma conta a pagar encontrada"
          description={
            search
              ? `Nenhuma despesa encontrada para a busca "${search}".`
              : "Nenhuma conta a pagar encontrada para a competência e filtros selecionados."
          }
          action={
            search
              ? { label: "Limpar busca", onClick: onClearSearch }
              : canEdit
                ? { label: "Nova Despesa", onClick: onNovaDespesa }
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
            isFetching && "opacity-50 pointer-events-none",
          )}
        >
          <table className="w-full text-left text-xs border-collapse">
            <DespesasTableHeader
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <tbody className="divide-y divide-border/60">
              {despesas.map((d) => (
                <DespesaTableRow
                  key={d.id}
                  despesa={d}
                  onLiquidar={onLiquidar}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  canEdit={canEdit}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {despesas.map((d) => (
          <DespesaMobileCard
            key={d.id}
            despesa={d}
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
