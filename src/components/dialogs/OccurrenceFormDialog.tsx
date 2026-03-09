import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { Combobox } from "@/components/ui/combobox";
import { Switch } from "@/components/ui/switch";
import { useCreateOcorrencia } from "@/hooks/api/useOcorrenciaMutations";
import { useTiposOcorrencia } from "@/hooks/api/useOcorrencias";
import { useCollaborators } from "@/hooks/api/useCollaborators";
import { occurrenceSchema, OccurrenceFormData } from "@/schemas/occurrenceSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";

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
            tipo_lancamento: "SAIDA",
            observacao: "",
        },
    });

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
                tipo_lancamento: data.tipo_lancamento,
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
                form.setValue("impacto_financeiro", tipo.impacto_financeiro);
                if (tipo.valor_padrao) {
                    form.setValue("valor", tipo.valor_padrao);
                }
            }
        }
    }, [selectedTipoId, tipos, form]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                        Lançar Ocorrência
                    </DialogTitle>
                    <DialogDescription>
                        Registre uma ocorrência para um colaborador.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-6 pt-4">
                        {!collaboratorId && (
                            <FormField
                                control={form.control}
                                name="colaborador_id"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5 text-left">
                                        <FormLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
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
                                                className="h-12 rounded-xl bg-gray-50 border-gray-100 focus-visible:ring-primary/20"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="tipo_id"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5 text-left">
                                        <FormLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                                            Tipo <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-100 focus-visible:ring-primary/20">
                                                    <SelectValue placeholder="Selecione o tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {tipos.map((t) => (
                                                    <SelectItem key={t.id} value={String(t.id)}>
                                                        {t.nome}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="data_ocorrencia"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5 text-left">
                                        <FormLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                                            Data <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                                className="h-12 rounded-xl bg-gray-50 border-gray-100 focus-visible:ring-primary/20"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="tipo_lancamento"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5 text-left">
                                        <FormLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                                            Tipo de Lançamento
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-100 focus-visible:ring-primary/20">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="SAIDA">Saída (Débito)</SelectItem>
                                                <SelectItem value="ENTRADA">Entrada (Crédito)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="valor"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5 text-left">
                                        <FormLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                                            Valor
                                        </FormLabel>
                                        <FormControl>
                                            <MoneyInput
                                                value={field.value}
                                                onChange={field.onChange}
                                                className="h-12 rounded-xl bg-gray-50 border-gray-100 focus-visible:ring-primary/20 font-bold"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="impacto_financeiro"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-4 shadow-sm">
                                    <div className="space-y-0.5 text-left">
                                        <FormLabel className="text-sm font-bold text-gray-700">
                                            Gera impacto financeiro?
                                        </FormLabel>
                                        <p className="text-xs text-gray-500">
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

                        <FormField
                            control={form.control}
                            name="observacao"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5 text-left">
                                    <FormLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                                        Observação
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Detalhes adicionais da ocorrência..."
                                            className="min-h-[100px] rounded-xl bg-gray-50 border-gray-100 focus-visible:ring-primary/20 resize-none"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px] font-bold" />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="rounded-xl h-12 px-6 font-semibold"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={createMutation.isPending}
                                className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/25"
                            >
                                {createMutation.isPending ? "Registrando..." : "Registrar"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
