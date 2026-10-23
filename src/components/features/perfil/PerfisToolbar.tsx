import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/ui/useDebounce";
import { RotateCcw, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

interface PerfisToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  hasActiveFilters?: boolean;
  onClear?: () => void;
}

export function PerfisToolbar({
  searchTerm,
  onSearchChange,
  hasActiveFilters,
  onClear,
}: PerfisToolbarProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const debouncedSearch = useDebounce(localSearch, 400);

  useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch, searchTerm, onSearchChange]);

  useEffect(() => {
    if (searchTerm !== localSearch) {
      setLocalSearch(searchTerm);
    }
  }, [searchTerm]);

  const handleClear = () => {
    setLocalSearch("");
    onSearchChange("");
    if (onClear) onClear();
  };

  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center gap-3 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar perfil por nome ou descrição..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10 pr-9 h-11 rounded-[18px] bg-card border-border shadow-xs text-xs font-medium focus:bg-white focus:border-primary transition-all"
          />
          {localSearch && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleClear}
            className="h-11 px-3.5 rounded-[18px] text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface-alt transition-colors shrink-0 gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Limpar Filtros</span>
          </Button>
        )}
      </div>
    </div>
  );
}
