import { MoneyInput } from "@/components/ui/MoneyInput";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCollaborator, useCollaborators } from "@/hooks/api/useCollaborators";
import { useCreateOcorrencia } from "@/hooks/api/useOcorrenciaMutations";
import { useTiposOcorrencia } from "@/hooks/api/useOcorrencias";
import { cn } from "@/lib/utils";
import { OccurrenceFormData, occurrenceSchema } from "@/schemas/occurrenceSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { AlertCircle, Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface OccurrenceFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    collaboratorId?: string;
    onSuccess?: () => void;
}

export function OccurrenceFormDialog({
    open,
    onOpenChange,
    collaboratorId,
    onSuccess,
}: OccurrenceFormDialogProps) {
    const { data: collaborators = [] } = useCollaborators({});
    const { data: tipos = [] } = useTiposOcorrencia();
    const createMutation = useCreateOcorrencia();

    const form = useForm<OccurrenceFormData>({
        resolver: zodResolver(occurrenceSchema),
        defaultValues: {
            colaborador_id: collaboratorId || "",
            data_ocorrencia: format(new Date(), "yyyy-MM-dd"),
            valor: 0,
            impacto_financeiro: false,
            tipo_lancamento: undefined as any,
            observacao: "",
        },
    });

    const selectedCollaboratorId = form.watch("colaborador_id");
    const { data: selectedDetailedCollaborator } = useCollaborator(selectedCollaboratorId);

    // Update collaborator_id if it changes via props
    useEffect(() => {
        if (collaboratorId) {
            form.setValue("colaborador_id", collaboratorId);
        }
    }, [collaboratorId, form]);

    const onSubmit = async (data: OccurrenceFormData) => {
        try {
            await createMutation.mutateAsync({
                colaborador_id: data.colaborador_id,
                tipo_id: Number(data.tipo_id),
                data_ocorrencia: data.data_ocorrencia,
                valor: data.valor,
                impacto_financeiro: data.impacto_financeiro,
                tipo_lancamento: data.tipo_lancamento as "ENTRADA" | "SAIDA" | undefined,
                observacao: data.observacao,
                colaborador_cliente_id: data.colaborador_cliente_id ? Number(data.colaborador_cliente_id) : undefined,
            });
            onSuccess?.();
            form.reset();
        } catch (error) {
            console.error(error);
        }
    };

    const selectedTipoId = form.watch("tipo_id");

    // Auto-set finance properties when type changes
    useEffect(() => {
        if (selectedTipoId) {
            const tipo = tipos.find((t) => String(t.id) === selectedTipoId);
            if (tipo) {
                const hasImpact = !!tipo.impacto_financeiro;
                form.setValue("impacto_financeiro", hasImpact);
                
                if (hasImpact) {
                    if (tipo.valor_padrao) {
                        form.setValue("valor", tipo.valor_padrao);
                    }
                } else {
                    // Limpa os campos financeiros se o tipo não tiver impacto por padrão
                    form.setValue("valor", 0);
                    form.setValue("tipo_lancamento", undefined as any);
                    form.setValue("colaborador_cliente_id", undefined as any);
                }
            }
        }
    }, [selectedTipoId, tipos, form]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="w-full max-w-lg p-0 gap-0 bg-gray-50 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
                hideCloseButton
            >
                {/* Header Padronizado */}
                <div className="bg-blue-600 p-4 text-center relative shrink-0">
                    <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
                        <X className="h-6 w-6" />
                        <span className="sr-only">Fechar</span>
                    </DialogClose>

                    <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
                        <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <DialogTitle className="text-xl font-bold text-white">
                        Lançar Ocorrência
                    </DialogTitle>
                    <p className="text-xs text-white/70 mt-1">Registre uma ocorrência para um colaborador</p>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent bg-gray-50/30">
                    <Form {...form}>
                        <form id="occurrence-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {!collaboratorId && (
                                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                                    <FormField
                                        control={form.control}
                                        name="colaborador_id"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                                                    Colaborador <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Combobox
                                                        options={collaborators.map((c) => ({
                                                            value: c.id,
                                                            label: c.nome_completo,
                                                        }))}
                                                        value={field.value}
                                                        onSelect={field.onChange}
                                                        placeholder="Selecione um colaborador"
                                                        searchPlaceholder="Buscar colaborador..."
                                                        emptyText="Nenhum colaborador encontrado."
                                                        className={cn(
                                                            "h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all focus-visible:ring-primary/20",
                                                            form.formState.errors.colaborador_id && "border-red-500 focus:ring-red-200"
                                                        )}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="tipo_id"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                                                    Tipo <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger
                                                            className={cn(
                                                                "h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all",
                                                                form.formState.errors.tipo_id && "border-red-500 focus:ring-red-200"
                                                            )}
                                                        >
                                                            <SelectValue placeholder="Selecione o tipo" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-xl shadow-xl">
                                                        {tipos.map((t) => (
                                                            <SelectItem key={t.id} value={String(t.id)} className="cursor-pointer">
                                                                {t.descricao}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="data_ocorrencia"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                                                    Data <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="date"
                                                        {...field}
                                                        className={cn(
                                                            "h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all",
                                                            form.formState.errors.data_ocorrencia && "border-red-500 focus:ring-red-200"
                                                        )}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="observacao"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                                                Observação <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    placeholder="Detalhes adicionais da ocorrência..."
                                                    className={cn(
                                                        "min-h-[100px] rounded-2xl bg-gray-50 border-gray-200 focus:bg-white transition-all resize-none p-4",
                                                        form.formState.errors.observacao && "border-red-500 focus:ring-red-200"
                                                    )}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="impacto_financeiro"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-xl border border-blue-50 bg-blue-50/30 p-4 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-sm font-bold text-gray-700">
                                                    Gera impacto financeiro?
                                                </FormLabel>
                                                <p className="text-[10px] text-gray-500 font-medium leading-tight">
                                                    Se ativado, este valor será considerado no fechamento.
                                                </p>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                {form.watch("impacto_financeiro") && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        {/* Vínculo (Turno) selection */}
                                        <FormField
                                            control={form.control}
                                            name="colaborador_cliente_id"
                                            render={({ field }) => {
                                                const links = selectedDetailedCollaborator?.links || [];

                                                return (
                                                    <FormItem className="space-y-1.5">
                                                        <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                                                            Vínculo (Turno) <span className="text-red-500">*</span>
                                                        </FormLabel>
                                                        <Select 
                                                            onValueChange={(val) => {
                                                                field.onChange(val);
                                                                // Se o vínculo mudar, podemos sugerir o tipo de lançamento se houver padrão? 
                                                                // Por enquanto apenas seta o valor.
                                                            }} 
                                                            value={field.value || ""}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger
                                                                    className={cn(
                                                                        "h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all",
                                                                        form.formState.errors.colaborador_cliente_id && "border-red-500 focus:ring-red-200"
                                                                    )}
                                                                >
                                                                    <SelectValue placeholder="Selecione o turno vinculado" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="rounded-xl shadow-xl">
                                                                {links.map((link: any) => (
                                                                    <SelectItem key={link.id} value={String(link.id)} className="cursor-pointer">
                                                                        {link.cliente?.nome_fantasia} ({link.hora_inicio} - {link.hora_fim})
                                                                    </SelectItem>
                                                                ))}
                                                                {links.length === 0 && (
                                                                    <SelectItem value="none" disabled>
                                                                        Nenhum turno vinculado encontrado
                                                                    </SelectItem>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage className="text-[10px]" />
                                                        {links.length === 0 && (
                                                            <p className="text-[10px] text-amber-600 font-medium px-1">
                                                                Aviso: Este colaborador não possui turnos vinculados. Não será possível gerar impacto financeiro.
                                                            </p>
                                                        )}
                                                    </FormItem>
                                                );
                                            }}
                                        />

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="tipo_lancamento"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1.5">
                                                        <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                                                            Lançamento <span className="text-red-500">*</span>
                                                        </FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger
                                                                    className={cn(
                                                                        "h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all",
                                                                        form.formState.errors.tipo_lancamento && "border-red-500 focus:ring-red-200"
                                                                    )}
                                                                >
                                                                    <SelectValue placeholder="Selecione..." />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="rounded-xl shadow-xl">
                                                                <SelectItem value="SAIDA" className="cursor-pointer">Saída (Débito)</SelectItem>
                                                                <SelectItem value="ENTRADA" className="cursor-pointer">Entrada (Crédito)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="valor"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1.5">
                                                        <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                                                            Valor <span className="text-red-500">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <MoneyInput
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                className={cn(
                                                                    "h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all",
                                                                    form.formState.errors.valor && "border-red-500 focus:ring-red-200"
                                                                )}
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
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
                        form="occurrence-form"
                        disabled={createMutation.isPending}
                        className="w-full h-11 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                    >
                        {createMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Registrando...
                            </>
                        ) : "Registrar Ocorrência"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
