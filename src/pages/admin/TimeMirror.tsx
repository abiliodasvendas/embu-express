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
        status: "ATIVO"
    }, { enabled: canViewAll });

    // Filter by relevant profiles for point tracking
    const collaborators = useMemo(() => {
        return rawCollaborators.filter(c => c.perfil?.nome === 'motoboy' || c.perfil?.nome === 'fiscal');
    }, [rawCollaborators]);

    // Se for apenas pessoal, forçamos o ID do usuário logado
    const finalUsuarioId = isOnlyPersonal ? profile?.id : (selectedCollaborator === 'todos' ? undefined : selectedCollaborator);

    const [selectedShift, setSelectedShift] = useState("todos");
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
        collaborators.find(c => c.id === finalUsuarioId),
    [collaborators, finalUsuarioId]);

    const collabShifts = currentCollab?.links || [];

    useEffect(() => {
        if (!finalUsuarioId) {
            setSelectedShift("todos");
        } else if (collabShifts.length === 1) {
            setSelectedShift(String(collabShifts[0].id));
        } else {
            setSelectedShift("todos");
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
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Colaborador</label>
                                    <Select value={selectedCollaborator} onValueChange={setSelectedCollaborator}>
                                        <SelectTrigger className="rounded-xl border-gray-100 h-11">
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todos">Todos os colaboradores</SelectItem>
                                            {collaborators.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.nome_completo}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Turno */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Turno</label>
                                <Select 
                                    value={selectedShift} 
                                    onValueChange={setSelectedShift}
                                    disabled={!finalUsuarioId}
                                >
                                    <SelectTrigger className="rounded-xl border-gray-100 h-11">
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">Todos os turnos</SelectItem>
                                        {collabShifts.map(s => (
                                            <SelectItem key={s.id} value={String(s.id)}>
                                                {s.hora_inicio.substring(0, 5)} - {s.hora_fim.substring(0, 5)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Mês */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Mês</label>
                                <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
                                    <SelectTrigger className="rounded-xl border-gray-100 h-11 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {monthOptions.map(m => (
                                            <SelectItem key={m.value} value={String(m.value)} className="text-xs">{m.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Ano */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Ano</label>
                                <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                                    <SelectTrigger className="rounded-xl border-gray-100 h-11 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {anos.map(a => (
                                            <SelectItem key={a.value} value={String(a.value)} className="text-xs">{a.label}</SelectItem>
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
