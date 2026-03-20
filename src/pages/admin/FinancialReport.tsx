import { Card, CardContent } from "@/components/ui/card";
import { useLayout } from "@/contexts/LayoutContext";
import { useCollaborators, useFinancialReportViewModel } from "@/hooks";
import { useEffect } from "react";
import { FinancialReportView } from "@/components/features/financeiro/FinancialReportView";
import { StatusUsuario } from "@/types/enums";
import { PeriodSelectorToolbar } from "@/components/common/PeriodSelectorToolbar";

export function FinancialReport() {
    const { setPageTitle } = useLayout();
    const vm = useFinancialReportViewModel();

    useEffect(() => {
        setPageTitle(vm.isOnlyPersonal ? "Meu Extrato Financeiro" : "Relatório Financeiro");
    }, [setPageTitle, vm.isOnlyPersonal]);

    const { data: collaborators = [] } = useCollaborators({}, { enabled: vm.canViewAll });

    return (
        <div className="space-y-6 pb-24">
            <PeriodSelectorToolbar
                usuarioId={vm.filters.selectedUsuario}
                collaborators={collaborators}
                selectedMonth={vm.filters.selectedMes}
                selectedYear={vm.filters.selectedAno}
                onUsuarioChange={vm.setUsuario}
                onMonthChange={vm.setMonth}
                onYearChange={vm.setYear}
                hideCollaboratorSelect={!vm.canViewAll}
                hideShiftSelect
            />

            <FinancialReportView
                usuarioId={vm.usuarioId}
                colaboradorNome={vm.colaboradorNome}
                selectedMonth={vm.filters.selectedMes}
                selectedYear={vm.filters.selectedAno}
            />
        </div>
    );
}

export default FinancialReport;
