import { TimeMirrorView } from "@/components/features/ponto/TimeMirrorView";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLayout } from "@/contexts/LayoutContext";
import { useActiveCollaborators, useTimeMirrorViewModel } from "@/hooks";
import { meses, anos } from "@/utils/formatters/constants";
import { useEffect } from "react";
import { Combobox } from "@/components/ui/combobox";
import { STATUS_CADASTRO } from "@/constants/cadastro";

export function TimeMirror() {
    const { setPageTitle } = useLayout();
    const vm = useTimeMirrorViewModel();

    useEffect(() => {
        setPageTitle("Espelho de Ponto");
    }, [setPageTitle]);

    const { data: collaborators = [] } = useActiveCollaborators();

    return (
        <div className="space-y-6 pb-24">
            <Card className="border-none shadow-sm rounded-3xl">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-[2] w-full space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Colaborador</label>
                            <Combobox
                                options={[
                                    { value: STATUS_CADASTRO.TODOS, label: "Selecione um colaborador" },
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

                        <div className="flex-1 w-full space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Turno</label>
                            <Select value={String(vm.filters.selectedTurno)} onValueChange={(v) => vm.setShift(v)}>
                                <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 focus:ring-primary/20 font-medium text-gray-700 shadow-none">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value={STATUS_CADASTRO.TODOS} className="font-medium">Todos os turnos</SelectItem>
                                    {vm.availableShifts.map(s => (
                                        <SelectItem key={s} value={s} className="font-medium">{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <TimeMirrorView 
                usuarioId={vm.usuarioId}
                selectedMonth={vm.filters.selectedMes}
                selectedYear={vm.filters.selectedAno}
                selectedShift={vm.filters.selectedTurno}
                hideCollaboratorSelect
            />
        </div>
    );
}

export default TimeMirror;
