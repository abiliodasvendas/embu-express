import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useActiveCollaborators } from "@/hooks";
import { useCreatePonto, useUpdatePonto } from "@/hooks/api/usePontoMutations";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { cn } from "@/lib/utils";
import { ManualTimeRecordFormValues, manualTimeRecordSchema } from "@/schemas/pontoSchema";
import { RegistroPonto } from "@/types/database";
import { kmMask, kmToNumber, timeMask } from "@/utils/masks";
import { TimeRules } from "@/utils/timeRules";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, Building2, Calendar as CalendarIcon, Check, ChevronsUpDown, Clock, Edit2, Gauge, Loader2, PlusCircle, Save, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { isMotoboy } from "@/utils/business/roles";

interface TimeRecordDialogProps {
    isOpen: boolean;
    onClose: () => void;
    record?: RegistroPonto | null;
}

export function TimeRecordDialog({ isOpen, onClose, record }: TimeRecordDialogProps) {
    const { mutateAsync: createPonto, isPending: isCreating } = useCreatePonto();
    const { mutateAsync: updatePonto, isPending: isUpdating } = useUpdatePonto();
    const [openCombobox, setOpenCombobox] = useState(false);

    const idValue = record?.id;
    // Um registro é virtual se não houver marcação de entrada (sintetizado pelo backend ou frontend para ausencias/atrasos)
    // ou se o ID explicitamente indicar que é um registro de ausência.
    const isVirtualId = !!record && (
        !record.entrada_hora ||
        record.ausente === true ||
        (!!idValue && String(idValue).startsWith('ausente-'))
    );

    const { data: collaborators = [] } = useActiveCollaborators({ enabled: isOpen && (!record || isVirtualId) });

    const isEditMode = !!record && !isVirtualId;
    const isInclusionMode = !!record && isVirtualId;
    const isManualMode = !record;

    const form = useForm<ManualTimeRecordFormValues>({
        resolver: zodResolver(manualTimeRecordSchema),
        defaultValues: {
            usuario_id: "",
            perfil_nome: "",
            data_referencia: format(new Date(), "yyyy-MM-dd"),
            entrada_hora: "",
            saida_hora: "",
            entrada_km: "",
            saida_km: "",
            colaborador_cliente_id: "",
            observacao: "",
        },
    });

    const watchedPerfilNome = form.watch("perfil_nome");
    const isMotoboyUser = isMotoboy(watchedPerfilNome);

    const selectedCollaboratorId = form.watch("usuario_id");
    const selectedCollaborator = record?.usuario || collaborators.find(c => c.id.toString() === selectedCollaboratorId);
    const hasTurnos = (record as any)?.colaborador_cliente_id || (selectedCollaborator?.links && selectedCollaborator.links.length > 0);

    const handleClose = () => {
        safeCloseDialog(onClose);
    };

    // Determina se o turno já encerrou para sugerir preenchimentos automáticos
    const now = new Date();
    const getShiftMoment = (timeStr?: string) => {
        if (!timeStr || !record?.data_referencia) return null;
        const [h, m] = timeStr.split(':').map(Number);
        const [y, mm, d] = record.data_referencia.split('-').map(Number);
        const date = new Date(y, mm - 1, d);
        date.setHours(h, m, 0, 0);
        return date;
    };

    const shiftStart = getShiftMoment(record?.detalhes_calculo?.entrada?.turno_base);
    let shiftEnd = getShiftMoment(record?.detalhes_calculo?.saida?.turno_base);
    if (shiftStart && shiftEnd && shiftEnd <= shiftStart) {
        shiftEnd = new Date(shiftEnd.getTime() + 24 * 60 * 60 * 1000);
    }

    const isShiftEnded = shiftEnd ? now > shiftEnd : false;

    // Sugerimos a saída apenas se for uma ausencia total confirmada (turno encerrou) ou se houver erro de saída pendente
    const isFixingInconsistency =
        isShiftEnded ||
        record?.status_saida === "FALTA_SAIDA" ||
        record?.status_saida === "PENDENTE";

    useEffect(() => {
        if (isOpen) {
            if (record) {
                const values = {
                    usuario_id: String(record.usuario_id),
                    perfil_nome: record.usuario?.perfil?.nome || "",
                    data_referencia: record.data_referencia,
                    // Regra Entrada: se tem no banco, usa. Senão, se o turno ACABOU (ausencia), preenche.
                    // Se apenas passou do início mas não acabou (atraso), deixa vazio para forçar o real.
                    entrada_hora: record.entrada_hora
                        ? format(new Date(record.entrada_hora), "HH:mm")
                        : (isShiftEnded ? (record.detalhes_calculo?.entrada?.turno_base?.slice(0, 5) || "") : ""),
                    // Regra Saída: se tem no banco, usa. Senão, se o turno ACABOU, preenche.
                    saida_hora: record.saida_hora
                        ? format(new Date(record.saida_hora), "HH:mm")
                        : (isShiftEnded ? (record.detalhes_calculo?.saida?.turno_base?.slice(0, 5) || "") : ""),
                    entrada_km: record.entrada_km != null ? String(record.entrada_km) : "",
                    saida_km: record.saida_km != null ? String(record.saida_km) : "",
                    colaborador_cliente_id: String(record.colaborador_cliente_id || ""),
                    observacao: record.observacao || "",
                };
                form.reset(values);
            } else {
                form.reset({
                    usuario_id: "",
                    perfil_nome: "",
                    data_referencia: format(new Date(), "yyyy-MM-dd"),
                    entrada_hora: "",
                    saida_hora: "",
                    entrada_km: "",
                    saida_km: "",
                    colaborador_cliente_id: "",
                    observacao: "",
                });
            }
            setOpenCombobox(false);
        }
    }, [isOpen, record, form, isShiftEnded]);

    const onSubmit = async (values: ManualTimeRecordFormValues) => {
        try {
            // Conversão segura decompondo data YYYY-MM-DD para evitar fuso horário
            const [y, m, d] = values.data_referencia.split('-').map(Number);
            const refDate = new Date(y, m - 1, d);
            const refDateStr = format(refDate, "yyyy-MM-dd");

            const { entrada, saida } = TimeRules.resolveDates(refDateStr, values.entrada_hora, values.saida_hora || undefined);


            const payload = {
                usuario_id: values.usuario_id, // Já é string/UUID
                data_referencia: values.data_referencia,
                entrada_hora: entrada.toISOString(),
                entrada_km: kmToNumber(values.entrada_km),
                saida_hora: saida ? saida.toISOString() : null,
                saida_km: values.saida_km ? kmToNumber(values.saida_km) : null,
                colaborador_cliente_id: values.colaborador_cliente_id ? parseInt(values.colaborador_cliente_id) : undefined,
                observacao: values.observacao
            };

            if (isEditMode && record && typeof record.id === 'number') {
                await updatePonto({
                    id: record.id,
                    data: payload as any
                });
            } else {
                // Creation or Inclusion
                await createPonto(payload as any);
            }

            handleClose();
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || "";
            toast.error(errorMessage || "Erro ao processar registro");
        }
    };

    const isPending = isCreating || isUpdating;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent
                className="w-full max-w-sm p-0 gap-0 bg-gray-50 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
                hideCloseButton
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <div className="bg-blue-600 p-4 text-center relative shrink-0">
                    <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors" onClick={handleClose}>
                        <X className="h-6 w-6" />
                        <span className="sr-only">Fechar</span>
                    </DialogClose>

                    <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
                        {isEditMode ? <Edit2 className="w-5 h-5 text-white" /> : <PlusCircle className="w-5 h-5 text-white" />}
                    </div>
                    <DialogTitle className="text-xl font-bold text-white">
                        {isEditMode ? "Editar Atividade" : "Registrar Atividade"}
                    </DialogTitle>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent bg-gray-50/30">
                    <Form {...form}>
                        <form id="time-record-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                                {record || selectedCollaboratorId ? (
                                    <div className="text-center space-y-1 animate-in fade-in slide-in-from-top-2">
                                        <div className="relative mx-auto w-10 h-10">
                                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                                <User className="w-5 h-5" />
                                            </div>
                                            {isManualMode && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        form.setValue("usuario_id", "");
                                                        form.setValue("colaborador_cliente_id", "");
                                                    }}
                                                    className="absolute -right-1 -top-1 w-5 h-5 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition-colors"
                                                >
                                                    <X className="w-2.5 h-2.5" />
                                                </button>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 leading-tight">{selectedCollaborator?.nome_completo}</h3>
                                        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 font-medium">
                                            <Building2 className="w-3 h-3" />
                                            <span>
                                                {(() => {
                                                    const displayedClient = (record as any)?.cliente?.nome_fantasia || (record as any)?.colaborador_cliente?.cliente?.nome_fantasia || selectedCollaborator?.links?.[0]?.cliente?.nome_fantasia;
                                                    const displayedUnit = (record as any)?.colaborador_cliente?.unidade?.nome_unidade || selectedCollaborator?.links?.[0]?.unidade?.nome_unidade;

                                                    if (displayedClient || displayedUnit) {
                                                        return (
                                                            <div className="flex flex-col items-center text-xs">
                                                                <span className="font-black text-blue-600 uppercase tracking-tight">{displayedUnit || "Unidade não definida"}</span>
                                                                <span className="text-[10px] text-gray-400 font-medium italic">{displayedClient || "Cliente não definido"}</span>
                                                            </div>
                                                        );
                                                    }

                                                    return isManualMode ? "Selecione o turno abaixo" : "Carregando informações do turno...";
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <FormField
                                        control={form.control}
                                        name="usuario_id"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Colaborador <span className="text-red-500">*</span></FormLabel>
                                                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                className={cn(
                                                                    "w-full justify-between h-11 rounded-xl text-left font-normal border-gray-200 bg-gray-50 hover:bg-white hover:border-blue-300 transition-all",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <User className="h-4 w-4 text-gray-400" />
                                                                    {field.value
                                                                        ? collaborators.find((collaborator) => collaborator.id.toString() === field.value)?.nome_completo
                                                                        : "Selecione o colaborador..."}
                                                                </div>
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                                        <Command className="rounded-xl">
                                                            <CommandInput placeholder="Buscar colaborador..." />
                                                            <CommandList>
                                                                <CommandEmpty>Nenhum colaborador encontrado.</CommandEmpty>
                                                                <CommandGroup>
                                                                    {collaborators.map((collaborator) => (
                                                                        <CommandItem
                                                                            value={collaborator.nome_completo}
                                                                            key={collaborator.id}
                                                                            onSelect={() => {
                                                                                form.setValue("usuario_id", collaborator.id.toString());
                                                                                form.setValue("perfil_nome", collaborator.perfil?.nome || "");
                                                                                setOpenCombobox(false);
                                                                            }}
                                                                            className="cursor-pointer"
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    "mr-2 h-4 w-4 text-blue-600",
                                                                                    collaborator.id.toString() === field.value
                                                                                        ? "opacity-100"
                                                                                        : "opacity-0"
                                                                                )}
                                                                            />
                                                                            {collaborator.nome_completo}
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {isManualMode && selectedCollaboratorId && hasTurnos && (
                                    <FormField
                                        control={form.control}
                                        name="colaborador_cliente_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Turno / Vínculo <span className="text-red-500">*</span></FormLabel>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {(selectedCollaborator as any)?.links?.map((link: any) => (
                                                        <div
                                                            key={link.id}
                                                            onClick={() => field.onChange(link.id.toString())}
                                                            className={cn(
                                                                "flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer",
                                                                field.value === link.id.toString()
                                                                    ? "border-blue-500 bg-blue-50/50 shadow-sm"
                                                                    : "border-gray-100 hover:border-gray-200 bg-white"
                                                            )}
                                                        >
                                                            <div className="flex flex-col flex-1 min-w-0">
                                                                <span className="text-sm font-black text-gray-900 leading-tight uppercase tracking-tight">{link.unidade?.nome_unidade}</span>
                                                                <span className="text-[10px] text-gray-400 font-medium italic">{link.cliente?.nome_fantasia}</span>
                                                                <span className="text-[11px] text-blue-600 font-bold mt-0.5">{link.hora_inicio.slice(0, 5)} - {link.hora_fim.slice(0, 5)}</span>
                                                            </div>
                                                            {field.value === link.id.toString() && (
                                                                <Check className="w-5 h-5 text-blue-600" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <FormField
                                    control={form.control}
                                    name="data_referencia"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Data de Referência <span className="text-red-500">*</span></FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            disabled={!isManualMode}
                                                            className={cn(
                                                                "h-11 w-full pl-3 text-left font-normal border-gray-200 bg-gray-50 hover:bg-white hover:border-blue-300 rounded-xl transition-all disabled:opacity-100 disabled:bg-gray-50",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <CalendarIcon className="h-4 w-4 text-gray-400" />
                                                                {field.value ? (
                                                                    format(new Date(field.value + "T00:00:00"), "dd 'de' MMMM, yyyy", { locale: ptBR })
                                                                ) : (
                                                                    <span>Selecione a data</span>
                                                                )}
                                                            </div>
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 rounded-2xl border-0 shadow-2xl" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value ? new Date(field.value + "T00:00:00") : undefined}
                                                        onSelect={(e) => {
                                                            if (e) field.onChange(format(e, "yyyy-MM-dd"));
                                                        }}
                                                        disabled={(date) =>
                                                            date > new Date() || date < new Date("2024-01-01")
                                                        }
                                                        initialFocus
                                                        locale={ptBR}
                                                        className="p-3"
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="entrada_hora"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                                                    Entrada <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Clock className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                                                        <Input
                                                            placeholder="00:00"
                                                            className={cn(
                                                                "pl-12 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                                                                form.formState.errors.entrada_hora && "border-red-500 focus-visible:ring-red-200"
                                                            )}
                                                            {...field}
                                                            readOnly={isFixingInconsistency && !!record?.entrada_hora}
                                                            onChange={(e) => field.onChange(timeMask(e.target.value))}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="entrada_km"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                                                    KM Entrada {isMotoboyUser && <span className="text-red-500">*</span>}
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Gauge className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                                                        <Input
                                                            placeholder=""
                                                            className={cn(
                                                                "pl-12 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                                                                form.formState.errors.entrada_km && "border-red-500 focus-visible:ring-red-200"
                                                            )}
                                                            {...field}
                                                            readOnly={isFixingInconsistency && record?.entrada_km != null}
                                                            onChange={(e) => {
                                                                field.onChange(kmMask(e.target.value));
                                                                if (form.getValues('saida_km')) {
                                                                    form.trigger("saida_km");
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="saida_hora"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                                                    Saída
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Clock className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                                                        <Input
                                                            placeholder="00:00"
                                                            className={cn(
                                                                "pl-12 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                                                                form.formState.errors.saida_hora && "border-red-500 focus-visible:ring-red-200"
                                                            )}
                                                            {...field}
                                                            onChange={(e) => {
                                                                field.onChange(timeMask(e.target.value));
                                                                if (form.formState.errors.saida_km || form.getValues('saida_km')) {
                                                                    form.trigger("saida_km");
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="saida_km"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                                                    KM Saída {isMotoboyUser && form.watch('saida_hora') && <span className="text-red-500">*</span>}
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Gauge className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                                                        <Input
                                                            placeholder=""
                                                            className={cn(
                                                                "pl-12 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                                                                form.formState.errors.saida_km && "border-red-500 focus-visible:ring-red-200"
                                                            )}
                                                            {...field}
                                                            onChange={(e) => {
                                                                field.onChange(kmMask(e.target.value));
                                                                if (form.formState.errors.saida_hora || form.getValues('saida_hora')) {
                                                                    form.trigger("saida_hora");
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="bg-slate-50/50 p-5 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
                                    <FormField
                                        control={form.control}
                                        name="observacao"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70 flex items-center gap-2">
                                                    <Edit2 className="w-4 h-4 text-blue-500" />
                                                    Observações / Justificativa
                                                </FormLabel>
                                                <FormControl>
                                                    <textarea
                                                        className={cn(
                                                            "w-full min-h-[100px] p-4 rounded-2xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-none shadow-inner",
                                                            form.formState.errors.observacao && "border-red-500"
                                                        )}
                                                        placeholder="Digite observações importantes sobre este registro..."
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-[10px] text-blue-700 text-center font-medium animate-in fade-in slide-in-from-top-1">
                                    <span className="font-black uppercase tracking-widest block mb-0.5">Recálculo Automático</span>
                                    Os status e o saldo de horas serão atualizados após salvar.
                                </div>
                            </div>

                            {isManualMode && selectedCollaboratorId && !hasTurnos && (
                                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 rounded-2xl animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle className="font-bold">Bloqueio de Registro</AlertTitle>
                                    <AlertDescription className="text-xs">
                                        Este colaborador não possui turnos cadastrados. Configure os turnos no cadastro do colaborador para lançar horas.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </form>
                    </Form>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        className="w-full h-11 rounded-xl border-gray-200 font-medium text-gray-700 hover:bg-white transition-colors"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        form="time-record-form"
                        disabled={isPending || (isManualMode && !!selectedCollaboratorId && !hasTurnos)}
                        className="w-full h-11 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                {isEditMode ? "Salvar Alterações" : isInclusionMode ? "Salvar Inclusão" : "Criar Registro"}
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
