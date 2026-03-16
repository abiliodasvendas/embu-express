import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useLayout } from "@/contexts/LayoutContext";
import {
    useCreateTipoOcorrencia,
    useDeleteTipoOcorrencia,
    useUpdateTipoOcorrencia
} from "@/hooks/api/useOcorrenciaMutations";
import { useTiposOcorrencia } from "@/hooks/api/useOcorrencias";
import { cn } from "@/lib/utils";
import { TipoOcorrencia } from "@/types/database";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Settings, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const tipoOcorrenciaSchema = z.object({
    descricao: z.string().min(1, "A descrição é obrigatória"),
    valor_padrao: z.coerce.number().min(0, "O valor não pode ser negativo").default(0),
    impacto_financeiro: z.boolean().default(false),
    tipo_lancamento: z.enum(["ENTRADA", "SAIDA"]).optional(),
}).superRefine((data, ctx) => {
    if (data.impacto_financeiro) {
        if (!data.tipo_lancamento) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Obrigatório quando há impacto financeiro",
                path: ["tipo_lancamento"],
            });
        }
        if (data.valor_padrao <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "O valor deve ser maior que zero",
                path: ["valor_padrao"],
            });
        }
    }
});

type TipoOcorrenciaFormData = z.infer<typeof tipoOcorrenciaSchema>;

interface OccurrenceTypesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function OccurrenceTypesDialog({
    open,
    onOpenChange,
}: OccurrenceTypesDialogProps) {
    const { data: tipos = [], isLoading, refetch } = useTiposOcorrencia({ enabled: open });
    const [editingTipo, setEditingTipo] = useState<TipoOcorrencia | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const formContainerRef = useRef<HTMLDivElement>(null);

    const { openConfirmationDialog, closeConfirmationDialog } = useLayout();

    const createMutation = useCreateTipoOcorrencia();
    const updateMutation = useUpdateTipoOcorrencia();
    const deleteMutation = useDeleteTipoOcorrencia();

    const form = useForm<TipoOcorrenciaFormData>({
        resolver: zodResolver(tipoOcorrenciaSchema),
        defaultValues: {
            descricao: "",
            valor_padrao: 0,
            impacto_financeiro: false,
            tipo_lancamento: "SAIDA",
        },
    });

    const handleEdit = (tipo: TipoOcorrencia) => {
        setEditingTipo(tipo);
        form.reset({
            descricao: tipo.descricao,
            valor_padrao: tipo.valor_padrao || 0,
            impacto_financeiro: tipo.impacto_financeiro,
            tipo_lancamento: tipo.tipo_lancamento || "SAIDA",
        });
        setIsFormVisible(true);
        setTimeout(() => {
            formContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleCancel = () => {
        setEditingTipo(null);
        setIsFormVisible(false);
        form.reset({
            descricao: "",
            valor_padrao: 0,
            impacto_financeiro: false,
            tipo_lancamento: "SAIDA",
        });
    };

    const onSubmit = async (data: TipoOcorrenciaFormData) => {
        try {
            if (editingTipo) {
                await updateMutation.mutateAsync({ id: editingTipo.id, data });
            } else {
                await createMutation.mutateAsync(data);
            }
            handleCancel();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = (tipo: TipoOcorrencia) => {
        openConfirmationDialog({
            title: "Excluir Tipo de Ocorrência",
            description: `Deseja realmente excluir "${tipo.descricao}"? Isso pode afetar ocorrências já registradas.`,
            confirmText: "Excluir",
            variant: "destructive",
            onConfirm: async () => {
                await deleteMutation.mutateAsync(tipo.id);
                closeConfirmationDialog();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="w-full max-w-xl p-0 gap-0 bg-gray-50 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
                hideCloseButton
            >
                {/* Header Padronizado */}
                <div className="bg-blue-600 p-4 text-center relative shrink-0">
                    <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
                        <X className="h-6 w-6" />
                        <span className="sr-only">Fechar</span>
                    </DialogClose>

                    <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
                        <Settings className="w-5 h-5 text-white" />
                    </div>
                    <DialogTitle className="text-xl font-bold text-white">
                        Gerenciar Tipos
                    </DialogTitle>
                    <p className="text-xs text-white/70 mt-1">Configure os tipos de ocorrência e seus valores padrão</p>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent bg-gray-50/30">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Tipos Cadastrados</h3>
                        {!isFormVisible && (
                            <Button
                                onClick={() => {
                                    handleCancel();
                                    setIsFormVisible(true);
                                    setTimeout(() => {
                                        formContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }, 100);
                                }}
                                className="rounded-xl gap-2 font-bold shadow-sm h-9 px-4"
                                size="sm"
                            >
                                <Plus className="h-4 w-4" />
                                Novo Tipo
                            </Button>
                        )}
                    </div>

                    {isFormVisible && (
                        <div ref={formContainerRef}>
                            <Card className="mb-6 border border-blue-100 shadow-sm rounded-2xl bg-white animate-in fade-in slide-in-from-top-4 duration-300">
                                <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="bg-blue-600 p-1.5 rounded-lg">
                                        <Plus className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-sm font-bold text-gray-800">
                                        {editingTipo ? "Editar Tipo" : "Cadastrar Novo Tipo"}
                                    </span>
                                </div>

                                <Form {...form}>
                                    <form id="type-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="descricao"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1">
                                                        <FormLabel className="text-gray-700 font-bold ml-1 text-xs opacity-70">Descrição</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="Ex: Falta, Atraso..."
                                                                className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all"
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
                                                    <FormItem className="flex flex-row items-center justify-between rounded-xl border border-blue-50 bg-blue-50/20 p-3 shadow-sm">
                                                        <div className="space-y-0.5">
                                                            <FormLabel className="text-xs font-bold text-gray-700">Impacto Financeiro</FormLabel>
                                                            <p className="text-[10px] text-gray-500 font-medium leading-tight">Gera lançamento automático no financeiro.</p>
                                                        </div>
                                                        <FormControl>
                                                            <Switch checked={field.value} onCheckedChange={(val) => {
                                                                field.onChange(val);
                                                                if (val && !form.getValues("tipo_lancamento")) {
                                                                    form.setValue("tipo_lancamento", "SAIDA");
                                                                }
                                                            }} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            {form.watch("impacto_financeiro") && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <FormField
                                                        control={form.control}
                                                        name="tipo_lancamento"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-1">
                                                                <FormLabel className="text-gray-700 font-bold ml-1 text-xs opacity-70">Tipo de Lançamento</FormLabel>
                                                                <FormControl>
                                                                    <RadioGroup
                                                                        onValueChange={field.onChange}
                                                                        value={field.value || "SAIDA"}
                                                                        className="flex gap-4 h-11 items-center px-4 bg-gray-50 rounded-xl border border-gray-200"
                                                                    >
                                                                        <div className="flex items-center space-x-2">
                                                                            <RadioGroupItem value="SAIDA" id="saida" />
                                                                            <Label htmlFor="saida" className="text-xs font-bold text-gray-600 cursor-pointer">Saída (Débito)</Label>
                                                                        </div>
                                                                        <div className="flex items-center space-x-2">
                                                                            <RadioGroupItem value="ENTRADA" id="entrada" />
                                                                            <Label htmlFor="entrada" className="text-xs font-bold text-gray-600 cursor-pointer">Entrada (Crédito)</Label>
                                                                        </div>
                                                                    </RadioGroup>
                                                                </FormControl>
                                                                <FormMessage className="text-[10px]" />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="valor_padrao"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-1">
                                                                <FormLabel className="text-gray-700 font-bold ml-1 text-xs opacity-70">Valor Sugerido</FormLabel>
                                                                <FormControl>
                                                                    <MoneyInput
                                                                        value={field.value}
                                                                        onChange={field.onChange}
                                                                        className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-[10px]" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-end gap-2 pt-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={handleCancel}
                                                className="rounded-xl h-9 px-4 text-xs font-semibold"
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={createMutation.isPending || updateMutation.isPending}
                                                className="rounded-xl h-9 px-6 text-xs font-bold shadow-md shadow-blue-500/20"
                                            >
                                                {createMutation.isPending || updateMutation.isPending ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    editingTipo ? "Atualizar" : "Salvar Tipo"
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                            </Card>
                        </div>
                    )}

                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white animate-pulse rounded-2xl border border-gray-100" />)}
                            </div>
                        ) : tipos.length === 0 ? (
                            <div className="bg-white border border-dashed border-gray-200 rounded-3xl py-12 text-center">
                                <Settings className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400 font-medium">Nenhum tipo cadastrado.</p>
                            </div>
                        ) : (
                            tipos.map((tipo) => (
                                <div
                                    key={tipo.id}
                                    className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 transition-all group"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-800">{tipo.descricao}</span>
                                            {tipo.impacto_financeiro && (
                                                <>
                                                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-[9px] uppercase font-black px-1.5 py-0 border-blue-100">
                                                        Financeiro
                                                    </Badge>
                                                    <Badge variant="outline" className={cn(
                                                        "text-[9px] uppercase font-black px-1.5 py-0",
                                                        tipo.tipo_lancamento === 'ENTRADA' ? "text-green-600 border-green-100 bg-green-50" : "text-amber-600 border-amber-100 bg-amber-50"
                                                    )}>
                                                        {tipo.tipo_lancamento === 'ENTRADA' ? 'Crédito' : 'Débito'}
                                                    </Badge>
                                                </>
                                            )}
                                        </div>
                                        {tipo.impacto_financeiro && (
                                            <div className="text-[11px] text-gray-400 font-bold mt-0.5">
                                                Sugestão de Valor: <span className="text-gray-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tipo.valor_padrao || 0)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(tipo)}
                                            className="h-8 w-8 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(tipo)}
                                            className="h-8 w-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Internal Card Component for local use
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("bg-white border rounded-xl overflow-hidden", className)}>{children}</div>;
}

function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("p-6", className)}>{children}</div>;
}
