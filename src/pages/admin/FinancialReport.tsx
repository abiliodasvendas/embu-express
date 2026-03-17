import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLayout } from "@/contexts/LayoutContext";
import { useCollaborators, useFinancialReportViewModel } from "@/hooks";
import { useEffect } from "react";
import { FinancialReportView } from "@/components/features/financeiro/FinancialReportView";
import { Combobox } from "@/components/ui/combobox";
import { STATUS_CADASTRO } from "@/constants/cadastro";
import { meses, anos } from "@/utils/formatters/constants";

export function FinancialReport() {
    const { setPageTitle } = useLayout();
    const vm = useFinancialReportViewModel();

    useEffect(() => {
        setPageTitle(vm.isOnlyPersonal ? "Meu Extrato Financeiro" : "Relatório Financeiro");
    }, [setPageTitle, vm.isOnlyPersonal]);

    const { data: collaborators = [] } = useCollaborators({ status: STATUS_CADASTRO.ATIVO }, { enabled: vm.canViewAll });

    return (
        <div className="space-y-6 pb-24">
            <Card className="border-none shadow-sm rounded-3xl">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        {vm.canViewAll && (
                            <div className="flex-[2] w-full space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Colaborador</label>
                                <Combobox
                                    options={[
                                        { value: STATUS_CADASTRO.TODOS, label: "Todos os colaboradores" },
                                        ...collaborators.map(c => ({ value: c.id, label: c.nome_completo }))
                                    ]}
                                    value={vm.filters.selectedUsuario || STATUS_CADASTRO.TODOS}
                                    onSelect={(val) => vm.setUsuario(val || STATUS_CADASTRO.TODOS)}
                                    placeholder="Selecione um colaborador..."
                                    searchPlaceholder="Buscar colaborador..."
                                    emptyText="Nenhum colaborador encontrado."
                                    className="h-11 rounded-xl bg-white border-gray-200 focus-visible:ring-primary/20 font-medium text-gray-700 hover:bg-white hover:text-gray-700 transition-none shadow-none"
                                />
                            </div>
                        )}

                        <div className="flex-1 w-full space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Mês</label>
                            <Select value={String(vm.filters.selectedMes)} onValueChange={(v) => vm.setMonth(Number(v))}>
                                <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 focus:ring-primary/20 font-medium text-gray-700 shadow-none">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {meses.map((label, index) => (
                                        <SelectItem key={index + 1} value={String(index + 1)} className="font-medium">{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex-1 w-full space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Ano</label>
                            <Select value={String(vm.filters.selectedAno)} onValueChange={(v) => vm.setYear(Number(v))}>
                                <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 focus:ring-primary/20 font-medium text-gray-700 shadow-none">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {anos.map(a => (
                                        <SelectItem key={a.value} value={String(a.value)} className="font-medium">{a.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

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
