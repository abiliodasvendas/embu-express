import { CepInput } from "@/components/forms";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { messages } from "@/constants/messages";
import { useCreateClient, useUpdateClient } from "@/hooks";
import { cepSchema, cnpjSchema } from "@/schemas/common";
import { Client } from "@/types/database";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { cepMask, cnpjMask } from "@/utils/masks";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { validateEnderecoFields } from "@/utils/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, FileText, Hash, Loader2, MapPin, Wand2, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const clientSchema = z
  .object({
    nome_fantasia: z.string().min(1, "Nome Fantasia é obrigatório"),
    razao_social: z.string().min(1, "Razão Social é obrigatória"),
    cnpj: cnpjSchema,
    cep: cepSchema.or(z.literal("")).refine((val) => !!val, "CEP é obrigatório"),
    logradouro: z.string().min(1, "Logradouro é obrigatório"),
    numero: z.string().min(1, "Número é obrigatório"),
    complemento: z.string().optional(),
    bairro: z.string().min(1, "Bairro é obrigatório"),
    cidade: z.string().min(1, "Cidade é obrigatória"),
    estado: z.string().min(2, "Estado é obrigatório"),
    ativo: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    const validation = validateEnderecoFields(
      data.cep || "",
      data.logradouro,
      data.numero
    );

    if (validation.errors.cep) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.errors.cep,
        path: ["cep"],
      });
    }
    if (validation.errors.logradouro) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.errors.logradouro,
        path: ["logradouro"],
      });
    }
    if (validation.errors.numero) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.errors.numero,
        path: ["numero"],
      });
    }
  });

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingClient?: Client | null;
  onSuccess?: () => void;
  profile?: any;
  allowBatchCreation?: boolean;
}

export function ClientFormDialog({
  isOpen,
  onClose,
  editingClient = null,
  onSuccess, // Add this if missing
  profile, // Add this if missing
  allowBatchCreation = false, // Add this if missing
}: ClientFormDialogProps) {
  const [openAccordionItems, setOpenAccordionItems] = useState(["dados-cliente", "endereco"]);
  const [isCepLoading, setIsCepLoading] = useState(false);
  
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nome_fantasia: "",
      razao_social: "",
      cnpj: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      ativo: true,
    },
  });

  const cep = form.watch("cep");
  const logradouro = form.watch("logradouro");
  const numero = form.watch("numero");



  useEffect(() => {
    if (isOpen) {
      if (editingClient) {
        form.reset({
          nome_fantasia: editingClient.nome_fantasia,
          razao_social: editingClient.razao_social || "",
          cnpj: cnpjMask(editingClient.cnpj || ""),
          cep: cepMask(editingClient.cep || ""),
          logradouro: editingClient.logradouro || "",
          numero: editingClient.numero || "",
          complemento: editingClient.complemento || "",
          bairro: editingClient.bairro || "",
          cidade: editingClient.cidade || "",
          estado: editingClient.estado || "",
          ativo: editingClient.ativo,
        });
        setOpenAccordionItems(["dados-cliente", "endereco"]);
      } else {
        form.reset({
          nome_fantasia: "",
          razao_social: "",
          cnpj: "",
          cep: "",
          logradouro: "",
          numero: "",
          complemento: "",
          bairro: "",
          cidade: "",
          estado: "",
          ativo: true,
        });
        setOpenAccordionItems(["dados-cliente", "endereco"]);
      }
    }
  }, [isOpen, editingClient, form]);

  const onFormError = () => {
    toast.error(messages.validacao.formularioComErros);
  };

  const handleFillMock = () => {
    const mockData = mockGenerator.client();
    form.reset(mockData);
    setOpenAccordionItems(["dados-cliente", "endereco"]);
    toast.success("Campos preenchidos com dados de teste!");
  };

  const handleQuickCreate = async () => {
    try {
      const mockData = mockGenerator.client();
      const clientData = {
        ...mockData,
        ativo: true,
      };
      await createClient.mutateAsync(clientData as any);
      toast.success("Cliente criado rapidamente!");
      safeCloseDialog(() => onClose());
    } catch (error: any) {
      toast.error("Erro no Quick Create", { description: error.message });
    }
  };

  const onSubmit = async (values: ClientFormData) => {
    try {
      const data = {
        nome_fantasia: values.nome_fantasia,
        razao_social: values.razao_social,
        cnpj: values.cnpj.replace(/\D/g, ""),
        ativo: values.ativo,
        cep: values.cep.replace(/\D/g, ""),
        logradouro: values.logradouro,
        numero: values.numero,
        complemento: values.complemento,
        bairro: values.bairro,
        cidade: values.cidade,
        estado: values.estado,
      };

      if (editingClient) {
        await updateClient.mutateAsync({ id: editingClient.id, ...data });
      } else {
        await createClient.mutateAsync(data);
      }
      safeCloseDialog(() => onClose());
    } catch (error) {
      console.error(error);
    }
  };

  const isPending = createClient.isPending || updateClient.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={() => safeCloseDialog(onClose)}>
      <DialogContent 
        className="w-full max-w-2xl p-0 gap-0 bg-gray-50 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        {/* ... (dialog header not changing) ... */}
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
            {!editingClient && (
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
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            {editingClient ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
          <DialogDescription className="text-white/80 text-sm mt-1">
            {editingClient
              ? "Ajuste as informações do cliente selecionado."
              : "Preencha os dados para cadastrar um novo cliente."}
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
                <AccordionItem value="dados-cliente" className="border-b-0">
                  <AccordionTrigger className="hover:no-underline py-2">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                      <Building2 className="w-5 h-5 text-primary" />
                      Dados do Cliente
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-1 pt-2 pb-4 space-y-4">
                    <FormField
                      control={form.control}
                      name="nome_fantasia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Fantasia <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Building2 className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                              <Input placeholder="Ex: Logística ABC" className="pl-12 h-11 rounded-xl bg-gray-50" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="razao_social"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Razão Social <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <div className="relative">
                                <FileText className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                                <Input placeholder="Ex: ABC Transportes LTDA" className="pl-12 h-11 rounded-xl bg-gray-50" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cnpj"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CNPJ <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Hash className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                                <Input
                                  placeholder="00.000.000/0000-00"
                                  className="pl-12 h-11 rounded-xl bg-gray-50"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(cnpjMask(e.target.value));
                                    form.trigger("cnpj");
                                  }}
                                />
                              </div>
                            </FormControl>
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
                            <FormLabel className="text-base">Status Ativo</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Define se o cliente está habilitado.
                            </div>
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
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="endereco" className="mt-2 border-b-0">
                  <AccordionTrigger className="hover:no-underline py-2">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                      <MapPin className="w-5 h-5 text-primary" />
                      Endereço
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-1 pt-2 pb-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <FormField
                        control={form.control}
                        name="cep"
                        render={({ field }) => (
                          <div className="md:col-span-2">
                            <CepInput
                              field={field}
                              inputClassName="h-11 rounded-xl bg-gray-50 border-gray-200 focus:border-primary transition-all"
                              onLoadingChange={setIsCepLoading}
                            />
                          </div>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="logradouro"
                        render={({ field }) => (
                          <FormItem className="md:col-span-4">
                            <FormLabel>Logradouro <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:border-primary"
                                disabled={isCepLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="numero"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Número <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:border-primary"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="complemento"
                        render={({ field }) => (
                          <FormItem className="md:col-span-4">
                            <FormLabel>Complemento</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:border-primary"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bairro"
                        render={({ field }) => (
                          <FormItem className="md:col-span-3">
                            <FormLabel>Bairro <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:border-primary"
                                disabled={isCepLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cidade"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Cidade <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:border-primary"
                                disabled={isCepLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="estado"
                        render={({ field }) => (
                          <FormItem className="md:col-span-1">
                            <FormLabel>UF <span className="text-red-500">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-200" disabled={isCepLoading}>
                                  <SelectValue placeholder="UF" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"].map((uf) => (
                                  <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
            ) : editingClient ? (
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
