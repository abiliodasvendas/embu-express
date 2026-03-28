import { TimeMirrorView } from "@/components/features/ponto/TimeMirrorView";
import { PeriodSelectorToolbar } from "@/components/common/PeriodSelectorToolbar";
import { useLayout } from "@/contexts/LayoutContext";
import { useTimeMirrorViewModel } from "@/hooks";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

export function PublicTimeMirror() {
    const { uuid } = useParams();
    const { setPageTitle } = useLayout();
    const vm = useTimeMirrorViewModel({
        uuid,
        syncWithUrl: false
    });

    useEffect(() => {
        setPageTitle("Espelho de Atividade");
    }, [setPageTitle]);

    return (
        <div className="space-y-6 pb-24 max-w-lg lg:max-w-5xl mx-auto md:mt-8">
            <PeriodSelectorToolbar
                usuarioId={vm.filters.selectedUsuario}
                collaborators={vm.collaborators}
                selectedMonth={vm.filters.selectedMes}
                selectedYear={vm.filters.selectedAno}
                selectedShift={vm.filters.selectedTurno}
                availableShifts={vm.availableShifts}
                onUsuarioChange={vm.setUsuario}
                onMonthChange={vm.setMonth}
                onYearChange={vm.setYear}
                onShiftChange={vm.setShift}
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
