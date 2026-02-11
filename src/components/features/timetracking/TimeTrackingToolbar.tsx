import { DateNavigation } from "@/components/common/DateNavigation";
import { FilterButton } from "@/components/common/FilterButton";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
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
import { STATUS_PONTO } from "@/constants/ponto";
import { useIsMobile } from "@/hooks/ui/use-mobile";
import { cn } from "@/lib/utils";
import { getStatusLabel } from "@/utils/ponto";
import { Plus, Search, X } from "lucide-react";
import { useState } from "react";

interface TimeTrackingToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  date: Date;
  onDateChange: (date: Date) => void;
  filters: {
      statusEntrada: string;
      statusSaida: string;
      usuarioId: string;
      clienteId: string;
  };
  onFiltersChange: (key: string, value: string) => void;
  onRegister: () => void;
  collaborators: any[];
  clients: any[];
  onApplyFilters: (filters: any) => void;
  hasActiveFilters?: boolean;
}

export function TimeTrackingToolbar({
  searchTerm,
  onSearchChange,
  date,
  onDateChange,
  filters,
  onFiltersChange, // Live update for Desktop
  onRegister,
  collaborators,
  clients,
  onApplyFilters,
  hasActiveFilters // Passed from hook
}: TimeTrackingToolbarProps) {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Local state for Mobile Filter Sheet
  const [sheetFilters, setSheetFilters] = useState(filters);
  const [sheetSearch, setSheetSearch] = useState(searchTerm);

  // Reset sheet state when opening
  const handleSheetOpenChange = (open: boolean) => {
      setIsSheetOpen(open);
      if (open) {
          setSheetFilters(filters);
          setSheetSearch(searchTerm);
      }
  };

  const handleApply = () => {
      // Batch apply
      onApplyFilters({
          searchTerm: sheetSearch,
          statusEntrada: sheetFilters.statusEntrada,
          statusSaida: sheetFilters.statusSaida,
          usuarioId: sheetFilters.usuarioId,
          clienteId: sheetFilters.clienteId
      });
      setIsSheetOpen(false);
  };

  const clearFilters = () => {
      onSearchChange("");
      onApplyFilters({
          statusEntrada: "todos",
          statusSaida: "todos",
          usuarioId: "todos",
          clienteId: "todos",
      });
      // Also clear local sheet state to keep it in sync
      setSheetFilters({ 
        statusEntrada: "todos", 
        statusSaida: "todos", 
        usuarioId: "todos", 
        clienteId: "todos" 
      });
      setSheetSearch("");
  };

  const clearSheetFilters = () => {
      setSheetFilters(prev => ({
          ...prev,
          statusEntrada: "todos",
          statusSaida: "todos",
          clienteId: "todos"
          // usuarioId is preserved
      }));
  };

  // Determine which values to use (Desktop = props, Mobile Sheet = local)
  // Actually, Desktop uses the same inputs?
  // Use a helper to render inputs that switches based on context.
  
  // Blue Dot logic: use hasActiveFilters prop from hook if available, else calc
  const showIndicator = hasActiveFilters; 

  const selectedCount = [
    filters.statusEntrada,
    filters.statusSaida,
    filters.usuarioId,
    filters.clienteId,
  ].filter((v) => v && v !== "todos").length;

  const FilterContent = ({ isSheet = false }) => {
      // If isSheet, use setSheetFilters/sheetSearch. Else uses onFiltersChange/onSearchChange
      
      // const currentSearch = isSheet ? sheetSearch : searchTerm; // searchTerm no longer used for Client
      const currentFilters = isSheet ? sheetFilters : filters;

      /*
      const updateSearch = (val: string) => {
          if (isSheet) setSheetSearch(val);
          else onSearchChange(val);
      };
      */

      const updateFilter = (key: string, val: string) => {
          if (isSheet) setSheetFilters(prev => ({ ...prev, [key]: val }));
          else onFiltersChange(key, val);
      };

      return (
    <div className={cn("space-y-6", isSheet ? "px-6 pb-6" : "p-4")}>
      
       <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Cliente</Label>
        <Combobox
          options={[{ value: "todos", label: "Todos os Clientes" }, ...clients.map(c => ({ value: c.id.toString(), label: c.nome_fantasia }))]}
          value={currentFilters.clienteId}
          onSelect={(val) => updateFilter("clienteId", val || "todos")}
          placeholder="Todos os Clientes"
          searchPlaceholder="Buscar cliente..."
          emptyText="Nenhum cliente encontrado."
          className={cn(
            "h-11 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-primary/20 font-medium text-foreground hover:bg-gray-50 hover:text-foreground transition-none",
            isSheet && "h-12 bg-white hover:bg-white"
          )}
          modal={isSheet} 
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Status Entrada</Label>
        <Select value={currentFilters.statusEntrada} onValueChange={(v) => updateFilter("statusEntrada", v)}>
          <SelectTrigger className={cn(
            "h-11 rounded-xl bg-gray-50 border-gray-200 shadow-none focus-visible:ring-primary/20 font-medium",
            isSheet && "h-12 bg-white"
          )}>
            <div className="flex items-center">
              <SelectValue placeholder="Status Entrada" />
            </div>
          </SelectTrigger>
          <SelectContent className="z-[10001]">
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value={STATUS_PONTO.ENTRADA.NO_HORARIO}>{getStatusLabel(STATUS_PONTO.ENTRADA.NO_HORARIO, 'entrada')}</SelectItem>
            <SelectItem value={STATUS_PONTO.ENTRADA.ATRASO}>{getStatusLabel(STATUS_PONTO.ENTRADA.ATRASO, 'entrada')}</SelectItem>
            <SelectItem value={STATUS_PONTO.ENTRADA.MUITO_ATRASO}>{getStatusLabel(STATUS_PONTO.ENTRADA.MUITO_ATRASO, 'entrada')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Status Saída</Label>
        <Select value={currentFilters.statusSaida} onValueChange={(v) => updateFilter("statusSaida", v)}>
          <SelectTrigger className={cn(
            "h-11 rounded-xl bg-gray-50 border-gray-200 shadow-none focus-visible:ring-primary/20 font-medium",
            isSheet && "h-12 bg-white"
          )}>
            <div className="flex items-center">
              <SelectValue placeholder="Status Saída" />
            </div>
          </SelectTrigger>
          <SelectContent className="z-[10001]">
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="trabalhando">{getStatusLabel(STATUS_PONTO.SAIDA.TRABALHANDO, 'saida')}</SelectItem>
            <SelectItem value={STATUS_PONTO.SAIDA.NO_HORARIO}>{getStatusLabel(STATUS_PONTO.SAIDA.NO_HORARIO, 'saida')}</SelectItem>
            <SelectItem value={STATUS_PONTO.SAIDA.HORA_EXTRA}>{getStatusLabel(STATUS_PONTO.SAIDA.HORA_EXTRA, 'saida')}</SelectItem>
             <SelectItem value={STATUS_PONTO.SAIDA.HORA_EXTRA_EXCESSIVA}>{getStatusLabel(STATUS_PONTO.SAIDA.HORA_EXTRA_EXCESSIVA, 'saida')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

    </div>
  );
  };

  return (
    <div className="flex flex-col space-y-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             {/* 1. Date Navigation */}
            <DateNavigation date={date} onNavigate={onDateChange} />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
            <Combobox 
                options={[{ value: "todos", label: "Todos os Colaboradores" }, ...collaborators.map(f => ({ value: f.id.toString(), label: f.nome_completo }))]}
                value={filters.usuarioId === "todos" ? "" : filters.usuarioId}
                onSelect={(val) => onFiltersChange("usuarioId", val || "todos")}
                placeholder="Buscar colaborador..."
                searchPlaceholder="Digite o nome..."
                emptyText="Nenhum colaborador encontrado."
                startIcon={<Search className="h-4 w-4 text-gray-400" />}
                className="h-11 rounded-xl bg-white border-gray-200 focus-visible:ring-primary/20 font-medium shadow-none text-sm sm:text-base hover:bg-white transition-none pl-9"
            />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
            {isMobile ? (
              <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
                <SheetTrigger asChild>
                  <FilterButton 
                    hasActiveFilters={hasActiveFilters}
                    isMobile={isMobile}
                    selectedCount={selectedCount}
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
                      Refine a visualização pelas opções abaixo.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto">
                    <FilterContent isSheet={true} />
                  </div>
                   <div className="p-4 border-t bg-white mt-auto flex gap-3">
                    <Button
                      variant="outline"
                      onClick={clearSheetFilters}
                      className="flex-1 h-12 rounded-xl text-slate-500 font-bold border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
                    >
                      Limpar
                    </Button>
                    <Button
                      onClick={handleApply}
                      className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-sm font-bold transition-all active:scale-95 text-white"
                    >
                      Aplicar
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <div className="flex items-center gap-3">
                {hasActiveFilters && (
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
                        hasActiveFilters={selectedCount > 0}
                        isMobile={isMobile}
                        selectedCount={selectedCount}
                    />
                    </PopoverTrigger>
                    <PopoverContent 
                    className="w-[320px] p-0 rounded-2xl shadow-2xl border-gray-100 overflow-hidden" 
                    align="end" 
                    sideOffset={8}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                    <FilterContent />
                    </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Mobile Register Button */}
            <Button
                onClick={onRegister}
                className={cn(
                  "bg-blue-600 hover:bg-blue-700 h-11 rounded-xl gap-2 shadow-sm font-bold text-white transition-all active:scale-95 whitespace-nowrap",
                  isMobile && "flex-1 h-11"
                )}
              >
                <Plus className="h-4 w-4" />
                <span>Novo Registro</span>
            </Button>
        </div>
        </div>
    </div>
  );
}
