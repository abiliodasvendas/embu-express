import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useActiveEmployees, useCreatePonto } from "@/hooks";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, ChevronsUpDown, Clock, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  usuario_id: z.string().min(1, "Selecione um funcionário"),
  data: z.string().min(1, "Selecione a data"),
  entrada_hora: z.string().min(1, "Horário de entrada obrigatório"),
  saida_hora: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ManualTimeRecordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManualTimeRecordDialog({ isOpen, onClose }: ManualTimeRecordDialogProps) {
  const { mutateAsync: createPonto, isPending } = useCreatePonto();
  const [openCombobox, setOpenCombobox] = useState(false);

  // Fetch employees only when dialog is open
  const { data: employees = [] } = useActiveEmployees({ enabled: isOpen });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      usuario_id: "",
      data: format(new Date(), "yyyy-MM-dd"),
      entrada_hora: "",
      saida_hora: "",
    },
  });

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  useEffect(() => {
     if (isOpen) {
         form.reset({
             usuario_id: "",
             data: format(new Date(), "yyyy-MM-dd"),
             entrada_hora: "",
             saida_hora: "",
         });
         setOpenCombobox(false);
     }
  }, [isOpen, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const baseDate = values.data; // YYYY-MM-DD
      // Construtor: YYYY-MM-DD + T + HH:mm + :00
      // O navegador interpreta isso como Hora Local.
      // .toISOString() converte para UTC (adiciona Z).
      const entradaDate = new Date(`${baseDate}T${values.entrada_hora}:00`);
      const entradaIso = entradaDate.toISOString();
      
      let saidaIso = null;
      if (values.saida_hora) {
          const saidaDate = new Date(`${baseDate}T${values.saida_hora}:00`);

          // Se saida < entrada (ex: Entrou 22h, Saiu 05h), assume dia seguinte
          if (saidaDate < entradaDate) {
              saidaDate.setDate(saidaDate.getDate() + 1);
          }
          saidaIso = saidaDate.toISOString();
      }

      await createPonto({
        usuario_id: values.usuario_id,
        data_referencia: values.data,
        entrada_hora: entradaIso,
        entrada_km: null, // DB updated to allow NULL (requires migration)
        saida_hora: saidaIso,
        saida_km: null, // DB updated to allow NULL
      });

      handleClose();
    } catch (error) {
      console.error("Erro ao criar registro:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent 
        className="w-full max-w-md p-0 gap-0 bg-white h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        {/* Header */}
        <div className="bg-blue-600 p-6 text-center relative shrink-0">
            <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors" onClick={handleClose}>
                <Plus className="h-6 w-6 rotate-45" /> 
                <span className="sr-only">Close</span>
            </DialogClose>

            <div className="mx-auto bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm">
                <Clock className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">
                Novo Registro Manual
            </DialogTitle>
            <DialogDescription className="text-blue-100/90 text-sm mt-1">
                Lançamento manual de horas para funcionário
            </DialogDescription>
        </div>

        {/* Form Body */}
        <div className="p-6 bg-white flex-1 overflow-y-auto space-y-6">
            <Form {...form}>
            <form id="create-ponto-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField
                control={form.control}
                name="usuario_id"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Funcionário</FormLabel>
                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                                "w-full justify-between h-12 rounded-xl text-left font-normal border-gray-200 bg-gray-50 hover:bg-white hover:border-blue-300 transition-all",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value
                                ? employees.find((employee) => employee.id.toString() === field.value)?.nome_completo
                                : "Selecione o funcionário..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                            <CommandInput placeholder="Buscar funcionário..." />
                            <CommandList>
                                <CommandEmpty>Nenhum funcionário encontrado.</CommandEmpty>
                                <CommandGroup>
                                {employees.map((employee) => (
                                    <CommandItem
                                    value={employee.nome_completo} // Search by name
                                    key={employee.id}
                                    onSelect={() => {
                                        form.setValue("usuario_id", employee.id.toString());
                                        setOpenCombobox(false);
                                    }}
                                    >
                                    <Check
                                        className={cn(
                                        "mr-2 h-4 w-4",
                                        employee.id.toString() === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                    />
                                    {employee.nome_completo}
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

                <FormField
                control={form.control}
                name="data"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Data de Referência</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "h-12 w-full pl-3 text-left font-normal border-gray-200 bg-gray-50 hover:bg-white hover:border-blue-300 rounded-xl",
                                        !field.value && "text-muted-foreground"
                                    )}
                                >
                                    {field.value ? (
                                        format(new Date(field.value), "dd 'de' MMMM, yyyy", { locale: ptBR })
                                    ) : (
                                        <span>Selecione a data</span>
                                    )}
                                    <Clock className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value ? new Date(field.value + "T00:00:00") : undefined}
                                onSelect={(e) => {
                                    if(e) field.onChange(format(e, "yyyy-MM-dd"));
                                }}
                                disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                                locale={ptBR}
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
                        <FormLabel className="flex items-center gap-1.5 text-gray-700">
                             <Clock className="w-4 h-4 text-blue-600" /> Entrada *
                        </FormLabel>
                        <FormControl>
                            <Input 
                                type="time" 
                                className="h-12 text-lg font-semibold text-center bg-gray-50 border-gray-200 rounded-xl focus:border-blue-500"
                                {...field} 
                            />
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
                        <FormLabel className="flex items-center gap-1.5 text-gray-700">
                            <Clock className="w-4 h-4 text-orange-600" /> Saída
                        </FormLabel>
                        <FormControl>
                            <Input 
                                type="time" 
                                className="h-12 text-lg font-semibold text-center bg-gray-50 border-gray-200 rounded-xl focus:border-blue-500"
                                {...field} 
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            </form>
            </Form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
            <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="w-full h-11 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-100 font-medium"
            >
              Cancelar
            </Button>
            <Button 
                type="submit" 
                form="create-ponto-form"
                disabled={isPending}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Registro
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
