import { TimeMirrorView } from "@/components/features/ponto/TimeMirrorView";
import { PeriodSelectorToolbar } from "@/components/common/PeriodSelectorToolbar";
import { useLayout } from "@/contexts/LayoutContext";
import { useTimeMirrorViewModel } from "@/hooks";
import { useEffect } from "react";

export function PublicTimeMirror() {
    const { setPageTitle } = useLayout();
    const vm = useTimeMirrorViewModel();

    useEffect(() => {
        setPageTitle("Meu Espelho de Ponto");
    }, [setPageTitle]);

    return (
        <div className="space-y-6 pb-24 max-w-lg lg:max-w-5xl mx-auto md:mt-8">
            <PeriodSelectorToolbar
                selectedMonth={vm.filters.selectedMes}
                selectedYear={vm.filters.selectedAno}
                selectedShift={vm.filters.selectedTurno}
                availableShifts={vm.availableShifts}
                onMonthChange={vm.setMonth}
                onYearChange={vm.setYear}
                onShiftChange={vm.setShift}
                hideCollaboratorSelect
            />

            <TimeMirrorView 
                usuarioId={vm.usuarioId}
                selectedMonth={vm.filters.selectedMes}
                selectedYear={vm.filters.selectedAno}
                selectedShift={vm.filters.selectedTurno}
            />
        </div>
    );
}

export default PublicTimeMirror;
