import { SortableHeader } from "@/components/ui/SortableHeader";

interface DespesasTableHeaderProps {
  sortKey: string;
  sortDirection: "asc" | "desc";
  onSort: (key: string) => void;
}

export function DespesasTableHeader({
  sortKey,
  sortDirection,
  onSort,
}: DespesasTableHeaderProps) {
  return (
    <thead className="bg-surface-alt/60">
      <tr className="border-b border-border text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
        <SortableHeader
          label="Vencimento"
          sortKey="data_vencimento"
          currentKey={sortKey}
          direction={sortDirection}
          onSort={onSort}
        />
        <SortableHeader
          label="Descrição / Credor"
          sortKey="descricao"
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
        <SortableHeader
          label="Categoria"
          sortKey="categoria"
          currentKey={sortKey}
          direction={sortDirection}
          onSort={onSort}
        />
        <th className="py-3 px-4 font-semibold">Tipo</th>
        <SortableHeader
          label="Valor Previsto"
          sortKey="valor_previsto"
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
          label="Data Pagto"
          sortKey="data_pagamento"
          currentKey={sortKey}
          direction={sortDirection}
          onSort={onSort}
          align="center"
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
