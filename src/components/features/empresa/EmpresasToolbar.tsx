import { FilterButton } from "@/components/common/FilterButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/ui/use-mobile";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { Plus, Search, X } from "lucide-react";
import * as React from "react";
import { useState } from "react";

interface EmpresasToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  onRegister: () => void;
  onApplyFilters: (filters: { status?: string }) => void;
  hasActiveFilters?: boolean;
}

const FilterContent = ({ 
  selectedStatus, 
  onStatusChange, 
  onClear, 
  onApply,
  isSheet = false 
}: { 
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  onClear: () => void;
  onApply?: () => void;
  isSheet?: boolean; 
}) => (
  <div className={cn("space-y-6", isSheet ? "px-6 pb-6" : "p-4")}>
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Status</Label>
      <Select value={selectedStatus} onValueChange={onStatusChange}>
        <SelectTrigger className={cn(
          "h-11 rounded-xl bg-gray-50 border-gray-200 shadow-none focus-visible:ring-primary/20 font-medium",
          isSheet && "h-12 bg-white"
        )}>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="z-[10001] rounded-xl border-gray-100">
          <SelectItem value="todos">Todos os Status</SelectItem>
          <SelectItem value="ativo">Ativos</SelectItem>
          <SelectItem value="inativo">Inativos</SelectItem>
        </SelectContent>
      </Select>
    </div>

  </div>
);

export function EmpresasToolbar({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  onRegister,
  onApplyFilters,
  hasActiveFilters,
}: EmpresasToolbarProps) {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const debouncedSearch = useDebounce(localSearch, 500);

  // Local state for mobile filters
  const [mobileStatus, setMobileStatus] = useState(selectedStatus);

  React.useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  React.useEffect(() => {
    if (searchTerm !== localSearch) {
      setLocalSearch(searchTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  React.useEffect(() => {
    if (isSheetOpen) {
      setMobileStatus(selectedStatus);
    }
  }, [isSheetOpen, selectedStatus]);

  // Calculate filter states
  const hasAdvancedFilters = selectedStatus !== "todos";
  const hasAnyFilter = hasAdvancedFilters || searchTerm !== "";

  const clearFilters = () => {
    setLocalSearch("");
    onSearchChange("");
    onApplyFilters({ status: "todos" });
  };

  const applyMobileFilters = () => {
    onApplyFilters({ status: mobileStatus });
    setIsSheetOpen(false);
  };

  const clearMobileFilters = () => {
    setMobileStatus("todos");
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nome, razão social ou CNPJ..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className={cn(
            "pl-9 text-sm sm:text-base bg-white border-gray-200 focus-visible:ring-primary/20 h-11 rounded-xl shadow-none font-medium",
            isMobile && localSearch && "pr-10"
          )}
        />
        {isMobile && localSearch && (
          <button
            onClick={() => setLocalSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        {isMobile ? (
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <FilterButton 
                hasActiveFilters={hasAdvancedFilters}
                isMobile={isMobile}
              />
            </SheetTrigger>
            <SheetContent 
              side="bottom" 
              className="h-auto max-h-[90vh] rounded-t-[20px] flex flex-col px-0 pb-0 bg-gray-50 border-t-0 shadow-2xl"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <SheetHeader className="text-left mb-4 px-6">
                <SheetTitle className="text-xl font-bold">Filtrar</SheetTitle>
                <SheetDescription className="text-gray-500">
                  Refine a lista de empresas pelas opções abaixo.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto">
                <FilterContent 
                  isSheet={true} 
                  selectedStatus={mobileStatus}
                  onStatusChange={setMobileStatus}
                  onClear={clearMobileFilters}
                  onApply={applyMobileFilters}
                />
              </div>
              <div className="p-4 border-t bg-white mt-auto flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={clearMobileFilters} 
                  className="flex-1 h-12 rounded-xl text-slate-500 font-bold border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
                >
                  Limpar
                </Button>
                <Button 
                  onClick={applyMobileFilters}
                  className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-sm font-bold transition-all active:scale-95 text-white"
                >
                  Aplicar
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex items-center gap-3">
             {hasAnyFilter && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-900"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          <Popover>
            <PopoverTrigger asChild>
               <FilterButton 
                hasActiveFilters={hasAdvancedFilters}
                isMobile={isMobile}
                selectedCount={selectedStatus !== "todos" ? 1 : 0}
              />
            </PopoverTrigger>
            <PopoverContent 
              className="w-[280px] p-0 rounded-2xl shadow-2xl border-gray-100 overflow-hidden" 
              align="end" 
              sideOffset={8}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <FilterContent 
                selectedStatus={selectedStatus}
                onStatusChange={onStatusChange}
                onClear={clearFilters}
              />
            </PopoverContent>
            </Popover>
          </div>
        )}

        <Button 
          onClick={onRegister} 
          className={cn(
            "bg-blue-600 hover:bg-blue-700 h-11 rounded-xl gap-2 shadow-sm font-bold text-white transition-all active:scale-95 whitespace-nowrap",
            isMobile && "flex-1 h-11"
          )}
        >
          <Plus className="h-4 w-4" />
          <span>{isMobile ? "Cadastrar" : "Cadastrar Empresa"}</span>
        </Button>
      </div>
    </div>
  );
}
