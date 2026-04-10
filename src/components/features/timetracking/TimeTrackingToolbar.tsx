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
import { FilterOptions } from "@/types/enums";
import { useIsMobile } from "@/hooks/ui/use-mobile";
import { cn } from "@/lib/utils";
import { Plus, Search, X, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/constants/permissions.enum";

interface TimeTrackingToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  date: Date;
  onDateChange: (date: Date) => void;
  filters: {
    usuarioId: string;
    clienteId: string;
    turno: string;
  };
  onFiltersChange: (key: string, value: string) => void;
  onRegister: () => void;
  collaborators: any[];
  clients: any[];
  uniqueShifts: string[];
  onApplyFilters: (filters: any) => void;
  onClearFilters: () => void;
  hasActiveFilters?: boolean;
  countdown?: number;
  isLoading?: boolean;
}

export function TimeTrackingToolbar({
  searchTerm,
  onSearchChange,
  date,
  onDateChange,
  filters,
  onFiltersChange,
  onRegister,
  collaborators,
  clients,
  uniqueShifts,
  onApplyFilters,
  onClearFilters,
  hasActiveFilters,
  countdown,
  isLoading
}: TimeTrackingToolbarProps) {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Local state for Mobile Filter Sheet
  const [sheetFilters, setSheetFilters] = useState(filters);
  const [sheetSearch, setSheetSearch] = useState(searchTerm);

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (open) {
      setSheetFilters(filters);
      setSheetSearch(searchTerm);
    }
  };

  const handleApply = () => {
    onApplyFilters({
      searchTerm: sheetSearch,
      usuarioId: sheetFilters.usuarioId,
      clienteId: sheetFilters.clienteId,
      turno: sheetFilters.turno
    });
    setIsSheetOpen(false);
  };

  const clearFilters = () => {
    onClearFilters();
    setSheetFilters({
      usuarioId: FilterOptions.TODOS,
      clienteId: FilterOptions.TODOS,
      turno: FilterOptions.TODOS
    });
    setSheetSearch("");
  };

  const clearSheetFilters = () => {
    setSheetFilters(prev => ({
      ...prev,
      clienteId: FilterOptions.TODOS,
      turno: FilterOptions.TODOS
    }));
  };

  const selectedCount = [
    filters.usuarioId,
    filters.clienteId,
    filters.turno,
    searchTerm
  ].filter((v) => v && v !== FilterOptions.TODOS && v !== "").length;

  const FilterContent = ({ isSheet = false }) => {
    const currentFilters = isSheet ? sheetFilters : filters;

    const updateFilter = (key: string, val: string) => {
      if (isSheet) setSheetFilters(prev => ({ ...prev, [key]: val }));
      else onFiltersChange(key, val);
    };

    return (
      <div className={cn("space-y-6", isSheet ? "px-6 pb-6" : "p-4")}>
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Cliente</Label>
          <Combobox
            options={[{ value: FilterOptions.TODOS, label: "Todos os Clientes" }, ...clients.map(c => ({ value: c.id.toString(), label: c.nome_fantasia }))]}
            value={currentFilters.clienteId === FilterOptions.TODOS ? "" : currentFilters.clienteId}
            onSelect={(val) => updateFilter("clienteId", val || FilterOptions.TODOS)}
            placeholder="Todos os Clientes"
            searchPlaceholder="Buscar cliente..."
            emptyText="Nenhum cliente encontrado."
            className={cn(
              "h-11 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-primary/20 font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-700 transition-none",
              isSheet && "h-12 bg-white hover:bg-white"
            )}
            modal={isSheet}
          />
        </div>

        {/* Turno is moved to top row on Desktop, but kept in Sheet for Mobile */}
        {isSheet && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Turno</Label>
            <Select value={currentFilters.turno} onValueChange={(v) => updateFilter("turno", v)}>
              <SelectTrigger className="h-12 bg-white rounded-xl border-gray-200 shadow-none focus-visible:ring-primary/20 font-medium text-gray-600">
                <SelectValue placeholder="Todos os Turnos" />
              </SelectTrigger>
              <SelectContent className="z-[10001]">
                <SelectItem value={FilterOptions.TODOS}>Todos os Turnos</SelectItem>
                {uniqueShifts.map(shift => (
                  <SelectItem key={shift} value={shift}>{shift}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <DateNavigation date={date} onNavigate={onDateChange} />
          {countdown !== undefined && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50/80 border border-gray-100 dark:bg-slate-800/40 dark:border-slate-700/50 backdrop-blur-sm min-w-[110px] justify-center transition-all duration-300">
              {isLoading ? (
                <>
                  <RefreshCcw className="h-3.5 w-3.5 text-gray-400 animate-spin" />
                  <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider animate-pulse">
                    Atualizando...
                  </span>
                </>
              ) : (
                <>
                  <RefreshCcw className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 tabular-nums tracking-wider">
                    {countdown}s
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-900 h-11 px-3 order-last sm:order-none w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-1.5" />
              Limpar
            </Button>
          )}

          <div className="relative flex-1 w-full sm:w-64 lg:w-72">
            <Combobox
              options={[{ value: FilterOptions.TODOS, label: "Todos os Colaboradores" }, ...collaborators.map(f => ({ value: f.id.toString(), label: f.nome_completo }))]}
              value={filters.usuarioId === FilterOptions.TODOS ? "" : filters.usuarioId}
              onSelect={(val) => onFiltersChange("usuarioId", val || FilterOptions.TODOS)}
              placeholder="Buscar colaborador..."
              searchPlaceholder="Digite o nome..."
              emptyText="Nenhum colaborador encontrado."
              startIcon={<Search className="h-4 w-4 text-gray-400" />}
              className="h-11 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-primary/20 font-medium shadow-none text-sm text-gray-600 hover:bg-gray-50 transition-none pl-9"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!isMobile && (
              <Select value={filters.turno} onValueChange={(v) => onFiltersChange("turno", v)}>
                <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-200 shadow-none focus-visible:ring-primary/20 font-medium text-gray-600 w-[160px] shrink-0">
                  <SelectValue placeholder="Todos os Turnos" />
                </SelectTrigger>
                <SelectContent className="z-[10001]">
                  <SelectItem value={FilterOptions.TODOS}>Todos os Turnos</SelectItem>
                  {uniqueShifts.map(shift => (
                    <SelectItem key={shift} value={shift}>{shift}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {!isMobile && (
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
            )}

            {isMobile && (
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
                  aria-describedby={undefined}
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
            )}

            <Can I={PERMISSIONS.PONTO.ADMIN_CRIAR}>
              <Button
                onClick={onRegister}
                className={cn(
                  "bg-blue-600 hover:bg-blue-700 h-11 rounded-xl gap-2 shadow-sm font-bold text-white transition-all active:scale-95 whitespace-nowrap",
                  isMobile && "flex-1 h-11"
                )}
              >
                <Plus className="h-4 w-4" />
                <span>{isMobile ? "Novo" : "Novo Registro"}</span>
              </Button>
            </Can>
          </div>
        </div>
      </div>
    </div>
  );
}
