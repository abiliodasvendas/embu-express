import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";

interface BloqueadosToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  filtroConvenio: string;
  onFiltroConvenioChange: (value: string) => void;
  convenios: Array<{ id: string; nome: string }>;
}

export function BloqueadosToolbar({
  searchTerm,
  onSearchChange,
  onClearSearch,
  filtroConvenio,
  onFiltroConvenioChange,
  convenios,
}: BloqueadosToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por colaborador..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-11 rounded-[18px] text-sm bg-card border-border focus:bg-white focus:border-primary transition-all font-normal shadow-xs"
        />
        {searchTerm && (
          <button
            onClick={onClearSearch}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="w-full sm:w-64">
        <NativeSelect
          value={filtroConvenio}
          onChange={(e) => onFiltroConvenioChange(e.target.value)}
          className="h-11 rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-semibold"
        >
          <option value="TODOS">Todas as Restrições</option>
          <option value="GERAL">Somente Bloqueio Geral</option>
          {convenios.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </NativeSelect>
      </div>
    </div>
  );
}
