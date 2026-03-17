import { TimeMirrorView } from "@/components/features/ponto/TimeMirrorView";
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
        <div className="pb-24">
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
