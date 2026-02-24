import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
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
import { Loader2, ShieldCheck, X, FileText, Key } from "lucide-react";
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
            <DialogContent
                className="w-full max-w-2xl p-0 gap-0 bg-gray-50 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
                hideCloseButton
            >
                <div className="bg-blue-600 p-4 text-center relative shrink-0">
                    <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
                        <X className="h-6 w-6" />
                        <span className="sr-only">Fechar</span>
                    </DialogClose>
                    <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <DialogTitle className="text-xl font-bold text-white">
                        {perfilToEdit ? "Editar Perfil" : "Novo Perfil"}
                    </DialogTitle>
                    <p className="text-sm text-white/80 mt-1">
                        Determine quais partes do sistema este perfil tem acesso.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent bg-gray-50/30">
                    <Form {...form}>
                        <form id="perfil-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <Accordion type="multiple" defaultValue={["dados-perfil", "permissoes"]} className="space-y-4">
                                <AccordionItem value="dados-perfil" className="border rounded-2xl px-4 bg-white shadow-sm border-gray-100">
                                    <AccordionTrigger className="hover:no-underline py-4 font-bold text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-blue-600" />
                                            Dados do Perfil
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-6 pt-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="nome"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Nome do Perfil *</FormLabel>
                                                        <FormControl>
                                                            <Input disabled={!!isProtected} placeholder="Ex: Diretor de RH" className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors" {...field} />
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
                                                            <Input placeholder="Breve descrição sobre o perfil" className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="permissoes" className="border rounded-2xl px-4 bg-white shadow-sm border-gray-100">
                                    <AccordionTrigger className="hover:no-underline py-4 font-bold text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Key className="w-4 h-4 text-blue-600" />
                                            Permissões de Acesso
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-6 pt-2">
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
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </form>
                    </Form>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="w-full h-11 rounded-xl border-gray-200 font-medium text-gray-700 hover:bg-white"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        form="perfil-form"
                        disabled={isSubmitting}
                        className="w-full h-11 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando
                            </>
                        ) : perfilToEdit ? (
                            "Salvar Alterações"
                        ) : (
                            "Criar Perfil"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog >
    );
}
