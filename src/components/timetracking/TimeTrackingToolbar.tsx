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
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/ui/use-mobile";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Filter, ListFilter, Search } from "lucide-react";
import * as React from "react";
import { useState } from "react";

interface TimeTrackingToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedMes: number;
  onMesChange: (value: number) => void;
  selectedAno: number;
  onAnoChange: (value: number) => void;
  selectedPeriodo: string;
  onPeriodoChange: (value: string) => void;
}

export function TimeTrackingToolbar({
  searchTerm,
  onSearchChange,
  selectedMes,
  onMesChange,
  selectedAno,
  onAnoChange,
  selectedPeriodo,
  onPeriodoChange,
}: TimeTrackingToolbarProps) {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const hasActiveFilters = searchTerm !== "" || selectedPeriodo !== "mes";

  const clearFilters = () => {
    onSearchChange("");
    onPeriodoChange("mes");
    onMesChange(new Date().getMonth() + 1);
    onAnoChange(new Date().getFullYear());
  };

  const FilterContent = ({ isSheet = false }) => (
    <div className={cn("space-y-6", isSheet ? "px-6" : "p-4")}>
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Período</Label>
        <Select value={selectedPeriodo} onValueChange={onPeriodoChange}>
          <SelectTrigger className={cn(
            "h-11 rounded-xl bg-gray-50 border-gray-200 shadow-none focus-visible:ring-primary/20 font-medium",
            isSheet && "h-12 bg-white"
          )}>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-blue-500" />
              <SelectValue placeholder="Período" />
            </div>
          </SelectTrigger>
          <SelectContent className="z-[10001]">
            <SelectItem value="hoje">Hoje</SelectItem>
            <SelectItem value="mes">Mensal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedPeriodo === "mes" && (
        <>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Mês</Label>
            <Select value={selectedMes.toString()} onValueChange={(v) => onMesChange(parseInt(v))}>
              <SelectTrigger className={cn(
                "h-11 rounded-xl bg-gray-50 border-gray-200 shadow-none focus-visible:ring-primary/20 font-medium",
                isSheet && "h-12 bg-white"
              )}>
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent className="z-[10001]">
                {months.map((m) => (
                  <SelectItem key={m} value={m.toString()}>
                    {format(new Date(2000, m - 1, 1), "MMMM", { locale: ptBR })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Ano</Label>
            <Select value={selectedAno.toString()} onValueChange={(v) => onAnoChange(parseInt(v))}>
              <SelectTrigger className={cn(
                "h-11 rounded-xl bg-gray-50 border-gray-200 shadow-none focus-visible:ring-primary/20 font-medium",
                isSheet && "h-12 bg-white"
              )}>
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent className="z-[10001]">
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

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
              Aplicar Filtros
            </Button>
          </SheetClose>
        )}
      </div>
    </div>
  );

  const FilterButton = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Button>>(
    (props, ref) => (
      <Button 
        {...props}
        ref={ref}
        variant="outline" 
        className={cn(
          "h-11 rounded-xl border-gray-200 bg-white gap-2 px-4 md:px-5 font-bold transition-all shadow-sm active:scale-95",
          isMobile && "flex-1 h-11",
          hasActiveFilters ? "text-blue-600 border-blue-100 bg-blue-50/50" : "text-slate-600 hover:bg-slate-50"
        )}
      >
        {isMobile ? <Filter className="h-4 w-4 mr-1" /> : <ListFilter className="h-4 w-4" />}
        <span>Filtros</span>
        {hasActiveFilters && (
          <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-in zoom-in-50" />
        )}
      </Button>
    )
  );
  FilterButton.displayName = "FilterButton";

  return (
    <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar funcionário..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 text-sm sm:text-base bg-white border-gray-200 focus-visible:ring-primary/20 h-11 rounded-xl shadow-none font-medium"
        />
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        {isMobile ? (
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <FilterButton />
            </SheetTrigger>
            <SheetContent 
              side="bottom" 
              className="h-auto max-h-[90vh] rounded-t-[20px] flex flex-col px-0 bg-gray-50 border-t-0 shadow-2xl"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <SheetHeader className="text-left mb-4 px-6">
                <SheetTitle className="text-xl font-bold">Filtrar Ponto</SheetTitle>
                <SheetDescription className="text-gray-500">
                  Refine o controle de ponto pelas opções abaixo.
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
              <FilterButton />
            </PopoverTrigger>
            <PopoverContent 
              className="w-[280px] p-0 rounded-2xl shadow-2xl border-gray-100 overflow-hidden" 
              align="end" 
              sideOffset={8}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <FilterContent />
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
