import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useActiveCollaborators, useCreatePonto } from "@/hooks";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { cn } from "@/lib/utils";
import { ManualTimeRecordFormValues, manualTimeRecordSchema } from "@/schemas/pontoSchema";
import { TimeRules } from "@/utils/timeRules";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, Calendar as CalendarIcon, Check, ChevronsUpDown, Clock, Loader2, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";


interface ManualTimeRecordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManualTimeRecordDialog({ isOpen, onClose }: ManualTimeRecordDialogProps) {
  const { mutateAsync: createPonto, isPending } = useCreatePonto();
  const [openCombobox, setOpenCombobox] = useState(false);

  const { data: collaborators = [] } = useActiveCollaborators({ enabled: isOpen });

  const form = useForm<ManualTimeRecordFormValues>({
    resolver: zodResolver(manualTimeRecordSchema),
    defaultValues: {
      usuario_id: "",
      data_referencia: format(new Date(), "yyyy-MM-dd"),
      entrada_hora: "",
      saida_hora: "",
    },
  });

  const selectedCollaboratorId = form.watch("usuario_id");
  const selectedCollaborator = collaborators.find(c => c.id.toString() === selectedCollaboratorId);
  const hasTurnos = selectedCollaborator?.links && selectedCollaborator.links.length > 0;

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  useEffect(() => {
     if (isOpen) {
         form.reset({
             usuario_id: "",
             data_referencia: format(new Date(), "yyyy-MM-dd"),
             entrada_hora: "",
             saida_hora: "",
         });
         setOpenCombobox(false);
     }
  }, [isOpen, form]);

  const onSubmit = async (values: ManualTimeRecordFormValues) => {
    try {
      const { entrada, saida } = TimeRules.resolveDates(values.data_referencia, values.entrada_hora, values.saida_hora || undefined);

      if (saida) {
          const checkMax = TimeRules.validateMaxDuration(entrada, saida, 16);
          if (!checkMax.valid) {
              toast.error("Erro na validação", { description: checkMax.message });
              return;
          }
      }

      await createPonto({
        usuario_id: values.usuario_id,
        data_referencia: values.data_referencia,
        entrada_hora: entrada.toISOString(),
        entrada_km: null, 
        saida_hora: saida ? saida.toISOString() : null,
        saida_km: null, 
      });

      handleClose();
    } catch (error) {
      console.error("Erro ao criar registro:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent 
        className="w-full max-w-md p-0 gap-0 bg-gray-50 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        <div className="bg-blue-600 p-4 text-center relative shrink-0">
            <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors" onClick={handleClose}>
                <X className="h-6 w-6" /> 
                <span className="sr-only">Fechar</span>
            </DialogClose>

            <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
                <Clock className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">
                Novo Registro Manual
            </DialogTitle>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent bg-gray-50/30">
            <Form {...form}>
            <form id="create-ponto-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                    <FormField
                        control={form.control}
                        name="usuario_id"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel className="text-gray-700 font-bold">Colaborador <span className="text-red-500">*</span></FormLabel>
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
                            <div className="flex items-start gap-2 mt-2 px-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1.5 shrink-0">Turno(s):</span>
                                <div className="flex flex-wrap gap-1.5 font-mono">
                                    {field.value ? (
                                        (() => {
                                            const selectedEmp = collaborators.find(e => e.id.toString() === field.value);
                                            if (selectedEmp?.links && selectedEmp.links.length > 0) {
                                                return selectedEmp.links.map((link, idx) => (
                                                    <span 
                                                        key={link.id || idx}
                                                        className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 w-fit whitespace-nowrap"
                                                    >
                                                        {link.hora_inicio.slice(0, 5)} - {link.hora_fim.slice(0, 5)}
                                                    </span>
                                                ));
                                            }
                                            return <span className="text-[10px] text-gray-400 mt-1 italic">Sem turno definido</span>;
                                        })()
                                    ) : (
                                        <span className="text-[10px] text-gray-400 mt-1">-</span>
                                    )}
                                </div>
                            </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="data_referencia"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel className="text-gray-700 font-bold">Data de Referência <span className="text-red-500">*</span></FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "h-11 w-full pl-3 text-left font-normal border-gray-200 bg-gray-50 hover:bg-white hover:border-blue-300 rounded-xl transition-all",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="h-4 w-4 text-gray-400" />
                                                {field.value ? (
                                                    format(new Date(field.value), "dd 'de' MMMM, yyyy", { locale: ptBR })
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
                                            if(e) field.onChange(format(e, "yyyy-MM-dd"));
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
                            <FormLabel className="text-gray-700 font-bold">Entrada <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input 
                                        type="time" 
                                        className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors font-mono"
                                        {...field} 
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <FormField
                        control={form.control}
                        name="saida_hora"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="text-gray-700 font-bold">Saída</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input 
                                        type="time" 
                                        className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors font-mono"
                                        {...field} 
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                </div>

                {selectedCollaboratorId && !hasTurnos && (
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
                form="create-ponto-form"
                disabled={isPending || (!!selectedCollaboratorId && !hasTurnos)}
                className="w-full h-11 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Criar Registro"
              )}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
