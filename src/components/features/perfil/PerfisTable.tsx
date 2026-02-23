import { Perfil } from "@/types/database";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Shield, Trash2, ShieldAlert } from "lucide-react";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS, PROTECTED_ROLES_NAMES } from "@/constants/permissions.enum";
import { useDeletePerfil } from "@/hooks/api/usePerfis";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/utils/notifications/toast";
import { usePermissions } from "@/hooks/business/usePermissions";

interface PerfisTableProps {
    perfis: Perfil[];
    onEdit: (perfil: Perfil) => void;
}

export function PerfisTable({ perfis, onEdit }: PerfisTableProps) {
    const deletePerfil = useDeletePerfil();
    const { isSuperAdmin } = usePermissions();

    const handleDelete = async (id: number) => {
        try {
            await deletePerfil.mutateAsync(id);
            toast.success("Perfil deletado com sucesso!");
        } catch (error: any) {
            toast.error("Erro ao deletar perfil", {
                description: error.response?.data?.error || "Perfil pode estar em uso.",
            });
        }
    };

    return (
        <div className="rounded-md border overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Perfil</TableHead>
                        <TableHead className="hidden md:table-cell">Descrição</TableHead>
                        <TableHead className="hidden sm:table-cell">Criado em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {perfis.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <ShieldAlert className="h-8 w-8 text-slate-300" />
                                    <p>Nenhum perfil encontrado.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        perfis.map((perfil) => {
                            const dataCriacao = perfil.criado_em ? format(new Date(perfil.criado_em), "dd/MM/yyyy") : "-";

                            // Perfis do sistema que não devem ser apagados na UI facilmente, exceto pelo super_admin (opcional)
                            const isProtected = PROTECTED_ROLES_NAMES.includes(perfil.nome as any);

                            return (
                                <TableRow key={perfil.id} className="hover:bg-slate-50/50">
                                    <TableCell className="font-medium text-slate-500">#{perfil.id}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Shield className={`h-4 w-4 ${isProtected ? 'text-blue-500' : 'text-slate-400'}`} />
                                            <span className="font-semibold text-slate-700 uppercase">{perfil.nome}</span>
                                            {isProtected && (
                                                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold ml-2">
                                                    SISTEMA
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-slate-600">
                                        {perfil.descricao || "-"}
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell text-slate-500">
                                        {dataCriacao}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Can I={PERMISSIONS.PERFIS.EDITAR}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onEdit(perfil)}
                                                    className="h-8 w-8 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                            </Can>

                                            <Can I={PERMISSIONS.PERFIS.DELETAR}>
                                                {(!isProtected || isSuperAdmin) && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-slate-600 hover:text-red-600 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Isso apagará o perfil <strong className="uppercase">{perfil.nome}</strong> permanentemente.
                                                                    Essa ação pode quebrar o acesso de usuários vinculados a ele.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(perfil.id)}
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Sim, deletar perfil
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
                                            </Can>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
