import { DateNavigation } from "@/components/common/DateNavigation";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { FilterOptions } from "@/types/enums";
import { RefreshCcw } from "lucide-react";
import { Client, Usuario } from "@/types/database";

interface TimeTrackingToolbarProps {
  date: Date;
  onDateChange: (date: Date) => void;
  filters: {
    colaboradorId: string;
    clienteId: string;
    turno: string;
  };
  onFiltersChange: (key: string, value: string) => void;
  collaborators: (Usuario | { id: string | number; nome_completo: string })[];
  clients: (Client | { id: string | number; nome_fantasia: string })[];
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
    <div className="flex flex-col space-y-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex items-end gap-3">
          <div className="flex flex-col space-y-1.5 w-full sm:w-auto">
            <Label className="text-xs font-medium text-muted-foreground ml-1">Data</Label>
            <DateNavigation date={date} onNavigate={onDateChange} />
          </div>
          {countdown !== undefined && (
            <div className="flex items-center gap-2 px-3.5 h-11 rounded-[18px] bg-muted/60 border border-border min-w-[110px] justify-center transition-all shrink-0">
              {isLoading ? (
                <>
                  <RefreshCcw className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider animate-pulse">
                    Atualizando...
                  </span>
                </>
              ) : (
                <>
                  <RefreshCcw className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-semibold text-foreground tabular-nums tracking-wider">
                    {countdown}s
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 w-full lg:w-auto">
          <div className="flex flex-col space-y-1.5 flex-1 sm:flex-initial sm:min-w-[220px]">
            <Label className="text-xs font-medium text-muted-foreground ml-1">Colaborador</Label>
            <Combobox
              options={[
                { value: FilterOptions.TODOS, label: "Todos os Colaboradores" },
                ...collaborators.map((c) => ({ value: String(c.id), label: c.nome_completo }))
              ]}
              value={filters.colaboradorId === FilterOptions.TODOS ? "" : filters.colaboradorId}
              onSelect={(val) => onFiltersChange("colaboradorId", val || FilterOptions.TODOS)}
              placeholder="Todos os Colaboradores"
              searchPlaceholder="Buscar colaborador..."
              emptyText="Nenhum colaborador encontrado."
              className="h-11 rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-normal focus:bg-white focus:border-primary"
            />
          </div>

          <div className="flex flex-col space-y-1.5 flex-1 sm:flex-initial sm:min-w-[200px]">
            <Label className="text-xs font-medium text-muted-foreground ml-1">Cliente</Label>
            <Combobox
              options={[
                { value: FilterOptions.TODOS, label: "Todos os Clientes" },
                ...clients.map((c) => ({ value: String(c.id), label: c.nome_fantasia }))
              ]}
              value={filters.clienteId === FilterOptions.TODOS ? "" : filters.clienteId}
              onSelect={(val) => onFiltersChange("clienteId", val || FilterOptions.TODOS)}
              placeholder="Todos os Clientes"
              searchPlaceholder="Buscar cliente..."
              emptyText="Nenhum cliente encontrado."
              className="h-11 rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-normal focus:bg-white focus:border-primary"
            />
          </div>

          <div className="flex flex-col space-y-1.5 w-full sm:w-[170px] shrink-0">
            <Label className="text-xs font-medium text-muted-foreground ml-1">Turno</Label>
            <NativeSelect
              value={filters.turno}
              onChange={(e) => onFiltersChange("turno", e.target.value)}
              className="h-11 rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-semibold"
            >
              <option value={FilterOptions.TODOS}>Todos os Turnos</option>
              {uniqueShifts.map((shift) => (
                <option key={shift} value={shift}>
                  {shift}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>
      </div>
    </div>
  );
}
