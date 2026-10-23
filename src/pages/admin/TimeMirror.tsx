import { TimeMirrorView } from "@/components/features/ponto/TimeMirrorView";
import { PeriodSelectorToolbar } from "@/components/common/PeriodSelectorToolbar";
import { useLayout } from "@/contexts/LayoutContext";
import { useActiveCollaborators, useTimeMirrorViewModel } from "@/hooks";
import { useEffect } from "react";
import { Clock } from "lucide-react";

export function TimeMirror() {
  const { setPageTitle } = useLayout();
  const vm = useTimeMirrorViewModel();
  const { data: collaborators = [] } = useActiveCollaborators({ enabled: !vm.isOnlyPersonal });

  useEffect(() => {
    setPageTitle("Espelho de Atividade");
  }, [setPageTitle]);

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Espelho de Atividade
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Extrato detalhado de ponto, saldo de horas, atrasos e ocorrências operacionais
            </p>
          </div>
        </div>
      </div>

      <PeriodSelectorToolbar
        usuarioId={vm.filters.selectedUsuario}
        collaborators={collaborators}
        selectedMonth={vm.filters.selectedMes}
        selectedYear={vm.filters.selectedAno}
        selectedShift={vm.filters.selectedTurno}
        availableShifts={vm.availableShifts}
        onUsuarioChange={vm.setUsuario}
        onMonthChange={vm.setMonth}
        onYearChange={vm.setYear}
        onShiftChange={vm.setShift}
        hideCollaboratorSelect={vm.isOnlyPersonal}
      />

      <TimeMirrorView
        usuarioId={vm.usuarioId}
        selectedMonth={vm.filters.selectedMes}
        selectedYear={vm.filters.selectedAno}
        selectedShift={vm.filters.selectedTurno}
        hideCollaboratorSelect
        isActionable
      />
    </div>
  );
}

export default TimeMirror;
