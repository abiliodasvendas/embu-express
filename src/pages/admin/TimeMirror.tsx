import { TimeMirrorView } from "@/components/features/ponto/TimeMirrorView";
import { PeriodSelectorToolbar } from "@/components/common/PeriodSelectorToolbar";
import { useLayout } from "@/contexts/LayoutContext";
import { useActiveCollaborators, useTimeMirrorViewModel } from "@/hooks";
import { useEffect } from "react";

export function TimeMirror() {
    const { setPageTitle } = useLayout();
    const vm = useTimeMirrorViewModel();
    const { data: collaborators = [] } = useActiveCollaborators({ enabled: !vm.isOnlyPersonal });

    useEffect(() => {
        setPageTitle(vm.isOnlyPersonal ? "Meu Espelho de Ponto" : "Espelho de Ponto");
    }, [setPageTitle, vm.isOnlyPersonal]);

    return (
        <div className="space-y-6 pb-24">
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
                hideCollaboratorSelect // Toolbar already has it
                isActionable
            />
        </div>
    );
}

export default TimeMirror;
