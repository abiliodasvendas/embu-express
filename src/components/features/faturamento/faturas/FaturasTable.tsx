import { FileText } from "lucide-react";
import { TableSkeleton } from "@/components/skeletons";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { cn } from "@/lib/utils";
import { FaturasTableHeader } from "./FaturasTableHeader";
import { FaturaTableRow } from "./FaturaTableRow";
import { FaturaMobileCard } from "./FaturaMobileCard";
import type { FaturaCliente } from "@/types/database";

interface FaturasTableProps {
  faturas: FaturaCliente[];
  isLoading: boolean;
  isFetching: boolean;
  search: string;
  onClearSearch: () => void;
  onNovaFatura: () => void;
  sortKey: string;
  sortDirection: "asc" | "desc";
  onSort: (key: string) => void;
  onLiquidar: (fatura: FaturaCliente) => void;
  onEdit: (fatura: FaturaCliente) => void;
  onDelete: (fatura: FaturaCliente) => void;
}

export function FaturasTable({
  faturas,
  isLoading,
  isFetching,
  search,
  onClearSearch,
  onNovaFatura,
  sortKey,
  sortDirection,
  onSort,
  onLiquidar,
  onEdit,
  onDelete,
}: FaturasTableProps) {
  if (isLoading) {
    return <TableSkeleton cols={9} rows={5} />;
  }

  if (faturas.length === 0) {
    return (
      <div className="rounded-[24px] border border-border bg-card shadow-xs p-8">
        <UnifiedEmptyState
          icon={FileText}
          title="Nenhuma fatura encontrada"
          description={
            search
              ? `Nenhuma fatura encontrada para a busca "${search}".`
              : "Nenhuma fatura encontrada para os filtros selecionados."
          }
          action={
            search
              ? { label: "Limpar busca", onClick: onClearSearch }
              : { label: "Nova Fatura", onClick: onNovaFatura }
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
            <FaturasTableHeader
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <tbody className="divide-y divide-border/60">
              {faturas.map((f) => (
                <FaturaTableRow
                  key={f.id}
                  fatura={f}
                  onLiquidar={onLiquidar}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {faturas.map((f) => (
          <FaturaMobileCard
            key={f.id}
            fatura={f}
            onLiquidar={onLiquidar}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
