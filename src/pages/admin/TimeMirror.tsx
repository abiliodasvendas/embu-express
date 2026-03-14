import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLayout } from "@/contexts/LayoutContext";
import { useCollaborators } from "@/hooks/api/useCollaborators";
import { useEffect, useState, useMemo } from "react";
import { TimeMirrorView } from "@/components/features/ponto/TimeMirrorView";
import { useFilters } from "@/hooks/ui/useFilters";
import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { meses, anos } from "@/utils/formatters/constants";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { queryClient } from "@/services/queryClient";
import { STATUS_CADASTRO } from "@/constants/cadastro";
import { ROLES } from "@/constants/permissions.enum";
import { Combobox } from "@/components/ui/combobox";

export function TimeMirror() {
    const { setPageTitle } = useLayout();
    const { can, profile } = usePermissions();
    const { 
        selectedUsuario: selectedCollaborator = "", 
        setSelectedUsuario: setSelectedCollaborator = () => {}
    } = useFilters({ usuarioParam: "usuario" });

    // Lógica Híbrida de Permissões
    const canViewAll = can(PERMISSIONS.PONTO.ADMIN_VER);
    const canViewOwn = can(PERMISSIONS.PONTO.VER_MEU);

    // Prioridade: Admin sobrepõe Pessoal
    const isOnlyPersonal = canViewOwn && !canViewAll;

    useEffect(() => {
        setPageTitle(isOnlyPersonal ? "Meu Espelho de Ponto" : "Espelho de Ponto");
    }, [setPageTitle, isOnlyPersonal]);

    const { data: rawCollaborators = [] } = useCollaborators({ 
        status: STATUS_CADASTRO.ATIVO
    }, { enabled: canViewAll });

    // Filter by relevant profiles for point tracking
    const collaborators = useMemo(() => {
        return rawCollaborators.filter(c => 
            c.perfil?.nome?.toLowerCase() === ROLES.MOTOBOY.toLowerCase() || 
            c.perfil?.nome?.toLowerCase() === ROLES.FISCAL.toLowerCase()
        );
    }, [rawCollaborators]);

    // Se for apenas pessoal, forçamos o ID do usuário logado
    const finalUsuarioId = isOnlyPersonal ? profile?.id : (selectedCollaborator === STATUS_CADASTRO.TODOS ? undefined : selectedCollaborator);

    const [selectedShift, setSelectedShift] = useState<string>(STATUS_CADASTRO.TODOS);
    const {
        selectedMes: selectedMonth = new Date().getMonth() + 1,
        setSelectedMes: setSelectedMonth = () => {},
        selectedAno: selectedYear = new Date().getFullYear(),
        setSelectedAno: setSelectedYear = () => {},
    } = useFilters({
        mesParam: "mes",
        anoParam: "ano",
    });

    // Auto-select shift logic
    const currentCollab = useMemo(() => 
        isOnlyPersonal ? profile : collaborators.find(c => c.id === finalUsuarioId),
    [isOnlyPersonal, profile, collaborators, finalUsuarioId]);

    const collabShifts = currentCollab?.links || [];

    useEffect(() => {
        if (!finalUsuarioId) {
            setSelectedShift(STATUS_CADASTRO.TODOS);
        } else if (collabShifts.length === 1) {
            const label = `${collabShifts[0].hora_inicio.substring(0, 5)} - ${collabShifts[0].hora_fim.substring(0, 5)}`;
            setSelectedShift(label);
        } else {
            setSelectedShift(STATUS_CADASTRO.TODOS);
        }
    }, [finalUsuarioId, collabShifts.length]);

    const monthOptions = meses.map((label, index) => ({ value: index + 1, label }));

    return (
        <PullToRefreshWrapper onRefresh={async () => {
             await queryClient.invalidateQueries({ queryKey: ['collaborators'] });
             await queryClient.invalidateQueries({ queryKey: ['time-mirror'] });
        }}>
            <div className="space-y-6 pb-24">
                {/* Global Filters */}
                <Card className="border-none shadow-sm rounded-3xl">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Colaborador */}
                            {!isOnlyPersonal && (
                                <div className="space-y-2">
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

                            {/* Turno */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Turno</label>
                                <Select 
                                    value={selectedShift} 
                                    onValueChange={setSelectedShift}
                                    disabled={!finalUsuarioId}
                                >
                                    <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 focus:ring-primary/20 font-medium text-gray-700 shadow-none">
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {collabShifts.length > 1 && (
                                            <SelectItem value={STATUS_CADASTRO.TODOS}>Todos os turnos</SelectItem>
                                        )}
                                        {collabShifts.map(s => {
                                            const label = `${s.hora_inicio.substring(0, 5)} - ${s.hora_fim.substring(0, 5)}`;
                                            return (
                                                <SelectItem key={s.id} value={label}>
                                                    {label}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Mês */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Mês</label>
                                <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
                                    <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 focus:ring-primary/20 font-medium text-gray-700 shadow-none">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {monthOptions.map(m => (
                                            <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Ano */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Ano</label>
                                <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                                    <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 focus:ring-primary/20 font-medium text-gray-700 shadow-none">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {anos.map(a => (
                                            <SelectItem key={a.value} value={String(a.value)}>{a.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <TimeMirrorView 
                    usuarioId={finalUsuarioId} 
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    selectedShift={selectedShift}
                    hideCollaboratorSelect={isOnlyPersonal}
                />
            </div>
        </PullToRefreshWrapper>
    );
}

export default TimeMirror;
