import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLayout } from "@/contexts/LayoutContext";
import { useCollaborators } from "@/hooks/api/useCollaborators";
import { useEffect, useState } from "react";
import { TimeMirrorView } from "@/components/features/ponto/TimeMirrorView";

export function TimeMirror() {
    const { setPageTitle } = useLayout();
    const [selectedCollaborator, setSelectedCollaborator] = useState<string>("");

    useEffect(() => {
        setPageTitle("Espelho de Ponto");
    }, [setPageTitle]);

    const { data: collaborators = [] } = useCollaborators({ status: "ATIVO" });

    return (
        <div className="space-y-6 pb-24">
            {/* Global Collaborator Filter */}
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

            <TimeMirrorView usuarioId={selectedCollaborator} />
        </div>
    );
}

export default TimeMirror;
