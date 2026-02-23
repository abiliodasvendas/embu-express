import { useState } from "react";
import { Plus } from "lucide-react";
import { PerfisTable } from "@/components/features/perfil/PerfisTable";
import { usePerfis } from "@/hooks/api/usePerfis";
import { ListSkeleton } from "@/components/skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { Can } from "@/components/auth/Can";
import { Button } from "@/components/ui/button";
import { PerfilFormDialog } from "@/components/dialogs/PerfilFormDialog";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { useDeletePerfil } from "@/hooks/api/usePerfis";
import { useLayout } from "@/contexts/LayoutContext";
import { toast } from "@/utils/notifications/toast";
import { Perfil } from "@/types/database";

export default function Perfis() {
    const { data: perfis, isLoading } = usePerfis();
    const deletePerfil = useDeletePerfil();
    const { openConfirmationDialog, closeConfirmationDialog } = useLayout();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [perfilToEdit, setPerfilToEdit] = useState<Perfil | null>(null);

    const handleEdit = (perfil: Perfil) => {
        setPerfilToEdit(perfil);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setPerfilToEdit(null);
        setIsDialogOpen(true);
    };

    const handleDelete = (perfil: Perfil) => {
        openConfirmationDialog({
            title: "Você tem certeza absoluta?",
            description: `Isso apagará o perfil "${perfil.nome.toUpperCase()}" permanentemente. Essa ação pode quebrar o acesso de usuários vinculados a ele.`,
            confirmText: "Sim, deletar perfil",
            variant: "destructive",
            onConfirm: async () => {
                try {
                    await deletePerfil.mutateAsync(perfil.id);
                    toast.success("Perfil deletado com sucesso!");
                    closeConfirmationDialog();
                } catch (error: any) {
                    toast.error("Erro ao deletar perfil", {
                        description: error.response?.data?.error || "Perfil pode estar em uso.",
                    });
                }
            },
        });
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

            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="px-0">
                    {isLoading ? (
                        <ListSkeleton />
                    ) : (
                        <PerfisTable
                            perfis={perfis || []}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}
                </CardContent>
            </Card>

            <PerfilFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                perfilToEdit={perfilToEdit}
            />
        </div>
    );
}
