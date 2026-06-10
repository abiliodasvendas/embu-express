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
import { Switch } from "@/components/ui/switch";
import { useCreateConvenio, useUpdateConvenio } from "@/hooks/api/useConvenios";
import { cn } from "@/lib/utils";
import { Convenio } from "@/types/database";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Handshake, Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ConvenioFormValues, convenioSchema } from "@/schemas/convenioSchema";

interface ConvenioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  convenioToEdit?: Convenio | null;
}

export function ConvenioFormDialog({
  open,
  onOpenChange,
  convenioToEdit,
}: ConvenioFormDialogProps) {
  const createConvenio = useCreateConvenio();
  const updateConvenio = useUpdateConvenio();

  const isEditing = !!convenioToEdit;
  const isLoading = createConvenio.isPending || updateConvenio.isPending;

  const form = useForm<ConvenioFormValues>({
    resolver: zodResolver(convenioSchema),
    defaultValues: {
      nome: "",
      ativo: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (convenioToEdit) {
        form.reset({
          nome: convenioToEdit.nome,
          ativo: convenioToEdit.ativo,
        });
      } else {
        form.reset({
          nome: "",
          ativo: true,
        });
      }
    }
  }, [open, convenioToEdit, form]);

  const onSubmit = async (values: ConvenioFormValues) => {
    try {
      if (isEditing && convenioToEdit) {
        await updateConvenio.mutateAsync({ id: convenioToEdit.id, ...values });
        toast.success("Convênio atualizado com sucesso!");
      } else {
        await createConvenio.mutateAsync(values);
        toast.success("Convênio criado com sucesso!");
      }
      onOpenChange(false);
    } catch (error) {
      const err = error as any;
      const message = err.response?.data?.message || err.message || "";
      toast.error(isEditing ? "Erro ao atualizar convênio" : "Erro ao criar convênio", {
        description: message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && safeCloseDialog(() => onOpenChange(false))}>
      <DialogContent className="w-full max-w-lg p-0 gap-0 h-auto flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl" hideCloseButton>
        <div className="bg-blue-600 p-4 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Fechar</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
            <Handshake className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            {isEditing ? "Editar Convênio" : "Novo Convênio"}
          </DialogTitle>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50/30">
          <Form {...form}>
            <form id="convenio-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="border rounded-2xl px-4 py-6 bg-white shadow-sm border-gray-100 mb-4 space-y-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                        Nome do Convênio / Estabelecimento <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Handshake className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="Ex: Oficina do João, AutoPeças Silva"
                            className={cn(
                              "pl-12 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                              form.formState.errors.nome && "border-red-500 focus-visible:ring-red-200"
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
            onClick={() => safeCloseDialog(() => onOpenChange(false))}
            disabled={isLoading}
            className="w-full h-11 rounded-xl border-gray-200 font-medium text-gray-700 hover:bg-white"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="convenio-form"
            disabled={isLoading}
            className="w-full h-11 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isEditing ? (
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
