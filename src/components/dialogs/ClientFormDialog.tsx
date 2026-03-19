import { CepInput } from "@/components/forms";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { FieldErrors } from "react-hook-form";
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
import { cn } from "@/lib/utils";
import { Client } from "@/types/database";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { cepMask, cnpjMask } from "@/utils/masks";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Building2,
    FileText,
    Hash,
    Loader2,
    MapPin,
    Wand2,
    X,
    Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { ClientFormData, clientSchema } from "@/schemas/clientSchema";

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
  const [openAccordionItems, setOpenAccordionItems] = useState([
    "dados-cliente",
    "endereco",
  ]);
  const [isCepLoading, setIsCepLoading] = useState(false);

  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nome_fantasia: "",
      ativo: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (editingClient) {
        form.reset({
          nome_fantasia: editingClient.nome_fantasia,
          ativo: editingClient.ativo,
        });
        setOpenAccordionItems(["dados-cliente"]);
      } else {
        form.reset({
          nome_fantasia: "",
          ativo: true,
        });
        setOpenAccordionItems(["dados-cliente"]);
      }
    }
  }, [isOpen, editingClient, form]);

  const onFormError = (errors: FieldErrors<ClientFormData>) => {
    console.error("Erros de validação:", errors);
    toast.error(messages.validacao.formularioComErros);
  };

  const handleFillMock = () => {
    const data = mockGenerator.client();
    form.reset({
      ...data,
    });
  };

  const handleQuickCreate = async () => {
    try {
      const clientData = {
        nome_fantasia: "Cliente Rápido " + Math.floor(Math.random() * 1000),
        ativo: true,
      };
      await createClient.mutateAsync(clientData);
      toast.success(messages.cliente.sucesso.criado);
      safeCloseDialog(() => onClose());
    } catch (error: any) {
      toast.error(messages.cliente.erro.criar, { description: error.message });
    }
  };

  const onSubmit = async (values: ClientFormData) => {
    try {
      if (editingClient) {
        await updateClient.mutateAsync({ 
          id: editingClient.id, 
          ...values, 
          silent: true 
        });
      } else {
        await createClient.mutateAsync({ 
          ...values, 
          silent: true 
        });
      }
      safeCloseDialog(() => onClose());
      onSuccess?.();
    } catch (error: any) {
      console.error("Erro ao salvar cliente:", error);
      const errorMessage = error.response?.data?.error || error.message || "";
      toast.error(errorMessage || (editingClient ? messages.cliente.erro.atualizar : messages.cliente.erro.criar));
    }
  };

  const isPending = createClient.isPending || updateClient.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={() => safeCloseDialog(onClose)}>
      <DialogContent
        className="w-full max-w-lg p-0 gap-0 bg-gray-50 h-auto flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        <div className="bg-blue-600 p-4 text-center relative shrink-0">
          <div className="absolute left-4 top-4 flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full h-10 w-10 shadow-sm border border-white/20"
              onClick={handleFillMock}
              title="Preencher com dados fictícios"
            >
              <Wand2 className="h-5 w-5" />
            </Button>
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
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50/30">
          <Form {...form}>
            <form id="client-form"
              onSubmit={form.handleSubmit(onSubmit, onFormError)}
              className="space-y-4"
            >
              <div className="border rounded-2xl px-4 py-6 bg-white shadow-sm border-gray-100 mb-4 space-y-4">
                <FormField
                  control={form.control}
                  name="nome_fantasia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                        Nome Fantasia{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="Ex: Logística ABC"
                            className={cn(
                              "pl-12 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                              form.formState.errors.nome_fantasia && "border-red-500 focus-visible:ring-red-200"
                            )}
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
                  name="ativo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border p-2 px-4 bg-gray-50/50">
                      <div className="space-y-0.5">
                        <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                          Status Ativo
                        </FormLabel>
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
              </div>
            </form>
          </Form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => safeCloseDialog(() => onClose())}
            disabled={isPending}
            className="w-full h-11 rounded-xl border-gray-200 font-medium text-gray-700 hover:bg-white"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="client-form"
            disabled={isPending}
            className="w-full h-11 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
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
