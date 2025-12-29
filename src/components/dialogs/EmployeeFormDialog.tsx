import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PERFIL_MOTOBOY } from "@/constants";
import { messages } from "@/constants/messages";
import { useCreateClient, useCreateEmployee, useRoles, useUpdateEmployee } from "@/hooks";
import { useClientSelection } from "@/hooks/ui/useClientSelection";
import { cn } from "@/lib/utils";
import { cpfSchema, emailSchema } from "@/schemas/common";
import { Perfil, Usuario } from "@/types/database";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { getPerfilLabel } from "@/utils/formatters";
import { cpfMask } from "@/utils/masks";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase,
  Check,
  ChevronsUpDown,
  Clock,
  Loader2,
  Mail,
  Plus,
  Trash2,
  User,
  Wand2,
  X,
  Zap
} from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";


interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingEmployee?: Usuario | null;
}

export function EmployeeFormDialog({
  isOpen,
  onClose,
  editingEmployee = null,
}: EmployeeFormProps) {
  const allSections = ["dados-pessoais", "dados-profissionais", "turnos"];
  const [openAccordionItems, setOpenAccordionItems] = useState(allSections);
  
  const { data: roles } = useRoles();
  const { data: clients } = useClientSelection(editingEmployee?.cliente_id, { enabled: isOpen });
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();

  const employeeSchema = z.object({
    nome_completo: z.string().min(1, "Nome completo é obrigatório"),
    email: emailSchema,
    cpf: cpfSchema,
    perfil_id: z.string().min(1, "Cargo é obrigatório"),
    cliente_id: z.string().optional().nullable(),
    ativo: z.boolean().default(true),
    turnos: z.array(z.object({
      hora_inicio: z.string().min(1, "Obrigatório"),
      hora_fim: z.string().min(1, "Obrigatório"),
    })).min(1, "Ao menos um turno é necessário"),
  }).superRefine((data, ctx) => {
    if (roles) {
        const selectedPerfil = roles.find(r => r.id.toString() === data.perfil_id);
        if (selectedPerfil?.nome === PERFIL_MOTOBOY && !data.cliente_id) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Cliente é obrigatório para motoboys",
                path: ["cliente_id"],
            });
        }
    }

    // Validação de Conflito de Turnos e Regras de Negócio
    if (data.turnos?.length > 0) {
      const toMinutes = (time: string) => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
      };

      const getIntervals = (t: { hora_inicio?: string; hora_fim?: string }) => {
        if (!t.hora_inicio || !t.hora_fim) return [];
        const start = toMinutes(t.hora_inicio);
        const end = toMinutes(t.hora_fim);
        if (start < end) {
            return [[start, end]];
        } else {
            // Overnight: [Start, 1440] AND [0, End]
            return [[start, 1440], [0, end]];
        }
      };

      for (let i = 0; i < data.turnos.length; i++) {
        const t = data.turnos[i];
        const start = toMinutes(t.hora_inicio);
        const end = toMinutes(t.hora_fim);

        // Rule 1: Duration Check (>= 60 mins)
        // Handle overnight duration
        let duration = 0;
        if (start < end) {
            duration = end - start;
        } else {
            duration = (1440 - start) + end;
        }

        if (duration < 60) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Turno deve ter no mínimo 1 hora",
                path: ["turnos", i, "hora_fim"],
            });
        }

        // Rule 2: Overlaps
        for (let j = i + 1; j < data.turnos.length; j++) {
            const t1 = data.turnos[i];
            const t2 = data.turnos[j];

            const intervals1 = getIntervals(t1);
            const intervals2 = getIntervals(t2);

            let hasOverlap = false;

            for (const [s1, e1] of intervals1) {
                for (const [s2, e2] of intervals2) {
                    if (s1 < e2 && s2 < e1) {
                        hasOverlap = true;
                        break;
                    }
                }
                if (hasOverlap) break;
            }

            if (hasOverlap) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Conflito com outro turno",
                    path: ["turnos", j, "hora_inicio"],
                });
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Conflito com outro turno",
                    path: ["turnos", i, "hora_inicio"],
                });
            }
        }
      }
    }
  });

  type EmployeeFormData = z.infer<typeof employeeSchema>;

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      nome_completo: "",
      email: "",
      cpf: "",
      perfil_id: "",
      cliente_id: null,
      ativo: true,
      turnos: [{ hora_inicio: "08:00", hora_fim: "18:00" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "turnos",
  });

  useEffect(() => {
    if (isOpen) {
      if (editingEmployee) {
        form.reset({
          nome_completo: editingEmployee.nome_completo,
          email: editingEmployee.email,
          cpf: editingEmployee.cpf,
          perfil_id: editingEmployee.perfil_id.toString(),
          cliente_id: editingEmployee.cliente_id?.toString() || null,
          ativo: editingEmployee.ativo,
          turnos: editingEmployee.turnos?.map(t => ({
            hora_inicio: t.hora_inicio.substring(0, 5),
            hora_fim: t.hora_fim.substring(0, 5)
          })) || [{ hora_inicio: "08:00", hora_fim: "18:00" }],
        });
      } else {
        form.reset({
          nome_completo: "",
          email: "",
          cpf: "",
          perfil_id: "",
          cliente_id: null,
          ativo: true,
          turnos: [{ hora_inicio: "08:00", hora_fim: "18:00" }],
        });
      }
      setOpenAccordionItems(allSections);
    }
  }, [isOpen, editingEmployee, form]);

  const onFormError = () => {
    toast.error(messages.validacao.formularioComErros);
  };

  const { mutateAsync: createClientAsync } = useCreateClient();

  const handleFillMock = async () => {
    let clientId = clients?.[0]?.id;
    
    const mockData = mockGenerator.employee(clientId);
    const formData = {
      nome_completo: mockData.nome_completo,
      email: mockData.email,
      cpf: mockData.cpf,
      perfil_id: roles && roles.length > 0 ? roles[0].id.toString() : "",
      cliente_id: mockData.cliente_id?.toString() || null,
      ativo: true, // Mock data usually active
      turnos: mockData.turnos.map(t => ({
        hora_inicio: t.hora_inicio.substring(0, 5),
        hora_fim: t.hora_fim.substring(0, 5)
      })),
    };
    
    form.reset(formData);
    setOpenAccordionItems(allSections);
    toast.success("Campos preenchidos com dados de teste!");
  };

  const handleQuickCreate = async () => {
    try {
      let clientId = clients?.[0]?.id;
      
      if (!clientId) {
        toast.info("Nenhum cliente encontrado. Gerando um novo cliente primeiro...");
        const newClient = await createClientAsync(mockGenerator.client());
        clientId = newClient.id;
      }

      const mockData = mockGenerator.employee(clientId);
      const finalData = {
        ...mockData,
        perfil_id: roles && roles.length > 0 ? roles[1].id : 2, 
        cliente_id: mockData.cliente_id,
      };

      await createEmployee.mutateAsync(finalData as any);
      toast.success("Funcionário criado rapidamente!");
      safeCloseDialog(() => onClose());
    } catch (error: any) {
      toast.error("Erro no Quick Create", { description: error.message });
    }
  };

  const onSubmit = async (values: EmployeeFormData) => {
    try {
      const selectedPerfil = roles?.find(r => r.id.toString() === values.perfil_id);
      const isMotoboy = selectedPerfil?.nome === PERFIL_MOTOBOY;

      const data = {
        ...values,
        perfil_id: parseInt(values.perfil_id),
        cliente_id: values.cliente_id ? parseInt(values.cliente_id) : null,
      };

      if (editingEmployee) {
        await updateEmployee.mutateAsync({ id: editingEmployee.id, ...data });
      } else {
        await createEmployee.mutateAsync(data as any);
      }
      safeCloseDialog(() => onClose());
    } catch (error) {
      console.error(error);
    }
  };

  const selectedPerfilId = form.watch("perfil_id");
  const selectedPerfil = roles?.find(r => r.id.toString() === selectedPerfilId);
  const isMotoboy = selectedPerfil?.nome === PERFIL_MOTOBOY;


  const isPending = createEmployee.isPending || updateEmployee.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={() => safeCloseDialog(onClose)}>
      <DialogContent 
        className="w-full max-w-2xl p-0 gap-0 bg-gray-50 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        <div className="bg-primary p-4 text-center relative shrink-0">
          <div className="absolute left-4 top-4 flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-8 w-8"
              onClick={handleFillMock}
              title="Preencher com dados fictícios"
            >
              <Wand2 className="h-4 w-4" />
            </Button>
            {!editingEmployee && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-cyan-300 hover:bg-white/10 rounded-full h-8 w-8"
                onClick={handleQuickCreate}
                title="Criação Rápida (Um clique)"
              >
                <Zap className="h-4 w-4" />
              </Button>
            )}
          </div>

          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Fechar</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
            <User className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            {editingEmployee ? "Editar Funcionário" : "Novo Funcionário"}
          </DialogTitle>
          <DialogDescription className="text-white/80 text-sm mt-1">
            {editingEmployee
              ? "Ajuste as informações do perfil do funcionário."
              : "Preencha os dados para cadastrar um novo funcionário."}
          </DialogDescription>
        </div>

        <div className="p-4 sm:p-6 pt-2 bg-white flex-1 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-4">
              <Accordion 
                type="multiple" 
                value={openAccordionItems} 
                onValueChange={setOpenAccordionItems}
                className="w-full"
              >
                <AccordionItem value="dados-pessoais" className="border-b-0">
                  <AccordionTrigger className="hover:no-underline py-2">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                      <User className="w-5 h-5 text-primary" />
                      Dados Pessoais
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-1 pt-2 pb-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nome_completo"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Nome Completo <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Nome completo" className="h-11 rounded-xl bg-gray-50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                                <Input placeholder="email@exemplo.com" className="pl-12 h-11 rounded-xl bg-gray-50" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cpf"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CPF <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input
                                placeholder="000.000.000-00"
                                className="h-11 rounded-xl bg-gray-50"
                                {...field}
                                onChange={(e) => field.onChange(cpfMask(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="dados-profissionais" className="mt-2 border-b-0">
                  <AccordionTrigger className="hover:no-underline py-2">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                      <Briefcase className="w-5 h-5 text-primary" />
                      Dados Profissionais
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-1 pt-2 pb-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="perfil_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cargo / Permissão <span className="text-red-500">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-200">
                                  <SelectValue placeholder="Selecione o cargo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {roles?.map((role: Perfil) => (
                                  <SelectItem key={role.id} value={role.id.toString()}>
                                    {getPerfilLabel(role.nome)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                          <FormField
                        control={form.control}
                        name="cliente_id"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>
                              Cliente Atual 
                              {isMotoboy && <span className="text-red-500"> *</span>}
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full justify-between h-11 rounded-xl bg-gray-50 border-gray-200 font-normal hover:bg-white",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value
                                      ? clients?.find((client: any) => client.id.toString() === field.value)?.nome_fantasia
                                      : "Selecione o cliente"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                  <CommandInput placeholder="Buscar cliente..." />
                                  <CommandList>
                                    <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                                    <CommandGroup>
                                        <CommandItem
                                          value="Nenhum cliente selecionado"
                                          onSelect={() => {
                                            form.setValue("cliente_id", null);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              !field.value ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          Nenhum cliente selecionado
                                        </CommandItem>
                                      {clients?.map((client: any) => (
                                        <CommandItem
                                          value={client.nome_fantasia}
                                          key={client.id}
                                          onSelect={() => {
                                            form.setValue("cliente_id", client.id.toString());
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              client.id.toString() === field.value ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          {client.nome_fantasia}
                                          {!client.ativo && <span className="ml-2 text-xs text-red-500">(Inativo)</span>}
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
                    </div>

                    <FormField
                      control={form.control}
                      name="ativo"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-gray-50/50">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Funcionario Ativo</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Define se o funcionário pode acessar o sistema.
                            </div>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="turnos" className="mt-2 border-b-0">
                  <AccordionTrigger className="hover:no-underline py-2">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                      <Clock className="w-5 h-5 text-primary" />
                      Turnos de Trabalho
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-1 pt-2 pb-4 space-y-4">
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 relative group">
                          <div className="grid grid-cols-2 gap-4 flex-1">
                            <FormField
                              control={form.control}
                              name={`turnos.${index}.hora_inicio`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Entrada</FormLabel>
                                  <FormControl>
                                    <Input type="time" className="h-10 rounded-xl bg-white" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`turnos.${index}.hora_fim`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Saída</FormLabel>
                                  <FormControl>
                                    <Input type="time" className="h-10 rounded-xl bg-white" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ hora_inicio: "08:00", hora_fim: "18:00" })}
                        className="w-full h-11 border-dashed border-2 rounded-2xl text-primary hover:bg-primary/5 hover:border-primary gap-2 transition-all"
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar Novo Período
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

              </Accordion>
            </form>
          </Form>
        </div>

        <div className="p-4 border-t bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => safeCloseDialog(() => onClose())}
            disabled={isPending}
            className="h-11 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-100 font-medium"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit, onFormError)}
            disabled={isPending}
            className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg transition-all active:scale-95"
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : editingEmployee ? (
              "Atualizar"
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
