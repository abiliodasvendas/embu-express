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
import { cn } from "@/lib/utils";
import { FilterOptions, StatusUsuario } from "@/types/enums";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";

interface ConveniosToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  hasAnyFilter: boolean;
  activeFiltersCount: number;
  onClearFilters: () => void;
  isDrawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
  mobileStatus: string;
  onMobileStatusChange: (status: string) => void;
  onApplyMobile: () => void;
}

export function ConveniosToolbar({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  hasAnyFilter,
  activeFiltersCount,
  onClearFilters,
  isDrawerOpen,
  onDrawerOpenChange,
  mobileStatus,
  onMobileStatusChange,
  onApplyMobile,
}: ConveniosToolbarProps) {
  return (
    <div className="space-y-3 w-full">
      <div className="hidden sm:flex items-center gap-3 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar convênio pelo nome..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-9 h-11 rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-medium focus:bg-white focus:border-primary transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="w-52 shrink-0">
          <NativeSelect
            value={selectedStatus || StatusUsuario.ATIVO}
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
            onClick={onClearFilters}
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
            placeholder="Buscar convênio..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-9 h-11 rounded-[18px] bg-card border-border shadow-xs text-xs font-medium focus:bg-white focus:border-primary transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => onDrawerOpenChange(true)}
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

      <Drawer open={isDrawerOpen} onOpenChange={onDrawerOpenChange}>
        <DrawerContent className="rounded-t-[24px] bg-card border-border">
          <DrawerHeader className="px-6 pt-5 pb-2 text-left">
            <DrawerTitle className="text-lg font-bold text-foreground">
              Filtrar Convênios
            </DrawerTitle>
            <DrawerDescription className="text-xs text-muted-foreground">
              Ajuste as opções abaixo e toque em Aplicar.
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Status</label>
              <NativeSelect
                value={mobileStatus || StatusUsuario.ATIVO}
                onChange={(e) => onMobileStatusChange(e.target.value)}
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
              onClick={onClearFilters}
              className="flex-1 h-11 rounded-[18px] border-border font-medium text-muted-foreground hover:text-foreground"
            >
              Limpar
            </Button>
            <Button
              type="button"
              onClick={onApplyMobile}
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
