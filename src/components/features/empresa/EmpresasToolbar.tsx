import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { useDebounce } from "@/hooks/ui/useDebounce";
import { cn } from "@/lib/utils";
import { FilterOptions, StatusUsuario } from "@/types/enums";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";

interface EmpresasToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  onApplyFilters?: (filters: { status?: string }) => void;
  hasActiveFilters?: boolean;
  onClear?: () => void;
}

export function EmpresasToolbar({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  onApplyFilters,
  hasActiveFilters,
  onClear,
}: EmpresasToolbarProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const debouncedSearch = useDebounce(localSearch, 400);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mobileStatus, setMobileStatus] = useState(selectedStatus || FilterOptions.TODOS);

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

  useEffect(() => {
    if (isDrawerOpen) {
      setMobileStatus(selectedStatus || FilterOptions.TODOS);
    }
  }, [isDrawerOpen, selectedStatus]);

  const hasStatusFilter = selectedStatus && selectedStatus !== FilterOptions.TODOS;
  const hasAnyFilter = Boolean(hasActiveFilters || hasStatusFilter || localSearch);
  const activeFiltersCount = hasStatusFilter ? 1 : 0;

  const handleClear = () => {
    setLocalSearch("");
    setMobileStatus(FilterOptions.TODOS);
    if (onClear) {
      onClear();
    } else {
      onSearchChange("");
      onStatusChange(FilterOptions.TODOS);
    }
    safeCloseDialog(() => setIsDrawerOpen(false));
  };

  const handleApplyMobile = () => {
    if (onApplyFilters) {
      onApplyFilters({ status: mobileStatus });
    }
    onStatusChange(mobileStatus);
    safeCloseDialog(() => setIsDrawerOpen(false));
  };

  return (
    <div className="space-y-3 w-full">
      <div className="hidden sm:flex items-center gap-3 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por nome fantasia, razão social ou CNPJ..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10 pr-9 h-11 rounded-[18px] bg-card border-border shadow-xs text-xs font-medium focus:bg-white focus:border-primary transition-all"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onSearchChange("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="w-52 shrink-0">
          <NativeSelect
            value={selectedStatus || FilterOptions.TODOS}
            onChange={(e) => onStatusChange(e.target.value)}
            className="h-11 rounded-[18px] bg-card border-border shadow-xs text-xs font-medium w-full"
          >
            <option value={FilterOptions.TODOS}>Todos os Status</option>
            <option value={StatusUsuario.ATIVO}>Ativos</option>
            <option value={StatusUsuario.INATIVO}>Inativos</option>
          </NativeSelect>
        </div>

        {hasAnyFilter && (
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

      <div className="flex sm:hidden items-center gap-2 w-full">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar empresas..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10 pr-9 h-11 rounded-[18px] bg-card border-border shadow-xs text-xs font-medium focus:bg-white focus:border-primary transition-all"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onSearchChange("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setIsDrawerOpen(true)}
          className={cn(
            "h-11 px-3.5 rounded-[18px] bg-card border-border shadow-xs text-foreground hover:bg-surface-alt shrink-0 gap-1.5 font-medium text-xs",
            activeFiltersCount > 0 && "border-primary text-primary bg-primary/5"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center -mr-1">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="rounded-t-[24px] bg-card border-border">
          <DrawerHeader className="px-6 pt-5 pb-2 text-left">
            <DrawerTitle className="text-lg font-bold text-foreground">
              Filtrar Empresas
            </DrawerTitle>
            <DrawerDescription className="text-xs text-muted-foreground">
              Ajuste as opções abaixo e toque em Aplicar.
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Status</label>
              <NativeSelect
                value={mobileStatus}
                onChange={(e) => setMobileStatus(e.target.value)}
                className="h-11 rounded-[18px] bg-card border-border shadow-xs text-xs font-medium"
              >
                <option value={FilterOptions.TODOS}>Todos os Status</option>
                <option value={StatusUsuario.ATIVO}>Ativos</option>
                <option value={StatusUsuario.INATIVO}>Inativos</option>
              </NativeSelect>
            </div>
          </div>

          <DrawerFooter className="p-6 pt-2 border-t border-border flex flex-row items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              className="flex-1 h-11 rounded-[18px] border-border font-medium text-muted-foreground hover:text-foreground"
            >
              Limpar
            </Button>
            <Button
              type="button"
              onClick={handleApplyMobile}
              className="flex-1 h-11 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-xs"
            >
              Aplicar Filtros
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
