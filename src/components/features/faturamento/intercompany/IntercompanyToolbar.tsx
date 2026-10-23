import { TableSearchInput } from "@/components/ui/TableSearchInput";

interface IntercompanyToolbarProps {
  searchIntercompany: string;
  onSearchChange: (value: string) => void;
}

export function IntercompanyToolbar({
  searchIntercompany,
  onSearchChange,
}: IntercompanyToolbarProps) {
  return (
    <div className="p-5 md:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h3 className="font-semibold text-foreground text-sm uppercase tracking-tight">
          Histórico de Repasses e Acertos Entre Empresas
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Registros gerados quando um cliente paga faturas de um CNPJ na conta de outro.
        </p>
      </div>
      <TableSearchInput
        value={searchIntercompany}
        onChange={onSearchChange}
        placeholder="Buscar por empresa ou motivo..."
        className="w-full sm:w-64"
      />
    </div>
  );
}
