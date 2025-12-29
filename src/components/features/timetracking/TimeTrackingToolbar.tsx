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
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { STATUS_PONTO } from "@/constants/ponto";
import { useIsMobile } from "@/hooks/ui/use-mobile";
import { cn } from "@/lib/utils";
import { getStatusLabel } from "@/utils/ponto";
import { Plus, Search, Wand2 } from "lucide-react";
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
  };
  onFiltersChange: (key: string, value: string) => void;
  onGenerateMockData: () => void;
  isGenerating?: boolean;
  onRegister: () => void;
  collaborators: any[];
  clients: any[];
}

export function TimeTrackingToolbar({
  searchTerm,
  onSearchChange,
  date,
  onDateChange,
  filters,
  onFiltersChange,
  onGenerateMockData,
  isGenerating,
  onRegister,
  collaborators,
  clients
}: TimeTrackingToolbarProps) {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Consider client search as filter too
  const hasActiveFilters = searchTerm !== "" || filters.statusEntrada !== "todos" || filters.statusSaida !== "todos" || filters.usuarioId !== "todos";
  
  const selectedCount = [
    searchTerm,
    filters.statusEntrada, 
    filters.statusSaida, 
    filters.usuarioId
  ].filter(v => v !== "todos" && v !== "").length;

  const clearFilters = () => {
    onSearchChange("");
    onFiltersChange("statusEntrada", "todos");
    onFiltersChange("statusSaida", "todos");
    onFiltersChange("usuarioId", "todos");
  };

  const FilterContent = ({ isSheet = false }) => (
    <div className={cn("space-y-6", isSheet ? "px-6" : "p-4")}>
      
       <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Cliente</Label>
        <Combobox
          options={clients.map(c => ({ value: c.nome_fantasia, label: c.nome_fantasia }))}
          value={searchTerm}
          onSelect={(val) => onSearchChange(val)}
          placeholder="Selecione um cliente"
          searchPlaceholder="Buscar cliente..."
          emptyText="Nenhum cliente encontrado."
          className={cn(
            "h-11 rounded-xl bg-gray-50 border-gray-200 font-medium text-foreground hover:bg-gray-50 transition-none",
            isSheet && "h-12 bg-white hover:bg-white"
          )}
          modal={isSheet} // If in Sheet, acts as modal. If in Popover... keep false hopefully.
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Status Entrada</Label>
        <Select value={filters.statusEntrada} onValueChange={(v) => onFiltersChange("statusEntrada", v)}>
          <SelectTrigger className={cn(
            "h-11 rounded-xl bg-gray-50 border-gray-200 shadow-none focus-visible:ring-primary/20 font-medium",
            isSheet && "h-12 bg-white"
          )}>
            <div className="flex items-center">
              <SelectValue placeholder="Status Entrada" />
            </div>
          </SelectTrigger>
          <SelectContent className="z-[10001]">
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value={STATUS_PONTO.ENTRADA.NO_HORARIO}>{getStatusLabel(STATUS_PONTO.ENTRADA.NO_HORARIO, 'entrada')}</SelectItem>
            <SelectItem value={STATUS_PONTO.ENTRADA.ATRASO}>{getStatusLabel(STATUS_PONTO.ENTRADA.ATRASO, 'entrada')}</SelectItem>
            <SelectItem value={STATUS_PONTO.ENTRADA.MUITO_ATRASO}>{getStatusLabel(STATUS_PONTO.ENTRADA.MUITO_ATRASO, 'entrada')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Status Saída</Label>
        <Select value={filters.statusSaida} onValueChange={(v) => onFiltersChange("statusSaida", v)}>
          <SelectTrigger className={cn(
            "h-11 rounded-xl bg-gray-50 border-gray-200 shadow-none focus-visible:ring-primary/20 font-medium",
            isSheet && "h-12 bg-white"
          )}>
            <div className="flex items-center">
              <SelectValue placeholder="Status Saída" />
            </div>
          </SelectTrigger>
          <SelectContent className="z-[10001]">
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="trabalhando">{getStatusLabel(STATUS_PONTO.SAIDA.TRABALHANDO, 'saida')}</SelectItem>
            <SelectItem value={STATUS_PONTO.SAIDA.NO_HORARIO}>{getStatusLabel(STATUS_PONTO.SAIDA.NO_HORARIO, 'saida')}</SelectItem>
            <SelectItem value={STATUS_PONTO.SAIDA.HORA_EXTRA}>{getStatusLabel(STATUS_PONTO.SAIDA.HORA_EXTRA, 'saida')}</SelectItem>
             <SelectItem value={STATUS_PONTO.SAIDA.HORA_EXTRA_EXCESSIVA}>{getStatusLabel(STATUS_PONTO.SAIDA.HORA_EXTRA_EXCESSIVA, 'saida')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={cn("flex items-center gap-3 pt-4", isSheet && "pb-6")}>
         <Button 
          variant="outline" 
          onClick={clearFilters} 
          className={cn(
            "flex-1 h-11 rounded-xl text-slate-500 font-bold border-gray-200 hover:bg-gray-50 transition-all active:scale-95",
            isSheet && "h-12"
          )}
        >
          Limpar
        </Button>
        {isSheet && (
          <SheetClose asChild>
            <Button className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-sm font-bold transition-all active:scale-95 text-white">
              Aplicar
            </Button>
          </SheetClose>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col space-y-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             {/* 1. Date Navigation */}
            <DateNavigation date={date} onNavigate={onDateChange} />

            {/* 2. Actions */}
            <Button 
                variant="outline"
                className="h-10 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-semibold gap-2 transition-all active:scale-95 hidden md:flex rounded-xl"
                onClick={onGenerateMockData}
                disabled={isGenerating}
            >
                <Wand2 className={cn("w-4 h-4", isGenerating && "animate-spin")} />
                {isGenerating ? "Gerando..." : "Gerar Dados Fakes"}
            </Button>

            <Button 
                className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 transition-all active:scale-95 hidden md:flex rounded-xl shadow-sm"
                onClick={onRegister}
            >
                <Plus className="w-4 h-4" />
                <span>Novo Registro</span>
            </Button>
        </div>

        {/* Mobile Mock Button */}
        <div className="md:hidden">
             <Button
                onClick={onGenerateMockData}
                variant="outline"
                className="w-full gap-2 uppercase font-bold text-blue-600 border-blue-100 hover:bg-blue-50 rounded-xl h-11"
                disabled={isGenerating}
              >
                <Wand2 className={cn("h-4 w-4", isGenerating && "animate-spin")} />
                GERAR DADOS FAKES
              </Button>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
            <Combobox 
                options={collaborators.map(f => ({ value: f.id.toString(), label: f.nome_completo }))}
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
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <FilterButton 
                    hasActiveFilters={hasActiveFilters}
                    isMobile={isMobile}
                    selectedCount={selectedCount}
                  />
                </SheetTrigger>
                <SheetContent 
                  side="bottom" 
                  className="h-auto max-h-[90vh] rounded-t-[20px] flex flex-col px-0 bg-gray-50 border-t-0 shadow-2xl"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <SheetHeader className="text-left mb-4 px-6">
                    <SheetTitle className="text-xl font-bold">Filtrar Ponto</SheetTitle>
                    <SheetDescription className="text-gray-500">
                      Refine a visualização por cliente ou status.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto">
                    <FilterContent isSheet={true} />
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
                <Popover>
                    <PopoverTrigger asChild>
                    <FilterButton 
                        hasActiveFilters={hasActiveFilters}
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

            {/* Mobile Register Button */}
            <Button
                onClick={onRegister}
                className={cn(
                  "bg-blue-600 hover:bg-blue-700 h-11 rounded-xl gap-2 shadow-sm font-bold text-white transition-all active:scale-95 whitespace-nowrap md:hidden flex-1"
                )}
              >
                <Plus className="h-4 w-4" />
                <span>Novo Cadastro</span>
            </Button>
        </div>
        </div>
    </div>
  );
}
