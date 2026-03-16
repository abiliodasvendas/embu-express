import { Can } from "@/components/auth/Can";
import { PerfisTable } from "@/components/features/perfil/PerfisTable";
import { ListSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { useLayout } from "@/contexts/LayoutContext";
import { useDeletePerfil, usePerfis } from "@/hooks/api/usePerfis";
import { Perfil } from "@/types/database";
import { toast } from "@/utils/notifications/toast";
import { Plus } from "lucide-react";
import { useEffect } from "react";

export default function Perfis() {
    const { data: perfis, isLoading } = usePerfis();
    const deletePerfil = useDeletePerfil();
    const { setPageTitle, openConfirmationDialog, closeConfirmationDialog, openPerfilFormDialog } = useLayout();


    const handleEdit = (perfil: Perfil) => {
        openPerfilFormDialog({ perfilToEdit: perfil });
    };

    const handleCreate = () => {
        openPerfilFormDialog({});
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

    useEffect(() => {
        setPageTitle("Perfis");
    }, [setPageTitle]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <p className="text-muted-foreground">Gerencie os perfis de acesso e suas permissões no sistema.</p>
                </div>
                <Can I={PERMISSIONS.PERFIS.CRIAR}>
                    <Button onClick={handleCreate} className="w-full sm:w-auto font-bold">
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

        </div>
    );
}
