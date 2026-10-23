import { NativeSelect } from "@/components/ui/native-select";
import { Combobox } from "@/components/ui/combobox";
import { FilterOptions } from "@/types/enums";
import { meses, anos } from "@/utils/formatters/constants";
import { Label } from "@/components/ui/label";
import { Usuario } from "@/types/database";

interface PeriodSelectorToolbarProps {
  usuarioId?: string | null;
  collaborators?: (Usuario | { id: string | number; nome_completo: string })[];
  selectedMonth: number;
  selectedYear: number;
  selectedShift?: string;
  availableShifts?: (string | { id: string | number; label: string })[];
  onUsuarioChange?: (val: string) => void;
  onMonthChange: (val: number) => void;
  onYearChange: (val: number) => void;
  onShiftChange?: (val: string) => void;
  hideCollaboratorSelect?: boolean;
  hideShiftSelect?: boolean;
  title?: string;
}

export function PeriodSelectorToolbar({
  usuarioId,
  collaborators = [],
  selectedMonth,
  selectedYear,
  selectedShift,
  availableShifts = [],
  onUsuarioChange,
  onMonthChange,
  onYearChange,
  onShiftChange,
  hideCollaboratorSelect = false,
  hideShiftSelect = false,
}: PeriodSelectorToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3 w-full">
      {!hideCollaboratorSelect && (
        <div className="w-full md:flex-1 space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground ml-1">Colaborador</Label>
          <Combobox
            options={[
              { value: FilterOptions.TODOS, label: "Selecionar Colaborador" },
              ...collaborators.map((c) => ({ value: String(c.id), label: c.nome_completo }))
            ]}
            value={usuarioId || FilterOptions.TODOS}
            onSelect={(val) => onUsuarioChange?.(val || FilterOptions.TODOS)}
            placeholder="Selecionar Colaborador"
            searchPlaceholder="Buscar colaborador..."
            emptyText="Nenhum colaborador encontrado."
            className="h-11 rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-normal focus:bg-white focus:border-primary"
          />
        </div>
      )}

      <div className="grid grid-cols-2 md:contents gap-3">
        <div className="flex-1 space-y-1.5 min-w-[140px]">
          <Label className="text-xs font-medium text-muted-foreground ml-1">Mês</Label>
          <NativeSelect
            value={String(selectedMonth)}
            onChange={(e) => onMonthChange(Number(e.target.value))}
            className="h-11 rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-semibold"
          >
            {meses.map((label, index) => (
              <option key={index + 1} value={String(index + 1)}>
                {label}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="flex-1 space-y-1.5 min-w-[120px]">
          <Label className="text-xs font-medium text-muted-foreground ml-1">Ano</Label>
          <NativeSelect
            value={String(selectedYear)}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="h-11 rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-semibold"
          >
            {anos.map((a) => (
              <option key={a.value} value={String(a.value)}>
                {a.label}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      {!hideShiftSelect && (
        <div className="w-full md:flex-1 space-y-1.5 min-w-[160px]">
          <Label className="text-xs font-medium text-muted-foreground ml-1">Turno</Label>
          <NativeSelect
            value={selectedShift || ""}
            onChange={(e) => onShiftChange?.(e.target.value)}
            disabled={(usuarioId === FilterOptions.TODOS && !hideCollaboratorSelect) || availableShifts.length === 0}
            className="h-11 rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-semibold"
          >
            <option value="">
              {availableShifts.length === 0 ? "Nenhum turno" : "Todos os Turnos"}
            </option>
            {availableShifts.map((s, idx) => {
              const val = typeof s === "string" ? s : String(s.id);
              const label = typeof s === "string" ? s : s.label;
              return (
                <option key={val || idx} value={val}>
                  {label}
                </option>
              );
            })}
          </NativeSelect>
        </div>
      )}
    </div>
  );
}
