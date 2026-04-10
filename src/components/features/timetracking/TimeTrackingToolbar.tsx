import { DateNavigation } from "@/components/common/DateNavigation";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterOptions } from "@/types/enums";
import { RefreshCcw } from "lucide-react";

interface TimeTrackingToolbarProps {
  date: Date;
  onDateChange: (date: Date) => void;
  filters: {
    colaboradorId: string;
    clienteId: string;
    turno: string;
  };
  onFiltersChange: (key: string, value: string) => void;
  collaborators: any[];
  clients: any[];
  uniqueShifts: string[];
  countdown?: number;
  isLoading?: boolean;
}

export function TimeTrackingToolbar({
  date,
  onDateChange,
  filters,
  onFiltersChange,
  collaborators,
  clients,
  uniqueShifts,
  countdown,
  isLoading
}: TimeTrackingToolbarProps) {
  return (
    <div className="flex flex-col space-y-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex items-end gap-3">
          <div className="flex flex-col space-y-1.5">
            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Data</Label>
            <DateNavigation date={date} onNavigate={onDateChange} />
          </div>
          {countdown !== undefined && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50/80 border border-gray-100 dark:bg-slate-800/40 dark:border-slate-700/50 backdrop-blur-sm min-w-[110px] h-[44px] justify-center transition-all duration-300">
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

        <div className="flex flex-col sm:flex-row items-end gap-3 w-full lg:w-auto">
          {/* Filtro de Colaborador */}
          <div className="flex flex-col space-y-1.5 flex-1 sm:flex-initial min-w-[200px] w-full">
            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Colaborador</Label>
            <Combobox
              options={[{ value: FilterOptions.TODOS, label: "Todos os Colaboradores" }, ...collaborators.map(c => ({ value: c.id.toString(), label: c.nome_completo }))]}
              value={filters.colaboradorId === FilterOptions.TODOS ? "" : filters.colaboradorId}
              onSelect={(val) => onFiltersChange("colaboradorId", val || FilterOptions.TODOS)}
              placeholder="Todos os Colaboradores"
              searchPlaceholder="Buscar colaborador..."
              emptyText="Nenhum colaborador encontrado."
              className="h-11 rounded-xl bg-white border-gray-200 focus-visible:ring-primary/20 font-medium shadow-none text-sm text-gray-600 hover:bg-white transition-none"
            />
          </div>

          {/* Filtro de Cliente */}
          <div className="flex flex-col space-y-1.5 flex-1 sm:flex-initial min-w-[200px] w-full">
            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Cliente</Label>
            <Combobox
              options={[{ value: FilterOptions.TODOS, label: "Todos os Clientes" }, ...clients.map(c => ({ value: c.id.toString(), label: c.nome_fantasia }))]}
              value={filters.clienteId === FilterOptions.TODOS ? "" : filters.clienteId}
              onSelect={(val) => onFiltersChange("clienteId", val || FilterOptions.TODOS)}
              placeholder="Todos os Clientes"
              searchPlaceholder="Buscar cliente..."
              emptyText="Nenhum cliente encontrado."
              className="h-11 rounded-xl bg-white border-gray-200 focus-visible:ring-primary/20 font-medium shadow-none text-sm text-gray-600 hover:bg-white transition-none"
            />
          </div>

          {/* Filtro de Turno */}
          <div className="flex flex-col space-y-1.5 w-full sm:w-[160px] shrink-0">
            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Turno</Label>
            <Select value={filters.turno} onValueChange={(v) => onFiltersChange("turno", v)}>
              <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 shadow-none focus-visible:ring-primary/20 font-medium text-gray-600">
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
        </div>
      </div>
    </div>
  );
}
