import { Can } from "@/components/auth/Can";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { usePerfis } from "@/hooks/api/usePerfis";
import { Loader2 } from "lucide-react";
import { PerfisTable } from "@/components/features/perfil/PerfisTable";
import { useState } from "react";
import { PerfilFormDialog } from "@/components/dialogs/PerfilFormDialog";
import { PERMISSIONS } from "@/constants/permissions.enum";

export default function Perfis() {
    const { data: perfis, isLoading } = usePerfis();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [perfilToEdit, setPerfilToEdit] = useState<any>(null);

    const handleEdit = (perfil: any) => {
        setPerfilToEdit(perfil);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setPerfilToEdit(null);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Gestão de Perfis</h1>
                    <p className="text-muted-foreground">Gerencie os perfis de acesso e suas permissões no sistema.</p>
                </div>
                <Can I={PERMISSIONS.PERFIS.CRIAR}>
                    <Button onClick={handleCreate} className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Perfil
                    </Button>
                </Can>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <PerfisTable
                        perfis={perfis || []}
                        onEdit={handleEdit}
                    />
                )}
            </div>

            <PerfilFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                perfilToEdit={perfilToEdit}
            />
        </div>
    );
}
