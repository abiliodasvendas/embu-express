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
import { safeCloseDialog } from "@/utils/dialogUtils";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ItensEquipamentosToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategoria?: string;
  onCategoriaChange?: (catId: string) => void;
  onApplyFilters?: (filters: { categoria?: string }) => void;
  categorias?: Array<{ id: number; nome: string }>;
  hasActiveFilters?: boolean;
  onClear?: () => void;
}

export function ItensEquipamentosToolbar({
  searchTerm,
  onSearchChange,
  selectedCategoria = "todos",
  onCategoriaChange,
  onApplyFilters,
  categorias = [],
  hasActiveFilters,
  onClear,
}: ItensEquipamentosToolbarProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const debouncedSearch = useDebounce(localSearch, 400);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mobileCategoria, setMobileCategoria] = useState(selectedCategoria);

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
      setMobileCategoria(selectedCategoria);
    }
  }, [isDrawerOpen, selectedCategoria]);

  const handleApplyMobile = () => {
    if (onApplyFilters) {
      onApplyFilters({ categoria: mobileCategoria });
    } else if (onCategoriaChange) {
      onCategoriaChange(mobileCategoria);
    }
    safeCloseDialog(() => setIsDrawerOpen(false));
  };

  const handleClear = () => {
    setLocalSearch("");
    setMobileCategoria("todos");
    if (onClear) {
      onClear();
    } else {
      onSearchChange("");
      onCategoriaChange?.("todos");
    }
    if (isDrawerOpen) {
      safeCloseDialog(() => setIsDrawerOpen(false));
    }
  };

  return (
    <div className="space-y-3 w-full">
      <div className="hidden sm:flex items-center gap-3 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por nome do item..."
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

        {categorias.length > 0 && onCategoriaChange && (
          <div className="w-52 shrink-0">
            <NativeSelect
              value={selectedCategoria}
              onChange={(e) => onCategoriaChange(e.target.value)}
              className="h-11 rounded-[18px] bg-card border-border shadow-xs text-xs font-medium w-full cursor-pointer"
            >
              <option value="todos">Todas as categorias</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.nome}
                </option>
              ))}
            </NativeSelect>
          </div>
        )}

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

      <div className="flex sm:hidden items-center gap-2 w-full">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar itens..."
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

        {categorias.length > 0 && onCategoriaChange && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDrawerOpen(true)}
            className={cn(
              "h-11 px-3.5 rounded-[18px] border-border bg-card shadow-xs gap-1.5 text-xs font-semibold shrink-0 transition-colors",
              hasActiveFilters && "border-primary text-primary bg-primary/5"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filtros</span>
            {hasActiveFilters && (
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            )}
          </Button>
        )}

        {categorias.length > 0 && onCategoriaChange && (
          <Drawer
            open={isDrawerOpen}
            onOpenChange={(val) => !val && safeCloseDialog(() => setIsDrawerOpen(false))}
          >
            <DrawerContent className="px-4 pb-6 pt-2 max-h-[85vh]">
              <DrawerHeader className="text-left px-0 pb-4">
                <DrawerTitle className="text-base font-bold">Filtros</DrawerTitle>
                <DrawerDescription className="text-xs text-muted-foreground">
                  Filtre os itens por categoria
                </DrawerDescription>
              </DrawerHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Categoria
                  </label>
                  <NativeSelect
                    value={mobileCategoria}
                    onChange={(e) => setMobileCategoria(e.target.value)}
                    className="h-11 rounded-[18px] bg-card border-border text-xs font-medium"
                  >
                    <option value="todos">Todas as categorias</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={String(cat.id)}>
                        {cat.nome}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
              </div>

              <DrawerFooter className="px-0 pt-4 pb-0 flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="flex-1 h-11 rounded-[18px] border-border text-xs font-semibold"
                >
                  Limpar
                </Button>
                <Button
                  onClick={handleApplyMobile}
                  className="flex-1 h-11 rounded-[18px] bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-semibold"
                >
                  Aplicar
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </div>
  );
}
