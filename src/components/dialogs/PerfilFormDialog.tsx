import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreatePerfil, useUpdatePerfil, usePermissoes } from "@/hooks/api/usePerfis";
import { PerfilFormData, perfilSchema } from "@/schemas/perfilSchema";
import { Perfil } from "@/types/database";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/utils/notifications/toast";
import { Checkbox } from "@/components/ui/checkbox";
import { PROTECTED_ROLES_NAMES } from "@/constants/permissions.enum";

interface PerfilFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    perfilToEdit?: Perfil | null;
}

export function PerfilFormDialog({
    open,
    onOpenChange,
    perfilToEdit,
}: PerfilFormDialogProps) {
    const { data: permissoes } = usePermissoes();
    const createPerfil = useCreatePerfil();
    const updatePerfil = useUpdatePerfil();

    const isProtected = perfilToEdit && PROTECTED_ROLES_NAMES.includes(perfilToEdit.nome as any);

    const form = useForm<PerfilFormData>({
        resolver: zodResolver(perfilSchema),
        defaultValues: {
            nome: "",
            descricao: "",
            permissoes: [],
        },
    });

    useEffect(() => {
        if (open) {
            if (perfilToEdit) {
                form.reset({
                    id: perfilToEdit.id.toString(),
                    nome: perfilToEdit.nome,
                    descricao: perfilToEdit.descricao || "",
                    permissoes: (perfilToEdit as any).perfil_permissoes?.map((pp: any) => pp.permissao_id) || [],
                });
            } else {
                form.reset({
                    nome: "",
                    descricao: "",
                    permissoes: [],
                });
            }
        }
    }, [open, perfilToEdit, form]);

    const permissoesAgrupadas = useMemo(() => {
        if (!permissoes) return {};
        return permissoes.reduce((acc, current) => {
            const mod = current.modulo || "Outros";
            if (!acc[mod]) acc[mod] = [];
            acc[mod].push(current);
            return acc;
        }, {} as Record<string, typeof permissoes>);
    }, [permissoes]);

    const onSubmit = async (values: PerfilFormData) => {
        try {
            if (perfilToEdit) {
                await updatePerfil.mutateAsync({
                    id: perfilToEdit.id,
                    data: {
                        nome: values.nome,
                        descricao: values.descricao,
                        permissoes: values.permissoes,
                    },
                });
                toast.success("Perfil atualizado com sucesso");
            } else {
                await createPerfil.mutateAsync({
                    nome: values.nome,
                    descricao: values.descricao,
                    permissoes: values.permissoes,
                });
                toast.success("Perfil criado com sucesso");
            }
            onOpenChange(false);
        } catch (error: any) {
            toast.error("Erro ao salvar", {
                description: error.response?.data?.error || "Verifique os dados.",
            });
        }
    };

    const isSubmitting = createPerfil.isPending || updatePerfil.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <ShieldCheck className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">
                                {perfilToEdit ? "Editar Perfil" : "Novo Perfil"}
                            </DialogTitle>
                            <p className="text-sm text-slate-500 mt-1">
                                Determine quais partes do sistema este perfil tem acesso.
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 pt-2 scrollbar-thin">
                    <Form {...form}>
                        <form id="perfil-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="nome"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome do Perfil *</FormLabel>
                                            <FormControl>
                                                <Input disabled={!!isProtected} placeholder="Ex: Diretor de RH" {...field} />
                                            </FormControl>
                                            {!!isProtected && <p className="text-xs text-orange-500">Nome de perfil nativo não pode ser alterado.</p>}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="descricao"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descrição</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Breve descrição sobre o perfil" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-semibold text-slate-800 mb-4 block">Permissões de Acesso</h3>

                                {Object.entries(permissoesAgrupadas).map(([modulo, perms]) => (
                                    <div key={modulo} className="mb-6 bg-slate-50 p-4 rounded-xl border">
                                        <h4 className="font-medium text-slate-700 mb-3 border-b pb-2">{modulo}</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {perms.map((permissao) => (
                                                <FormField
                                                    key={permissao.id}
                                                    control={form.control}
                                                    name="permissoes"
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem
                                                                key={permissao.id}
                                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                            >
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(permissao.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...field.value, permissao.id])
                                                                                : field.onChange(
                                                                                    field.value?.filter(
                                                                                        (value) => value !== permissao.id
                                                                                    )
                                                                                )
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <div className="space-y-1 leading-none">
                                                                    <FormLabel className="cursor-pointer font-normal">
                                                                        {permissao.descricao}
                                                                    </FormLabel>
                                                                </div>
                                                            </FormItem>
                                                        )
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </form>
                    </Form>
                </div>

                <div className="p-6 border-t bg-slate-50 shrink-0 flex justify-end gap-3 rounded-b-lg">
                    <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
                        Cancelar
                    </Button>
                    <Button type="submit" form="perfil-form" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {perfilToEdit ? "Salvar Alterações" : "Criar Perfil"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
