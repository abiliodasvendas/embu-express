import { SortableHeader } from "@/components/ui/SortableHeader";

interface FaturasTableHeaderProps {
  sortKey: string;
  sortDirection: "asc" | "desc";
  onSort: (key: string) => void;
}

export function FaturasTableHeader({
  sortKey,
  sortDirection,
  onSort,
}: FaturasTableHeaderProps) {
  return (
    <thead className="bg-surface-alt/60">
      <tr className="border-b border-border text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
        <SortableHeader
          label="OS"
          sortKey="numero_os"
          currentKey={sortKey}
          direction={sortDirection}
          onSort={onSort}
        />
        <SortableHeader
          label="Cliente"
          sortKey="cliente"
          currentKey={sortKey}
          direction={sortDirection}
          onSort={onSort}
        />
        <SortableHeader
          label="Empresa"
          sortKey="empresa"
          currentKey={sortKey}
          direction={sortDirection}
          onSort={onSort}
        />
        <th className="py-3 px-4 font-semibold">Período</th>
        <SortableHeader
          label="Vencimento"
          sortKey="data_vencimento"
          currentKey={sortKey}
          direction={sortDirection}
          onSort={onSort}
        />
        <SortableHeader
          label="Valor Total"
          sortKey="valor_faturado"
          currentKey={sortKey}
          direction={sortDirection}
          onSort={onSort}
          align="right"
        />
        <SortableHeader
          label="Valor Pago"
          sortKey="valor_pago"
          currentKey={sortKey}
          direction={sortDirection}
          onSort={onSort}
          align="right"
        />
        <SortableHeader
          label="Status"
          sortKey="status"
          currentKey={sortKey}
          direction={sortDirection}
          onSort={onSort}
          align="center"
        />
        <th className="py-3 px-4 text-center font-semibold">Ações</th>
      </tr>
    </thead>
  );
}
