import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLayout } from "@/contexts/LayoutContext";
import { useCollaborators } from "@/hooks/api/useCollaborators";
import { useEffect } from "react";
import { FinancialReportView } from "@/components/features/financeiro/FinancialReportView";
import { useFilters } from "@/hooks/ui/useFilters";
import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { Combobox } from "@/components/ui/combobox";
import { STATUS_CADASTRO } from "@/constants/cadastro";
import { meses, anos } from "@/utils/formatters/constants";
import { useMemo } from "react";

export function FinancialReport() {
    const { setPageTitle } = useLayout();
    const { can, profile } = usePermissions();
    const { 
        selectedUsuario: selectedCollaborator = "", 
        setSelectedUsuario: setSelectedCollaborator = () => {},
        selectedMes: selectedMonth = new Date().getMonth() + 1,
        setSelectedMes: setSelectedMonth = () => {},
        selectedAno: selectedYear = new Date().getFullYear(),
        setSelectedAno: setSelectedYear = () => {},
    } = useFilters({ 
        usuarioParam: "usuario",
        mesParam: "mes",
        anoParam: "ano"
    });

    // Lógica Híbrida de Permissões
    const canViewAll = can(PERMISSIONS.FINANCEIRO.EXTRATO);
    const canViewOwn = can(PERMISSIONS.FINANCEIRO.VER_MEU);

    // Prioridade: Admin sobrepõe Pessoal
    const isOnlyPersonal = canViewOwn && !canViewAll;

    useEffect(() => {
        setPageTitle(isOnlyPersonal ? "Meu Extrato Financeiro" : "Relatório Financeiro");
    }, [setPageTitle, isOnlyPersonal]);

    const { data: collaborators = [] } = useCollaborators({ status: "ATIVO" }, { enabled: canViewAll });

    // Se for apenas pessoal, forçamos o valor do perfil
    const finalUsuarioId = isOnlyPersonal ? profile?.id : (selectedCollaborator === 'todos' ? undefined : selectedCollaborator);
    const finalColaboradorNome = isOnlyPersonal ? profile?.nome_completo : collaborators.find(c => c.id === selectedCollaborator)?.nome_completo;

    return (
        <div className="space-y-6 pb-24">
            {/* Global Filters */}
            <Card className="border-none shadow-sm rounded-3xl">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        {/* Global Collaborator Filter - Só aparece se tiver permissão Admin */}
                        {canViewAll && (
                            <div className="flex-[2] w-full space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Colaborador</label>
                                <Combobox
                                    options={[
                                        { value: STATUS_CADASTRO.TODOS, label: "Todos os colaboradores" },
                                        ...collaborators.map(c => ({ value: c.id, label: c.nome_completo }))
                                    ]}
                                    value={selectedCollaborator}
                                    onSelect={(val) => setSelectedCollaborator(val || STATUS_CADASTRO.TODOS)}
                                    placeholder="Selecione um colaborador..."
                                    searchPlaceholder="Buscar colaborador..."
                                    emptyText="Nenhum colaborador encontrado."
                                    className="h-11 rounded-xl bg-white border-gray-200 focus-visible:ring-primary/20 font-medium text-gray-700 hover:bg-white hover:text-gray-700 transition-none shadow-none"
                                />
                            </div>
                        )}

                        {/* Mês Select */}
                        <div className="flex-1 w-full space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Mês</label>
                            <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
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

                        {/* Ano Select */}
                        <div className="flex-1 w-full space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Ano</label>
                            <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
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
                usuarioId={finalUsuarioId}
                colaboradorNome={finalColaboradorNome}
            />
        </div>
    );
}

export default FinancialReport;
