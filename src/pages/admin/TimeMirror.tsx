import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLayout } from "@/contexts/LayoutContext";
import { useCollaborators } from "@/hooks/api/useCollaborators";
import { useEffect } from "react";
import { TimeMirrorView } from "@/components/features/ponto/TimeMirrorView";
import { useFilters } from "@/hooks/ui/useFilters";
import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";

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

    const { data: collaborators = [] } = useCollaborators({ 
        status: "ATIVO"
    });

    // Se for apenas pessoal, forçamos o ID do usuário logado
    const finalUsuarioId = isOnlyPersonal ? profile?.id : (selectedCollaborator === 'todos' ? undefined : selectedCollaborator);

    return (
        <div className="space-y-6 pb-24">
            {/* Global Collaborator Filter - Só aparece se tiver permissão Admin */}
            {canViewAll && (
                <Card className="border-none shadow-sm rounded-3xl">
                    <CardContent className="p-6">
                        <div className="max-w-md space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Colaborador</label>
                            <Select value={selectedCollaborator} onValueChange={setSelectedCollaborator}>
                                <SelectTrigger className="rounded-xl border-gray-100 h-11">
                                    <SelectValue placeholder="Selecione um colaborador" />
                                </SelectTrigger>
                                <SelectContent>
                                    {collaborators.map(c => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.nome_completo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            )}

            <TimeMirrorView 
                usuarioId={finalUsuarioId} 
                hideCollaboratorSelect={isOnlyPersonal}
            />
        </div>
    );
}

export default TimeMirror;
